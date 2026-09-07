import type { ResearchProtocolContent } from "../../../modules/research-content/contracts/research-protocol"

export type ReadinessCheckItem = {
  id: string
  label: string
  passed: boolean
  description: string
}

export type PublicationReadinessResult = {
  isReady: boolean
  passedCount: number
  totalCount: number
  problems: string[]
  checklist: ReadinessCheckItem[]
}

export function evaluatePublicationReadiness(
  content: Partial<ResearchProtocolContent> | null | undefined,
): PublicationReadinessResult {
  const problems: string[] = []

  const hasIntendedApplication = Boolean(content?.intended_application?.trim())
  if (!hasIntendedApplication) {
    problems.push("Add a quick overview")
  }

  const hasResearchPurpose = Boolean(content?.research_purpose?.trim())
  if (!hasResearchPurpose) {
    problems.push("Explain what this research guide covers")
  }

  const hasExplicitExclusions = Boolean(content?.explicit_exclusions?.trim())
  if (!hasExplicitExclusions) {
    problems.push("Add important limitations")
  }

  const hasPreparation = Boolean(content?.preparation_and_handling?.trim())
  if (!hasPreparation) {
    problems.push("Add preparation and handling information")
  }

  const hasProcedure = Boolean(content?.research_procedure?.trim())
  if (!hasProcedure) {
    problems.push("Add the research steps")
  }

  const hasStorage = Boolean(content?.storage_and_disposal?.trim())
  if (!hasStorage) {
    problems.push("Add storage and disposal information")
  }

  const hasReferences = Boolean(content?.references && content.references.length > 0)
  if (!hasReferences) {
    problems.push("Add at least one supporting reference")
  }

  const missingConversion = (content?.reference_quantities || []).find(
    (item) => (item.unit === "IU" || item.concentration) && !item.conversion_basis,
  )
  const hasValidConversions = !missingConversion
  if (missingConversion) {
    problems.push(
      `Explain how ${missingConversion.label} converts between the selected units`,
    )
  }

  const checklist: ReadinessCheckItem[] = [
    {
      id: "intended_application",
      label: "Quick overview",
      passed: hasIntendedApplication,
      description: "Concise summary of intended laboratory application",
    },
    {
      id: "research_purpose",
      label: "Research purpose",
      passed: hasResearchPurpose,
      description: "Explanation of what this research protocol covers",
    },
    {
      id: "explicit_exclusions",
      label: "Explicit exclusions",
      passed: hasExplicitExclusions,
      description: "Important limitations and off-label prohibitions",
    },
    {
      id: "preparation_and_handling",
      label: "Preparation & handling",
      passed: hasPreparation,
      description: "Aseptic reconstitution and handling parameters",
    },
    {
      id: "research_procedure",
      label: "Research procedure",
      passed: hasProcedure,
      description: "Step-by-step laboratory workflow procedure",
    },
    {
      id: "storage_and_disposal",
      label: "Storage & disposal",
      passed: hasStorage,
      description: "Lyophilized and solution storage conditions and biohazard disposal",
    },
    {
      id: "references",
      label: "Supporting references",
      passed: hasReferences,
      description: "At least one cited scientific paper or HPLC reference",
    },
    {
      id: "conversion_basis",
      label: "Conversion basis",
      passed: hasValidConversions,
      description: "Conversion documentation for IU or concentrated quantities",
    },
  ]

  const passedCount = checklist.filter((item) => item.passed).length
  const totalCount = checklist.length

  return {
    isReady: problems.length === 0,
    passedCount,
    totalCount,
    problems,
    checklist,
  }
}
