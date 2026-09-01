import { model } from "@medusajs/framework/utils"

const ResearchAgreementBundle = model
  .define("research_agreement_bundle", {
    id: model.id().primaryKey(),
    public_version: model.text(),
    terms_version: model.text(),
    terms_digest: model.text(),
    terms_url: model.text(),
    privacy_version: model.text(),
    privacy_digest: model.text(),
    privacy_url: model.text(),
    research_hub_version: model.text(),
    research_hub_digest: model.text(),
    research_hub_url: model.text(),
    locale: model.text().default("en-PH"),
    effective_at: model.dateTime(),
    status: model
      .enum(["draft", "scheduled", "active", "superseded", "withdrawn"])
      .default("draft"),
    replacement_bundle_id: model.text().nullable(),
    published_at: model.dateTime().nullable(),
    published_by: model.text().nullable(),
  })
  .indexes([
    { on: ["public_version"], unique: true },
    { on: ["status", "locale", "effective_at"] },
  ])

export default ResearchAgreementBundle
