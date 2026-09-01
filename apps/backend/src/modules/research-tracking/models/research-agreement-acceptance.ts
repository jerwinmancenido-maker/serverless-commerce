import { model } from "@medusajs/framework/utils"

const ResearchAgreementAcceptance = model
  .define("research_agreement_acceptance", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    agreement_bundle_id: model.text(),
    acceptance_source: model.enum([
      "signup",
      "existing_customer_upgrade",
      "material_policy_renewal",
    ]),
    accepted_at: model.dateTime(),
    locale: model.text(),
    idempotency_key: model.text(),
    terms_version_snapshot: model.text(),
    terms_digest_snapshot: model.text(),
    privacy_version_snapshot: model.text(),
    privacy_digest_snapshot: model.text(),
    research_hub_version_snapshot: model.text(),
    research_hub_digest_snapshot: model.text(),
    superseded_acceptance_id: model.text().nullable(),
  })
  .indexes([
    { on: ["customer_id", "idempotency_key"], unique: true },
    { on: ["customer_id", "agreement_bundle_id"], unique: true },
    { on: ["customer_id", "accepted_at"] },
  ])

export default ResearchAgreementAcceptance
