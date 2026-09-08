import type { ResearchProtocolContent } from "./contracts/research-protocol"
import type {
  ResearchProtocolAccessLevel,
  ResearchProtocolVisibilityValues,
} from "./contracts/research-protocol-visibility"

export type ResearchProtocolVisibilityPolicyValue =
  ResearchProtocolVisibilityValues

export type ResearchProtocolAccessProjection = Pick<
  ResearchProtocolContent,
  | "compound_name"
  | "short_introduction"
  | "product_format"
  | "category"
  | "protocol_category_type"
  | "full_description"
  | "investigated_benefits"
  | "adverse_observations"
  | "molecular_details"
  | "reconstitution_details"
  | "storage_details"
  | "purity_standard"
  | "reconstitution_options"
  | "vial_strength_options"
  | "syringe_guide"
  | "evidence_tier"
  | "blend_constituents"
  | "bundle_vials"
  | "research_use_label"
  | "last_reviewed_at"
  | "disclaimer"
> & {
  quick_reference: ResearchProtocolContent["quick_reference"]
  sections: ResearchProtocolContent["sections"]
  faqs: ResearchProtocolContent["faqs"]
  references: ResearchProtocolContent["references"]
} & Partial<
    Pick<
      ResearchProtocolContent,
      | "calculator"
      | "protocol_levels"
      | "research_purpose"
      | "intended_application"
      | "explicit_exclusions"
      | "reference_quantities"
      | "materials_and_equipment"
      | "preparation_and_handling"
      | "research_procedure"
      | "storage_and_disposal"
    >
  >

export type PublicResearchProtocolContent = ResearchProtocolAccessProjection

export const DEFAULT_RESEARCH_PROTOCOL_VISIBILITY: ResearchProtocolVisibilityPolicyValue = {
  public_page_enabled: true,
  public_summary: null,
  public_quick_reference: true,
  public_faqs: true,
  public_references: true,
  public_products: true,
  public_recommendations: true,
  member_full_content: false,
  community_read_scope: "purchaser",
  community_post_scope: "purchaser",
  purchaser_badge_enabled: true,
  community_edit_window_minutes: 15,
  community_max_post_length: 5_000,
  community_posts_per_hour: 6,
  community_reports_per_hour: 10,
  community_reactions_per_minute: 30,
  community_links_enabled: false,
  community_attachments_enabled: false,
  community_auto_hold: true,
  community_report_hide_threshold: 3,
  search_indexable: true,
  field_visibility: {},
}

const accessRank: Record<ResearchProtocolAccessLevel, number> = {
  public: 0,
  member: 1,
  purchaser: 2,
  admin: 3,
}

export const canAccessProtocolField = (
  policy: ResearchProtocolVisibilityPolicyValue,
  fieldKey: string,
  accessLevel: ResearchProtocolAccessLevel,
  fallback: ResearchProtocolAccessLevel,
) =>
  accessRank[accessLevel] >=
  accessRank[policy.field_visibility[fieldKey] || fallback]

export const buildResearchProtocolContentForAccess = (
  content: ResearchProtocolContent,
  policy: ResearchProtocolVisibilityPolicyValue,
  accessLevel: ResearchProtocolAccessLevel,
): ResearchProtocolContent | ResearchProtocolAccessProjection => {
  if (
    accessLevel === "admin" ||
    accessLevel === "purchaser" ||
    (accessLevel === "member" && policy.member_full_content)
  ) {
    return content
  }
  const item = (fieldKey: string, fallback: ResearchProtocolAccessLevel) =>
    canAccessProtocolField(policy, fieldKey, accessLevel, fallback)
  const projection: ResearchProtocolAccessProjection = {
  compound_name: item("compound_name", "public")
    ? content.compound_name
    : null,
  short_introduction: item("short_introduction", "public")
    ? content.short_introduction
    : null,
  product_format: item("product_format", "public")
    ? content.product_format
    : null,
  category: item("category", "public") ? content.category : null,
  research_use_label: item("research_use_label", "public")
    ? content.research_use_label
    : "Research protocol preview",
  last_reviewed_at: item("last_reviewed_at", "public")
    ? content.last_reviewed_at
    : null,
  quick_reference: content.quick_reference.filter((entry) =>
    item(
      `quick_reference.${entry.key}`,
      policy.public_quick_reference ? "public" : "purchaser",
    ),
  ),
  sections: content.sections.filter(
    (section) =>
      section.visible &&
      item(`sections.${section.key}`, "public"),
  ),
  faqs: content.faqs.filter((faq) =>
    item(`faqs.${faq.key}`, policy.public_faqs ? "public" : "purchaser"),
  ),
  references: content.references.filter((reference, index) =>
    item(
      `references.${reference.reference_key || index}`,
      policy.public_references ? "public" : "purchaser",
    ),
  ),
  disclaimer: content.disclaimer,
  protocol_category_type: item("protocol_category_type", "public")
    ? content.protocol_category_type
    : null,
  full_description: item("full_description", "public")
    ? content.full_description
    : null,
  investigated_benefits: item("investigated_benefits", "public")
    ? content.investigated_benefits
    : [],
  adverse_observations: item("adverse_observations", "public")
    ? content.adverse_observations
    : [],
  molecular_details: item("molecular_details", "public")
    ? content.molecular_details
    : null,
  reconstitution_details: item("reconstitution_details", "public")
    ? content.reconstitution_details
    : null,
  reconstitution_options: item("reconstitution_options", "public")
    ? content.reconstitution_options
    : null,
  vial_strength_options: item("vial_strength_options", "public")
    ? content.vial_strength_options
    : [],
  syringe_guide: item("syringe_guide", "public")
    ? content.syringe_guide
    : null,
  evidence_tier: item("evidence_tier", "public")
    ? content.evidence_tier
    : null,
  blend_constituents: item("blend_constituents", "public")
    ? content.blend_constituents
    : [],
  bundle_vials: item("bundle_vials", "public")
    ? content.bundle_vials
    : [],
  storage_details: item("storage_details", "public")
    ? content.storage_details
    : null,
  purity_standard: item("purity_standard", "public")
    ? content.purity_standard
    : null,
  }
  const optionalFields = [
    "calculator",
    "protocol_levels",
    "research_purpose",
    "intended_application",
    "explicit_exclusions",
    "reference_quantities",
    "materials_and_equipment",
    "preparation_and_handling",
    "research_procedure",
    "storage_and_disposal",
  ] as const
  for (const field of optionalFields) {
    if (item(field, "public")) {
      ;(projection as any)[field] = content[field]
    }
  }
  return projection
}

export const buildPublicResearchProtocolContent = (
  content: ResearchProtocolContent,
  policy: ResearchProtocolVisibilityPolicyValue,
): PublicResearchProtocolContent =>
  buildResearchProtocolContentForAccess(
    content,
    policy,
    "public",
  ) as PublicResearchProtocolContent

export const normalizeResearchProtocolVisibilityPolicy = (
  value?: Partial<ResearchProtocolVisibilityPolicyValue> | null,
): ResearchProtocolVisibilityPolicyValue => ({
  ...DEFAULT_RESEARCH_PROTOCOL_VISIBILITY,
  ...(value || {}),
  field_visibility: value?.field_visibility || {},
})

export const isProtocolCommunityEligible = ({
  scope,
  signedIn,
  purchaser,
}: {
  scope: "member" | "purchaser"
  signedIn: boolean
  purchaser: boolean
}) => signedIn && (scope === "member" || purchaser)
