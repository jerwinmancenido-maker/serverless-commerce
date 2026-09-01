import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../modules/research-tracking"
import type {
  AgreementAcceptanceSource,
  AgreementBundleInput,
} from "../modules/research-tracking/contracts/agreement"
import type ResearchTrackingModuleService from "../modules/research-tracking/service"
import { grantResearchProtocolProfileAccessesStep } from "./steps/grant-research-protocol-profile-accesses"

type ManageBundleInput =
  | ({ operation: "create"; actor_id: string } & AgreementBundleInput)
  | ({ operation: "update"; id: string; actor_id: string } & AgreementBundleInput)
  | {
      operation: "publish"
      id: string
      actor_id: string
      replacement_bundle_id?: string | null
    }
  | { operation: "withdraw"; id: string; actor_id: string }

type AcceptAgreementInput = {
  customer_id: string
  agreement_bundle_id: string
  acceptance_source: AgreementAcceptanceSource
  locale: string
  idempotency_key: string
}

function validateDigest(value: string, label: string) {
  if (!/^[a-f0-9]{64}$/i.test(value)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${label} must be a SHA-256 digest`,
    )
  }
}

const manageAgreementBundleStep = createStep(
  "manage-agreement-bundle",
  async (input: ManageBundleInput, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )

    if (input.operation === "create" || input.operation === "update") {
      validateDigest(input.terms_digest, "Terms digest")
      validateDigest(input.privacy_digest, "Privacy digest")
      validateDigest(input.research_hub_digest, "Research Hub digest")
      const effectiveAt = new Date(input.effective_at)
      if (Number.isNaN(effectiveAt.valueOf())) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Agreement effective date is invalid",
        )
      }

      const data = {
        public_version: input.public_version.trim(),
        terms_version: input.terms_version.trim(),
        terms_digest: input.terms_digest.toLowerCase(),
        terms_url: input.terms_url,
        privacy_version: input.privacy_version.trim(),
        privacy_digest: input.privacy_digest.toLowerCase(),
        privacy_url: input.privacy_url,
        research_hub_version: input.research_hub_version.trim(),
        research_hub_digest: input.research_hub_digest.toLowerCase(),
        research_hub_url: input.research_hub_url,
        locale: input.locale,
        effective_at: effectiveAt,
      }

      if (input.operation === "create") {
        const bundle = await service.createResearchAgreementBundles({
          ...data,
          status: "draft",
          replacement_bundle_id: null,
          published_at: null,
          published_by: null,
        })
        return new StepResponse(bundle)
      }

      const bundle = await service.retrieveResearchAgreementBundle(input.id)
      if (bundle.status !== "draft" && bundle.status !== "scheduled") {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          "Published agreement bundles are immutable",
        )
      }
      const updated = await service.updateResearchAgreementBundles({
        id: input.id,
        ...data,
      })
      return new StepResponse(updated)
    }

    const bundle = await service.retrieveResearchAgreementBundle(input.id)
    if (input.operation === "withdraw") {
      if (bundle.status === "active" || bundle.status === "superseded") {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          "Active agreement bundles must be superseded, not withdrawn",
        )
      }
      const updated = await service.updateResearchAgreementBundles({
        id: bundle.id,
        status: "withdrawn",
      })
      return new StepResponse(updated)
    }

    if (bundle.status !== "draft" && bundle.status !== "scheduled") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Only draft or scheduled agreements can be published",
      )
    }
    const active = await service.listResearchAgreementBundles(
      { status: "active", locale: bundle.locale },
      { take: 2 },
    )
    const replacement = active.find((item) => item.id !== bundle.id)
    if (replacement) {
      await service.updateResearchAgreementBundles({
        id: replacement.id,
        status: "superseded",
        replacement_bundle_id: bundle.id,
      })
    }
    const updated = await service.updateResearchAgreementBundles({
      id: bundle.id,
      status: "active",
      replacement_bundle_id: input.replacement_bundle_id || null,
      published_at: new Date(),
      published_by: input.actor_id,
    })
    return new StepResponse(updated)
  },
)

const acceptAgreementStep = createStep(
  "accept-agreement",
  async (input: AcceptAgreementInput, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )
    const existing = await service.listResearchAgreementAcceptances(
      {
        customer_id: input.customer_id,
        idempotency_key: input.idempotency_key,
      },
      { take: 1 },
    )
    if (existing[0]) {
      const acceptance = existing[0]
      const [existingProfile] = await service.listResearchProfiles(
        { customer_id: input.customer_id },
        { take: 1 },
      )

      if (!existingProfile) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Accepted agreement is missing its Research Hub profile",
        )
      }

      const acceptedAt = new Date(acceptance.accepted_at)
      const profile =
        existingProfile.status !== "active" ||
        existingProfile.locale !== acceptance.locale ||
        existingProfile.consent_version !==
          acceptance.research_hub_version_snapshot
          ? await service.updateResearchProfiles({
              id: existingProfile.id,
              locale: acceptance.locale,
              consent_version: acceptance.research_hub_version_snapshot,
              consented_at: acceptedAt,
              status: "active",
            })
          : existingProfile

      const compatibilityKey = `agreement:${acceptance.id}`
      const consentFingerprint = acceptance.research_hub_digest_snapshot
      const [hubEvent] = await service.listResearchConsentEvents(
        {
          profile_id: profile.id,
          idempotency_key: `${compatibilityKey}:hub`,
        },
        { take: 1 },
      )
      if (!hubEvent) {
        await service.createResearchConsentEvents({
          profile_id: profile.id,
          event_type: "accepted",
          consent_version: acceptance.research_hub_version_snapshot,
          notice_sha256: consentFingerprint,
          occurred_at: acceptedAt,
          idempotency_key: `${compatibilityKey}:hub`,
          request_fingerprint_sha256: consentFingerprint,
        })
      }
      const [journalEvent] = await service.listResearchJournalConsentEvents(
        {
          profile_id: profile.id,
          idempotency_key: `${compatibilityKey}:journal`,
        },
        { take: 1 },
      )
      if (!journalEvent) {
        await service.createResearchJournalConsentEvents({
          profile_id: profile.id,
          event_type: "accepted",
          consent_version: acceptance.research_hub_version_snapshot,
          notice_sha256: consentFingerprint,
          occurred_at: acceptedAt,
          idempotency_key: `${compatibilityKey}:journal`,
          request_fingerprint_sha256: consentFingerprint,
        })
      }
      const [measurementEvent] =
        await service.listResearchMeasurementConsentEvents(
          {
            profile_id: profile.id,
            idempotency_key: `${compatibilityKey}:measurements`,
          },
          { take: 1 },
        )
      if (!measurementEvent) {
        await service.createResearchMeasurementConsentEvents({
          profile_id: profile.id,
          event_type: "accepted",
          consent_version: acceptance.research_hub_version_snapshot,
          notice_sha256: consentFingerprint,
          occurred_at: acceptedAt,
          idempotency_key: `${compatibilityKey}:measurements`,
          request_fingerprint_sha256: consentFingerprint,
        })
      }

      return new StepResponse({
        acceptance,
        profile_id: profile.id,
      })
    }

    const bundle = await service.retrieveResearchAgreementBundle(
      input.agreement_bundle_id,
    )
    if (bundle.status !== "active" || bundle.effective_at > new Date()) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "The agreement changed. Refresh and review the current agreement.",
      )
    }
    const prior = await service.listResearchAgreementAcceptances(
      { customer_id: input.customer_id },
      { order: { accepted_at: "DESC" }, take: 1 },
    )
    const acceptance = await service.createResearchAgreementAcceptances({
      customer_id: input.customer_id,
      agreement_bundle_id: bundle.id,
      acceptance_source: input.acceptance_source,
      accepted_at: new Date(),
      locale: input.locale,
      idempotency_key: input.idempotency_key,
      terms_version_snapshot: bundle.terms_version,
      terms_digest_snapshot: bundle.terms_digest,
      privacy_version_snapshot: bundle.privacy_version,
      privacy_digest_snapshot: bundle.privacy_digest,
      research_hub_version_snapshot: bundle.research_hub_version,
      research_hub_digest_snapshot: bundle.research_hub_digest,
      superseded_acceptance_id: prior[0]?.id || null,
    })
    const profiles = await service.listResearchProfiles(
      { customer_id: input.customer_id },
      { take: 1 },
    )
    const now = new Date()
    const profile = profiles[0]
      ? await service.updateResearchProfiles({
          id: profiles[0].id,
          locale: input.locale,
          consent_version: bundle.research_hub_version,
          consented_at: now,
          status: "active",
        })
      : await service.createResearchProfiles({
          customer_id: input.customer_id,
          timezone: "Asia/Manila",
          locale: input.locale,
          consent_version: bundle.research_hub_version,
          consented_at: now,
          status: "active",
        })
    const compatibilityKey = `agreement:${acceptance.id}`
    const fingerprint = bundle.research_hub_digest
    await service.createResearchConsentEvents({
      profile_id: profile.id,
      event_type: "accepted",
      consent_version: bundle.research_hub_version,
      notice_sha256: bundle.research_hub_digest,
      occurred_at: now,
      idempotency_key: `${compatibilityKey}:hub`,
      request_fingerprint_sha256: fingerprint,
    })
    await service.createResearchJournalConsentEvents({
      profile_id: profile.id,
      event_type: "accepted",
      consent_version: bundle.research_hub_version,
      notice_sha256: bundle.research_hub_digest,
      occurred_at: now,
      idempotency_key: `${compatibilityKey}:journal`,
      request_fingerprint_sha256: fingerprint,
    })
    await service.createResearchMeasurementConsentEvents({
      profile_id: profile.id,
      event_type: "accepted",
      consent_version: bundle.research_hub_version,
      notice_sha256: bundle.research_hub_digest,
      occurred_at: now,
      idempotency_key: `${compatibilityKey}:measurements`,
      request_fingerprint_sha256: fingerprint,
    })
    return new StepResponse({
      acceptance,
      profile_id: profile.id,
    })
  },
)

export const manageResearchAgreementWorkflow = createWorkflow(
  "manage-research-agreement",
  function (input: ManageBundleInput) {
    const result = manageAgreementBundleStep(input)
    return new WorkflowResponse(result)
  },
)

export const acceptResearchAgreementWorkflow = createWorkflow(
  "accept-research-agreement",
  function (input: AcceptAgreementInput) {
    const prepared = acceptAgreementStep(input)
    grantResearchProtocolProfileAccessesStep({
      customerId: input.customer_id,
      profileId: prepared.profile_id,
    })
    const result = transform(
      { prepared },
      ({ prepared }) => prepared.acceptance,
    )
    return new WorkflowResponse(result)
  },
)
