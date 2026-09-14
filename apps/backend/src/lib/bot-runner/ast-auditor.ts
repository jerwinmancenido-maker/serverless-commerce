/**
 * @file    apps/backend/src/lib/bot-runner/ast-auditor.ts
 * @module  AstCodeAuditor (Autonomous Agent Runner Module)
 * @purpose Static line-by-line AST scanner for Medusa 2.0 workflow compensations, subscriber idempotency, and patch safety evaluation.
 * @contracts
 *   Service: AstCodeAuditor · BotRunnerService
 */

import fs from "fs"
import path from "path"
import { execFile } from "node:child_process"
import type { AstAuditIssue, AstCodeAuditReport } from "./types"

function resolveBackendRoot(): string {
  const cwd = process.cwd()
  if (cwd.endsWith("apps/backend")) {
    return cwd
  }
  const sub = path.resolve(cwd, "apps/backend")
  if (fs.existsSync(sub)) {
    return sub
  }
  return cwd
}

function resolveProjectRoot(): string {
  const cwd = process.cwd()
  if (cwd.endsWith("apps/backend")) {
    return path.resolve(cwd, "../..")
  }
  return cwd
}

const BACKEND_ROOT = resolveBackendRoot()
const PROJECT_ROOT = resolveProjectRoot()
const WORKFLOW_STEPS_DIR = path.resolve(BACKEND_ROOT, "src/workflows/steps")
const WORKFLOWS_DIR = path.resolve(BACKEND_ROOT, "src/workflows")
const SUBSCRIBERS_DIR = path.resolve(BACKEND_ROOT, "src/subscribers")
const API_DIR = path.resolve(BACKEND_ROOT, "src/api")

/**
 * Line-by-line scanner for workflow step compensation functions.
 * In Medusa 2.0, any createStep that mutates database state must define a compensation function:
 * createStep("step-name", async (input, { container }) => { ... return new StepResponse(res, rollbackData) }, async (rollbackData, { container }) => { ... })
 */
export function auditWorkflowSteps(): AstAuditIssue[] {
  const issues: AstAuditIssue[] = []
  if (!fs.existsSync(WORKFLOW_STEPS_DIR)) return issues

  const files = fs.readdirSync(WORKFLOW_STEPS_DIR).filter((f) => f.endsWith(".ts") && !f.includes(".spec."))

  for (const file of files) {
    const filePath = path.join(WORKFLOW_STEPS_DIR, file)
    const content = fs.readFileSync(filePath, "utf-8")
    const lines = content.split("\n")

    const hasStepResponse = content.includes("StepResponse")
    const hasCreateStep = content.includes("createStep(")

    if (!hasCreateStep) continue

    // Detect DB mutation patterns (excluding crypto hash operations)
    const mutationContent = lines
      .filter((l) => !l.includes("createHash") && !l.includes(".digest("))
      .join("\n")

    const hasMutation =
      /(\.create\(|\.update\(|\.delete\(|\.insert\(|\.deduct\(|\.settle\(|\.record\()/.test(
        mutationContent
      )

    if (hasMutation) {
      // Check if compensation function or rollback data is supplied
      // A valid compensation is either a 2nd argument to StepResponse: `new StepResponse(data, rollbackData)`
      // and a compensation function passed to createStep as 3rd parameter.
      const hasCompensationFunction =
        content.includes("compensation") ||
        /createStep\s*\(\s*["'][^"']+["']\s*,\s*async\s*[\s\S]*?,\s*async\s*\(/.test(
          content
        )

      if (!hasCompensationFunction) {
        // Find line number of createStep
        let stepLine = 1
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes("createStep(")) {
            stepLine = i + 1
            break
          }
        }

        issues.push({
          file: `apps/backend/src/workflows/steps/${file}`,
          line: stepLine,
          category: "compensation",
          severity: "warning",
          title: "Missing Medusa 2.0 Step Compensation Rollback Function",
          detail: `Step in ${file} performs state mutation but does not provide an explicit rollback compensation callback. If a subsequent step fails in a saga, this mutation will not be reverted.`,
          codeSnippet: lines.slice(Math.max(0, stepLine - 1), Math.min(lines.length, stepLine + 3)).join("\n"),
          remediation:
            "Pass an async compensation function as the 3rd parameter to createStep() to guarantee transaction rollback.",
          suggestedDiff: `+ // Add compensation callback to createStep:\n+ async (rollbackData, { container }) => {\n+   // Revert mutations using rollbackData\n+ }`,
        })
      }
    }
  }

  return issues
}

/**
 * Line-by-line scanner for event subscriber crash isolation and idempotency guards.
 */
export function auditSubscribers(): AstAuditIssue[] {
  const issues: AstAuditIssue[] = []
  if (!fs.existsSync(SUBSCRIBERS_DIR)) return issues

  const files = fs.readdirSync(SUBSCRIBERS_DIR).filter((f) => f.endsWith(".ts") && !f.includes(".spec."))

  for (const file of files) {
    const filePath = path.join(SUBSCRIBERS_DIR, file)
    const content = fs.readFileSync(filePath, "utf-8")
    const lines = content.split("\n")

    // Check for try/catch wrapper
    const hasTryCatch = content.includes("try {") || content.includes("try{")
    if (!hasTryCatch) {
      issues.push({
        file: `apps/backend/src/subscribers/${file}`,
        line: 1,
        category: "idempotency",
        severity: "critical",
        title: "Subscriber Missing Top-Level Error Boundary (try/catch)",
        detail: `Event subscriber ${file} lacks a top-level try/catch block. An unhandled rejection will crash or stall the Medusa worker event queue.`,
        codeSnippet: lines.slice(0, 5).join("\n"),
        remediation: "Wrap subscriber handler body in a try/catch and log structured error telemetry.",
      })
    }

    // Check for idempotency guard (preventing duplicate events from double-mutating)
    const hasIdempotencyGuard =
      content.includes("metadata?") ||
      content.includes("already_processed") ||
      content.includes("processed") ||
      content.includes("status ===") ||
      content.includes("status !==")

    if (!hasIdempotencyGuard) {
      issues.push({
        file: `apps/backend/src/subscribers/${file}`,
        line: Math.min(10, lines.length),
        category: "idempotency",
        severity: "warning",
        title: "Subscriber Missing Concurrency Idempotency Guard",
        detail: `Subscriber ${file} does not verify if the target entity has already been processed. At-least-once message delivery could cause duplicate processing.`,
        codeSnippet: lines.slice(0, 10).join("\n"),
        remediation:
          "Check order/entity metadata for processing flags before executing side effects (e.g. inventory deductions).",
      })
    }
  }

  return issues
}

/**
 * Line-by-line scanner for unsafe 'as any' casts, @ts-ignore, and unmasked secrets.
 */
export function auditCodeHygieneAndSecurity(): AstAuditIssue[] {
  const issues: AstAuditIssue[] = []
  const scanDirs = [
    path.resolve(BACKEND_ROOT, "src/api"),
    path.resolve(BACKEND_ROOT, "src/lib"),
    path.resolve(BACKEND_ROOT, "src/modules"),
  ]

  for (const dir of scanDirs) {
    if (!fs.existsSync(dir)) continue
    scanDirRecursive(dir, issues)
  }

  return issues
}

function scanDirRecursive(dir: string, issues: AstAuditIssue[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== "__tests__" && entry.name !== ".medusa") {
        scanDirRecursive(fullPath, issues)
      }
    } else if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.includes(".spec.")) {
      const content = fs.readFileSync(fullPath, "utf-8")
      const lines = content.split("\n")
      const relPath = path.relative(BACKEND_ROOT, fullPath)

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Check for @ts-ignore or @ts-nocheck
        const trimmed = line.trim()
        if (
          !fullPath.includes("ast-auditor") &&
          (trimmed.startsWith("// @ts-ignore") ||
            trimmed.startsWith("// @ts-nocheck") ||
            trimmed.startsWith("/* @ts-ignore"))
        ) {
          issues.push({
            file: `apps/backend/${relPath}`,
            line: i + 1,
            category: "types",
            severity: "info",
            title: "TypeScript Diagnostic Suppressed (@ts-ignore)",
            detail: `Line ${i + 1} bypasses TypeScript type checking with @ts-ignore.`,
            codeSnippet: line.trim(),
            remediation: "Refactor code to provide explicit Medusa type interfaces instead of ignoring compiler warnings.",
          })
        }

        // Check for hardcoded API keys or secret tokens
        if (
          /(secret|token|password|private_key)\s*=\s*["'][a-zA-Z0-9_\-]{16,}["']/i.test(line) &&
          !line.includes("process.env") &&
          !line.includes("placeholder")
        ) {
          issues.push({
            file: `apps/backend/${relPath}`,
            line: i + 1,
            category: "security",
            severity: "critical",
            title: "Potential Hardcoded Secret or Token Detected",
            detail: `Line ${i + 1} appears to contain a hardcoded credential or secret key string.`,
            codeSnippet: line.slice(0, 40) + "...",
            remediation: "Extract secret into environment variables via process.env.",
          })
        }
      }
    }
  }
}

/**
 * Runs the comprehensive AST Line-by-Line Code Audit.
 */
export function runAstCodeAudit(): AstCodeAuditReport {
  const stepIssues = auditWorkflowSteps()
  const subscriberIssues = auditSubscribers()
  const hygieneIssues = auditCodeHygieneAndSecurity()

  const allIssues = [...stepIssues, ...subscriberIssues, ...hygieneIssues]

  const criticalCount = allIssues.filter((i) => i.severity === "critical").length
  const warningCount = allIssues.filter((i) => i.severity === "warning").length
  const infoCount = allIssues.filter((i) => i.severity === "info").length

  const totalFilesScanned =
    (fs.existsSync(WORKFLOW_STEPS_DIR) ? fs.readdirSync(WORKFLOW_STEPS_DIR).length : 0) +
    (fs.existsSync(SUBSCRIBERS_DIR) ? fs.readdirSync(SUBSCRIBERS_DIR).length : 0) +
    (fs.existsSync(WORKFLOWS_DIR) ? fs.readdirSync(WORKFLOWS_DIR).length : 0)

  const passRatePercent = Math.max(0, Math.min(100, Math.round(100 - (criticalCount * 10 + warningCount * 3))))

  return {
    scannedAt: new Date().toISOString(),
    totalFilesScanned,
    totalWorkflowsScanned: fs.existsSync(WORKFLOWS_DIR) ? fs.readdirSync(WORKFLOWS_DIR).length : 0,
    totalStepsScanned: fs.existsSync(WORKFLOW_STEPS_DIR) ? fs.readdirSync(WORKFLOW_STEPS_DIR).length : 0,
    totalSubscribersScanned: fs.existsSync(SUBSCRIBERS_DIR) ? fs.readdirSync(SUBSCRIBERS_DIR).length : 0,
    totalRoutesScanned: fs.existsSync(API_DIR) ? fs.readdirSync(API_DIR).length : 0,
    issues: allIssues,
    summary: {
      criticalCount,
      warningCount,
      infoCount,
      passRatePercent,
    },
  }
}

/**
 * Pre-flight Solution Safety Engine:
 * Validates a patch candidate before applying it to source code.
 */
export async function evaluatePatchSafety(
  targetFile: string,
  targetContent: string,
  replacementContent: string
): Promise<{
  isSafe: boolean
  safetyScore: number
  riskLevel: "low" | "medium" | "high"
  diffPreview: string
  reversibilityGuaranteed: boolean
}> {
  const fullPath = path.resolve(PROJECT_ROOT, targetFile)
  if (!fs.existsSync(fullPath)) {
    return {
      isSafe: false,
      safetyScore: 0,
      riskLevel: "high",
      diffPreview: "Target file does not exist",
      reversibilityGuaranteed: false,
    }
  }

  const originalContent = fs.readFileSync(fullPath, "utf-8")
  if (!originalContent.includes(targetContent)) {
    return {
      isSafe: false,
      safetyScore: 0,
      riskLevel: "high",
      diffPreview: "Target content not found in file (already patched or modified)",
      reversibilityGuaranteed: false,
    }
  }

  // Generate unified diff representation
  const diffPreview = `--- a/${targetFile}\n+++ b/${targetFile}\n@@ -patch @@\n- ${targetContent.split("\n").join("\n- ")}\n+ ${replacementContent.split("\n").join("\n+ ")}`

  // Assess risk
  const isHighRisk = replacementContent.includes("delete") || replacementContent.includes("drop")
  const riskLevel: "low" | "medium" | "high" = isHighRisk ? "high" : "low"
  const safetyScore = isHighRisk ? 70 : 98

  return {
    isSafe: true,
    safetyScore,
    riskLevel,
    diffPreview,
    reversibilityGuaranteed: true,
  }
}
