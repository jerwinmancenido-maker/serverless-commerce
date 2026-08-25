import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import type {
  CancelResearchProfileDeletionInput,
  CloseResearchProfileInput,
  CreateResearchProfileInput,
  RecordResearchConsentInput,
  RequestResearchProfileDeletionInput,
  UpdateResearchProfilePreferencesInput,
} from "../modules/research-tracking/contracts/ownership"
import {
  cancelResearchPrivacyRequestStep,
  closeResearchProfileStep,
  createResearchConsentEventStep,
  createResearchPrivacyRequestStep,
  createResearchProfileStep,
  requestResearchProfileDeletionStep,
  restoreResearchProfileAfterCancellationStep,
  updateResearchProfileConsentStep,
  updateResearchProfilePreferencesStep,
} from "./steps/research-tracking-ownership"

export const createResearchProfileWorkflow = createWorkflow(
  "create-research-profile",
  function (input: CreateResearchProfileInput) {
    const prepared = createResearchProfileStep(input)
    const createdConsentEvent = when(
      "create-research-profile-consent-event",
      { prepared },
      ({ prepared }) => prepared.shouldCreateConsentEvent,
    ).then(() =>
      createResearchConsentEventStep(prepared.consentEventInput),
    )
    const result = transform(
      { prepared, createdConsentEvent },
      ({ prepared, createdConsentEvent }) => ({
        research_profile: prepared.profile,
        consent_event: createdConsentEvent ?? prepared.consentEvent,
      }),
    )

    return new WorkflowResponse(result)
  },
)

export const updateResearchProfilePreferencesWorkflow = createWorkflow(
  "update-research-profile-preferences",
  function (input: UpdateResearchProfilePreferencesInput) {
    const profile = updateResearchProfilePreferencesStep(input)
    const result = transform({ profile }, ({ profile }) => ({
      research_profile: profile,
    }))

    return new WorkflowResponse(result)
  },
)

export const recordResearchConsentWorkflow = createWorkflow(
  "record-research-consent",
  function (input: RecordResearchConsentInput) {
    const prepared = updateResearchProfileConsentStep(input)
    const createdConsentEvent = when(
      "record-research-consent-event",
      { prepared },
      ({ prepared }) => prepared.shouldCreateConsentEvent,
    ).then(() =>
      createResearchConsentEventStep(prepared.consentEventInput),
    )
    const result = transform(
      { prepared, createdConsentEvent },
      ({ prepared, createdConsentEvent }) => ({
        research_profile: prepared.profile,
        consent_event: createdConsentEvent ?? prepared.consentEvent,
      }),
    )

    return new WorkflowResponse(result)
  },
)

export const closeResearchProfileWorkflow = createWorkflow(
  "close-research-profile",
  function (input: CloseResearchProfileInput) {
    const prepared = closeResearchProfileStep(input)
    const createdConsentEvent = when(
      "close-research-profile-consent-event",
      { prepared },
      ({ prepared }) => prepared.shouldCreateConsentEvent,
    ).then(() =>
      createResearchConsentEventStep(prepared.consentEventInput),
    )
    const result = transform(
      { prepared, createdConsentEvent },
      ({ prepared, createdConsentEvent }) => ({
        research_profile: prepared.profile,
        consent_event: createdConsentEvent ?? prepared.consentEvent,
      }),
    )

    return new WorkflowResponse(result)
  },
)

export const requestResearchProfileDeletionWorkflow = createWorkflow(
  "request-research-profile-deletion",
  function (input: RequestResearchProfileDeletionInput) {
    const prepared = requestResearchProfileDeletionStep(input)
    const createdPrivacyRequest = when(
      "create-research-profile-deletion-request",
      { prepared },
      ({ prepared }) => prepared.shouldCreatePrivacyRequest,
    ).then(() =>
      createResearchPrivacyRequestStep(prepared.privacyRequestInput),
    )
    const result = transform(
      { prepared, createdPrivacyRequest },
      ({ prepared, createdPrivacyRequest }) => ({
        research_profile: prepared.profile,
        privacy_request:
          createdPrivacyRequest ?? prepared.privacyRequest,
      }),
    )

    return new WorkflowResponse(result)
  },
)

export const cancelResearchProfileDeletionWorkflow = createWorkflow(
  "cancel-research-profile-deletion",
  function (input: CancelResearchProfileDeletionInput) {
    const prepared = cancelResearchPrivacyRequestStep(input)
    const restoredProfile = when(
      "restore-research-profile-after-deletion-cancellation",
      { prepared },
      ({ prepared }) => prepared.shouldRestoreProfile,
    ).then(() =>
      restoreResearchProfileAfterCancellationStep(
        prepared.restoreProfileInput,
      ),
    )
    const result = transform(
      { prepared, restoredProfile },
      ({ prepared, restoredProfile }) => ({
        research_profile: restoredProfile ?? prepared.profile,
        privacy_request: prepared.privacyRequest,
      }),
    )

    return new WorkflowResponse(result)
  },
)
