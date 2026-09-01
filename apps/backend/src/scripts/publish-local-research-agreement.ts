import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import path from "node:path"

import { RESEARCH_TRACKING_MODULE } from "../modules/research-tracking"
import type ResearchTrackingModuleService from "../modules/research-tracking/service"
import { manageResearchAgreementWorkflow } from "../workflows/manage-research-agreement"

const VERSION = "2026.09.01"
const PUBLIC_VERSION = `${VERSION}-en-PH`
const LOCALE = "en-PH"
const LOCAL_STOREFRONT_ORIGIN = "http://localhost:8000"

const documents = {
  terms: {
    filename: "terms-2026.09.01-en-PH.txt",
    url: `${LOCAL_STOREFRONT_ORIGIN}/ph/legal/terms`,
  },
  privacy: {
    filename: "privacy-2026.09.01-en-PH.txt",
    url: `${LOCAL_STOREFRONT_ORIGIN}/ph/legal/privacy`,
  },
  researchHub: {
    filename: "research-hub-2026.09.01-en-PH.txt",
    url: `${LOCAL_STOREFRONT_ORIGIN}/ph/legal/research-hub`,
  },
} as const

function digest(content: Buffer) {
  return createHash("sha256").update(content).digest("hex")
}

async function readPublishedDocument(filename: string) {
  return readFile(
    path.resolve(
      process.cwd(),
      "../storefront/public/legal-documents",
      filename,
    ),
  )
}

export default async function publishLocalResearchAgreement({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const [terms, privacy, researchHub] = await Promise.all([
    readPublishedDocument(documents.terms.filename),
    readPublishedDocument(documents.privacy.filename),
    readPublishedDocument(documents.researchHub.filename),
  ])
  const input = {
    public_version: PUBLIC_VERSION,
    terms_version: VERSION,
    terms_digest: digest(terms),
    terms_url: documents.terms.url,
    privacy_version: VERSION,
    privacy_digest: digest(privacy),
    privacy_url: documents.privacy.url,
    research_hub_version: VERSION,
    research_hub_digest: digest(researchHub),
    research_hub_url: documents.researchHub.url,
    locale: LOCALE,
    effective_at: new Date().toISOString(),
  }

  const existing = await service.listResearchAgreementBundles(
    { public_version: PUBLIC_VERSION },
    { take: 1 },
  )
  let bundle = existing[0]

  if (bundle) {
    const matches =
      bundle.terms_digest === input.terms_digest &&
      bundle.privacy_digest === input.privacy_digest &&
      bundle.research_hub_digest === input.research_hub_digest &&
      bundle.terms_url === input.terms_url &&
      bundle.privacy_url === input.privacy_url &&
      bundle.research_hub_url === input.research_hub_url
    if (!matches) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        `Agreement ${PUBLIC_VERSION} already exists with different immutable content. Publish a new version instead.`,
      )
    }
    if (bundle.status === "active") {
      logger.info(`Agreement ${PUBLIC_VERSION} is already active.`)
      return
    }
    if (bundle.status !== "draft" && bundle.status !== "scheduled") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Agreement ${PUBLIC_VERSION} cannot be published from status ${bundle.status}.`,
      )
    }
  } else {
    const created = await manageResearchAgreementWorkflow(container).run({
      input: {
        operation: "create",
        actor_id: "local-document-publisher",
        ...input,
      },
    })
    bundle = created.result
  }

  const published = await manageResearchAgreementWorkflow(container).run({
    input: {
      operation: "publish",
      id: bundle.id,
      actor_id: "local-document-publisher",
    },
  })

  logger.info(
    `Published agreement ${published.result.public_version} (${published.result.id}).`,
  )
}
