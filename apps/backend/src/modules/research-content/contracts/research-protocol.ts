import { z } from "@medusajs/framework/zod"

import {
  RESEARCH_CONTENT_STATUSES,
  RESEARCH_EVIDENCE_SCOPES,
  RESEARCH_PROTOCOL_APPLICABILITY_SCOPES,
} from "./content"
import { RESEARCH_PROTOCOL_ACCESS_LEVELS } from "./research-protocol-visibility"

export const RESEARCH_PROTOCOL_REQUIRED_DISCLAIMER =
  "For laboratory research use only. Not for human or veterinary administration, diagnosis, treatment, or consumption."

const RequiredId = z.string().trim().min(1).max(255)
const ProtocolKey = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const ShortText = z.string().trim().min(1).max(255)
const LongText = z.string().trim().max(20_000)
const OptionalLongText = LongText.nullable().default(null)
const ResearchUnit = z.enum(["mcg", "mg", "g", "µL", "mL", "L", "IU", "piece"])

const ResearchQuantity = z.strictObject({
  value: z.string().trim().min(1).max(64),
  unit: ResearchUnit,
  concentration: z.string().trim().max(120).nullable().default(null),
  conversion_basis: z.string().trim().max(500).nullable().default(null),
})

const ResearchReferenceQuantity = z.strictObject({
  label: ShortText,
  value: z.string().trim().min(1).max(64),
  unit: ResearchUnit,
  concentration: z.string().trim().max(120).nullable().default(null),
  conversion_basis: z.string().trim().max(500).nullable().default(null),
  laboratory_purpose: z.string().trim().min(1).max(2_000),
  notes: z.string().trim().max(2_000).nullable().default(null),
  product_format: z.string().trim().max(120).nullable().default(null),
})

const ResearchMaterial = z.strictObject({
  name: ShortText,
  inventory_item_id: RequiredId.nullable().default(null),
  quantity: ResearchQuantity.nullable().default(null),
  equipment_notes: z.string().trim().max(2_000).nullable().default(null),
})

const ResearchReference = z.strictObject({
  reference_key: ProtocolKey.nullable().default(null),
  title: ShortText,
  authors: z.string().trim().max(1_000).nullable().default(null),
  published_at: z.string().trim().max(64).nullable().default(null),
  url: z.url().nullable().default(null),
  doi: z.string().trim().max(255).nullable().default(null),
  evidence_type: z.string().trim().max(120).nullable().default(null),
  supported_claim: z.string().trim().max(2_000).nullable().default(null),
  customer_annotation: z.string().trim().max(2_000).nullable().default(null),
})

const ResearchQuickReference = z.strictObject({
  key: ProtocolKey,
  label: ShortText,
  value: z.string().trim().min(1).max(500),
  description: z.string().trim().max(2_000).nullable().default(null),
  evidence_label: z.string().trim().max(255).nullable().default(null),
  reference_keys: z.array(ProtocolKey).max(20).default([]),
})

const ResearchProtocolScheduleRow = z.strictObject({
  row_key: ProtocolKey.nullable().default(null),
  period: ShortText,
  start_offset_days: z.number().int().min(0).max(36_500).nullable().default(null),
  end_offset_days: z.number().int().min(0).max(36_500).nullable().default(null),
  amount: z.string().trim().min(1).max(64),
  unit: ResearchUnit,
  recurrence_type: z
    .enum(["once", "daily", "weekly", "custom"])
    .default("custom"),
  times_per_day: z.number().int().min(1).max(24).nullable().default(null),
  weekdays: z.array(z.number().int().min(0).max(6)).max(7).default([]),
  suggested_local_times: z
    .array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/))
    .max(24)
    .default([]),
  frequency: ShortText,
  notes: z.string().trim().max(2_000).nullable().default(null),
  reference_keys: z.array(ProtocolKey).max(20).default([]),
})

const ResearchProtocolLevel = z.strictObject({
  key: ProtocolKey,
  title: ShortText,
  summary: z.string().trim().max(2_000).nullable().default(null),
  duration: z.string().trim().max(255).nullable().default(null),
  interval: z.string().trim().max(255).nullable().default(null),
  applicability: z.string().trim().max(500).nullable().default(null),
  evidence_label: z.string().trim().max(255).nullable().default(null),
  reference_keys: z.array(ProtocolKey).max(20).default([]),
  routine_enabled: z.boolean().default(false),
  rows: z.array(ResearchProtocolScheduleRow).max(100).default([]),
})

const ResearchProtocolSection = z.strictObject({
  key: ProtocolKey,
  title: ShortText,
  body: LongText,
  visible: z.boolean().default(true),
  position: z.number().int().min(0).max(1_000),
  reference_keys: z.array(ProtocolKey).max(20).default([]),
})

const ResearchProtocolFaq = z.strictObject({
  key: ProtocolKey,
  question: ShortText,
  answer: LongText,
  position: z.number().int().min(0).max(1_000),
})

const ResearchCalculatorConfiguration = z.strictObject({
  enabled: z.boolean().default(false),
  title: z.string().trim().min(1).max(255).default("Protocol calculator"),
  default_compound_mass: z.string().trim().max(64).nullable().default(null),
  compound_mass_unit: z.enum(["mcg", "mg", "g", "IU"]).default("mg"),
  default_final_volume_ml: z.string().trim().max(64).nullable().default(null),
  default_target_amount: z.string().trim().max(64).nullable().default(null),
  target_amount_unit: z.enum(["mcg", "mg", "IU"]).default("mcg"),
  iu_per_mg: z.string().trim().max(64).nullable().default(null),
  device_volume_ml: z.string().trim().max(64).nullable().default(null),
  device_label: z.string().trim().max(120).nullable().default(null),
  rounding_precision: z.number().int().min(0).max(6).default(2),
  instructions: z.string().trim().max(2_000).nullable().default(null),
})

const ResearchMolecularDetails = z.strictObject({
  cas_number: z.string().trim().max(120).nullable().default(null),
  pubchem_cid: z.number().int().positive().nullable().default(null),
  sequence_or_formula: z.string().trim().max(2_000).nullable().default(null),
  molecular_weight_g_per_mol: z.number().positive().nullable().default(null),
})

const ResearchReconstitutionDetails = z.strictObject({
  default_vial_net_mg: z.number().positive().nullable().default(null),
  default_diluent_ml: z.number().positive().nullable().default(null),
  solvent: z.string().trim().max(255).nullable().default(null),
  dissolution_method: z.string().trim().max(2_000).nullable().default(null),
  resulting_concentration_mg_per_ml: z.number().positive().nullable().default(null),
  handling_rule: z.string().trim().max(2_000).nullable().default(null),
})

const ResearchStorageDetails = z.strictObject({
  lyophilized: z.string().trim().max(500).nullable().default(null),
  reconstituted: z.string().trim().max(500).nullable().default(null),
  light_protection: z.boolean().default(true),
})

const ResearchReconstitutionOption = z.strictObject({
  diluentMl: z.number().positive(),
  concMgMl: z.number().positive(),
  label: z.string().trim().max(255),
  tickConversion: z.string().trim().max(255),
})

const ResearchVialStrengthOption = z.strictObject({
  vialMg: z.number().positive(),
  diluentMl: z.number().positive(),
  concMgMl: z.number().positive(),
  badge: z.string().trim().max(120),
})

const ResearchSyringeGraduation = z.strictObject({
  doseDisplay: z.string().trim().max(120),
  doseMcg: z.number().nonnegative(),
  volumeMl: z.number().nonnegative(),
  syringeIU: z.number().nonnegative(),
  tickLabel: z.string().trim().max(255),
})

const ResearchSyringeGuide = z.strictObject({
  syringeType: z.string().trim().max(255),
  standardIUDisplay: z.string().trim().max(120).optional(),
  needleGauge: z.string().trim().max(120).optional(),
  deadSpaceCorrection: z.string().trim().max(255).optional(),
  graduations: z.array(ResearchSyringeGraduation).default([]),
})

const ResearchBlendConstituent = z.strictObject({
  name: z.string().trim().max(255),
  ratioMg: z.number().nonnegative(),
  percentageOfTotal: z.number().nonnegative(),
})

export const ResearchBundleVial = z.object({
  compoundName: z.string().trim().min(1).max(255),
  vialNetMass: z.string().trim().min(1).max(100),
  diluentMl: z.number().positive(),
  concMgMl: z.number().positive(),
  solvent: z.string().trim().min(1).max(255),
  reconstitutionInstructions: z.string().trim().min(1).max(2000),
  targetDose: z.string().trim().min(1).max(255),
  cadence: z.string().trim().min(1).max(255),
  syringeUnits: z.string().trim().min(1).max(255),
})

export const ResearchProtocolContent = z.strictObject({
  compound_name: z.string().trim().max(255).nullable().default(null),
  short_introduction: z.string().trim().max(2_000).nullable().default(null),
  product_format: z.string().trim().max(120).nullable().default(null),
  category: z.string().trim().max(255).nullable().default(null),
  protocol_category_type: z.enum(["single_peptide", "blend", "bundle", "topical"]).nullable().default(null),
  full_description: z.string().trim().max(10_000).nullable().default(null),
  investigated_benefits: z.array(z.string().trim().min(1).max(500)).max(30).default([]),
  adverse_observations: z.array(z.string().trim().min(1).max(500)).max(30).default([]),
  molecular_details: ResearchMolecularDetails.nullable().default(null),
  reconstitution_details: ResearchReconstitutionDetails.nullable().default(null),
  reconstitution_options: z.record(z.string(), ResearchReconstitutionOption).nullable().optional(),
  vial_strength_options: z.array(ResearchVialStrengthOption).optional(),
  syringe_guide: ResearchSyringeGuide.nullable().optional(),
  evidence_tier: z.string().trim().max(255).nullable().optional(),
  blend_constituents: z.array(ResearchBlendConstituent).optional(),
  bundle_vials: z.array(ResearchBundleVial).optional(),
  storage_details: ResearchStorageDetails.nullable().default(null),
  purity_standard: z.string().trim().max(255).nullable().default(null),
  research_use_label: z.string().trim().min(1).max(120).default("Research use only"),
  last_reviewed_at: z.iso.date().nullable().default(null),
  quick_reference: z.array(ResearchQuickReference).max(24).default([]),
  calculator: ResearchCalculatorConfiguration.default({
    enabled: false,
    title: "Protocol calculator",
    default_compound_mass: null,
    compound_mass_unit: "mg",
    default_final_volume_ml: null,
    default_target_amount: null,
    target_amount_unit: "mcg",
    iu_per_mg: null,
    device_volume_ml: null,
    device_label: null,
    rounding_precision: 2,
    instructions: null,
  }),
  protocol_levels: z.array(ResearchProtocolLevel).max(20).default([]),
  sections: z.array(ResearchProtocolSection).max(50).default([]),
  faqs: z.array(ResearchProtocolFaq).max(100).default([]),
  research_purpose: LongText,
  intended_application: OptionalLongText,
  explicit_exclusions: OptionalLongText,
  reference_quantities: z.array(ResearchReferenceQuantity).max(100).default([]),
  materials_and_equipment: z.array(ResearchMaterial).max(100).default([]),
  preparation_and_handling: LongText,
  research_procedure: LongText,
  storage_and_disposal: LongText,
  references: z.array(ResearchReference).max(100).default([]),
  disclaimer: z.string().trim().min(1).max(2_000),
})

export const AdminCreateResearchProtocol = z.strictObject({
  protocol_key: ProtocolKey,
  title: ShortText,
  summary: z.string().trim().max(2_000).nullable().default(null),
  purpose: z.string().trim().max(2_000).nullable().default(null),
  evidence_scope: z.enum(RESEARCH_EVIDENCE_SCOPES).default("formulation"),
  content: ResearchProtocolContent,
})

export const AdminCreateResearchProtocolBody = AdminCreateResearchProtocol

export const AdminUpdateResearchProtocolDraft = z.strictObject({
  title: ShortText,
  summary: z.string().trim().max(2_000).nullable().default(null),
  purpose: z.string().trim().max(2_000).nullable().default(null),
  evidence_scope: z.enum(RESEARCH_EVIDENCE_SCOPES),
  content: ResearchProtocolContent,
})

export const AdminPublishResearchProtocol = z.strictObject({
  revision_id: RequiredId,
  reason: z.string().trim().min(3).max(2_000),
  effective_at: z.iso.datetime().nullable().default(null),
})

export const AdminWithdrawResearchProtocol = z.strictObject({
  revision_id: RequiredId,
  reason: z.string().trim().min(3).max(2_000),
})

export const AdminArchiveResearchProtocol = z.strictObject({
  reason: z.string().trim().min(3).max(2_000),
})

export const AdminCreateResearchProtocolRevision = z.strictObject({
  reason: z.string().trim().min(3).max(2_000),
})

export const AdminListResearchProtocols = z.strictObject({
  product_id: RequiredId.optional(),
  status: z.enum(RESEARCH_CONTENT_STATUSES).optional(),
  link_status: z.enum(["linked", "unlinked"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const AdminLinkResearchProtocolProduct = z.strictObject({
  product_id: RequiredId,
  applicability_scope: z
    .enum(RESEARCH_PROTOCOL_APPLICABILITY_SCOPES)
    .default("entire_product"),
  variant_ids: z.array(RequiredId).max(250).default([]),
  is_primary: z.boolean().default(false),
})

export const AdminUpdateResearchProtocolProductLink = z.strictObject({
  applicability_scope: z.enum(RESEARCH_PROTOCOL_APPLICABILITY_SCOPES),
  variant_ids: z.array(RequiredId).max(250).default([]),
  is_primary: z.boolean(),
})

export const AdminUnlinkResearchProtocolProduct = z.strictObject({
  reason: z.string().trim().min(3).max(2_000),
  confirm_primary: z.boolean().default(false),
})

export const AdminPreviewResearchProtocol = z.strictObject({
  revision_id: RequiredId.optional(),
  access_level: z.enum(RESEARCH_PROTOCOL_ACCESS_LEVELS).default("admin"),
})

export type ResearchProtocolContent = z.infer<typeof ResearchProtocolContent>
export type AdminCreateResearchProtocol = z.infer<
  typeof AdminCreateResearchProtocol
>
export type AdminCreateResearchProtocolBody = z.infer<
  typeof AdminCreateResearchProtocolBody
>
export type AdminUpdateResearchProtocolDraft = z.infer<
  typeof AdminUpdateResearchProtocolDraft
>
export type AdminPublishResearchProtocol = z.infer<
  typeof AdminPublishResearchProtocol
>
export type AdminWithdrawResearchProtocol = z.infer<
  typeof AdminWithdrawResearchProtocol
>
export type AdminArchiveResearchProtocol = z.infer<
  typeof AdminArchiveResearchProtocol
>
export type AdminCreateResearchProtocolRevision = z.infer<
  typeof AdminCreateResearchProtocolRevision
>
export type AdminListResearchProtocols = z.infer<
  typeof AdminListResearchProtocols
>
export type AdminLinkResearchProtocolProduct = z.infer<
  typeof AdminLinkResearchProtocolProduct
>
export type AdminUpdateResearchProtocolProductLink = z.infer<
  typeof AdminUpdateResearchProtocolProductLink
>
export type AdminUnlinkResearchProtocolProduct = z.infer<
  typeof AdminUnlinkResearchProtocolProduct
>
export type AdminPreviewResearchProtocol = z.infer<
  typeof AdminPreviewResearchProtocol
>
