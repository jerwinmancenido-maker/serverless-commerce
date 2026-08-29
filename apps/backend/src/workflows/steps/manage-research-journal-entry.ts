import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import {
  normalizeCreateResearchJournalInput,
  normalizeReviseResearchJournalInput,
  normalizeTransitionResearchJournalInput,
  type CreateResearchJournalInput,
  type NormalizedResearchJournalContent,
  type ReviseResearchJournalInput,
  type TransitionResearchJournalInput,
} from "../../modules/research-tracking/contracts/journal"
import {
  retrieveJournalMutationProfile,
  retrieveJournalRevision,
  retrieveOwnedJournalEntry,
  validateOwnedJournalRelations,
} from "../../modules/research-tracking/queries/journal"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"
import {
  beginJournalMutationOrReplay,
  normalizeJournalRevisionConflict,
  recordJournalMutationFailure,
} from "./research-journal-mutation"

export type ManageResearchJournalWorkflowInput =
  | { operation: "create"; data: CreateResearchJournalInput }
  | { operation: "revise"; data: ReviseResearchJournalInput }
  | {
      operation: "void" | "restore"
      data: Omit<TransitionResearchJournalInput, "operation">
    }

function service(container: MedusaContainer): ResearchTrackingModuleService {
  return container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
}

function conflict(message: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, message)
}

function asDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

function revisionWrite(input: {
  content: NormalizedResearchJournalContent
  revisionNumber: number
  priorRevisionId: string | null
}) {
  return {
    revision_number: input.revisionNumber,
    local_date: asDate(input.content.localDate),
    local_time: input.content.localTime,
    timezone: input.content.timezone,
    title: input.content.title,
    note: input.content.note,
    tracked_material_id: input.content.relations.trackedMaterialId,
    supply_id: input.content.relations.supplyId,
    routine_id: input.content.relations.routineId,
    confirmed_log_id: input.content.relations.confirmedLogId,
    prior_revision_id: input.priorRevisionId,
  }
}

export const manageResearchJournalEntryStep = createStep(
  "manage-research-journal-entry",
  async (input: ManageResearchJournalWorkflowInput, { container }) => {
    const trackingService = service(container)
    const profile = await retrieveJournalMutationProfile({
      container,
      customerId: input.data.customerId,
      activeConsentVersion: input.data.activeConsentVersion,
      activeJournalConsentVersion: input.data.activeJournalConsentVersion,
      activeJournalNoticeSha256: input.data.activeJournalNoticeSha256,
    })

    if (input.operation === "create") {
      const normalized = normalizeCreateResearchJournalInput(input.data)
      const mutationState = await beginJournalMutationOrReplay({
        trackingService,
        profileId: profile.id,
        operation: "create",
        idempotencyKey: normalized.idempotencyKey,
        fingerprint: normalized.requestFingerprintSha256,
      })

      if (mutationState.replay) {
        return new StepResponse(mutationState.replay)
      }

      try {
        await validateOwnedJournalRelations({
          container,
          profileId: profile.id,
          relations: normalized.content.relations,
        })
        const created = await trackingService.createJournalEntryWithRevision({
          profileId: profile.id,
          revision: revisionWrite({
            content: normalized.content,
            revisionNumber: 1,
            priorRevisionId: null,
          }),
          mutation: {
            mutation_id: mutationState.mutationId,
            response_payload: { created: true },
          },
        })

        return new StepResponse(created.responsePayload)
      } catch (error) {
        await recordJournalMutationFailure({
          trackingService,
          mutationId: mutationState.mutationId,
          error,
        })
      }
    }

    if (input.operation === "revise") {
      const normalized = normalizeReviseResearchJournalInput(input.data)
      const mutationState = await beginJournalMutationOrReplay({
        trackingService,
        profileId: profile.id,
        operation: "revise",
        idempotencyKey: normalized.idempotencyKey,
        fingerprint: normalized.requestFingerprintSha256,
      })

      if (mutationState.replay) {
        return new StepResponse(mutationState.replay)
      }

      try {
        const entry = await retrieveOwnedJournalEntry({
          container,
          profileId: profile.id,
          journalEntryId: normalized.journalEntryId,
        })

        if (
          entry.status !== "active" ||
          entry.current_revision_id !== normalized.expectedRevisionId
        ) {
          conflict("research_journal_changed")
        }

        const currentRevision = await retrieveJournalRevision(
          container,
          normalized.expectedRevisionId,
        )
        await validateOwnedJournalRelations({
          container,
          profileId: profile.id,
          relations: normalized.content.relations,
        })
        const revised = await trackingService.reviseJournalEntry({
          journalEntryId: entry.id,
          expectedRevisionId: currentRevision.id,
          revision: revisionWrite({
            content: normalized.content,
            revisionNumber: currentRevision.revision_number + 1,
            priorRevisionId: currentRevision.id,
          }),
          mutation: {
            mutation_id: mutationState.mutationId,
            response_payload: { created: false },
          },
        })

        return new StepResponse(revised.responsePayload)
      } catch (error) {
        await recordJournalMutationFailure({
          trackingService,
          mutationId: mutationState.mutationId,
          error: normalizeJournalRevisionConflict(error),
        })
      }
    }

    if (input.operation !== "void" && input.operation !== "restore") {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "unsupported journal operation",
      )
    }

    const operation = input.operation
    const normalized = normalizeTransitionResearchJournalInput({
      ...input.data,
      operation,
    })
    const mutationState = await beginJournalMutationOrReplay({
      trackingService,
      profileId: profile.id,
      operation,
      idempotencyKey: normalized.idempotencyKey,
      fingerprint: normalized.requestFingerprintSha256,
    })

    if (mutationState.replay) {
      return new StepResponse(mutationState.replay)
    }

    try {
      const entry = await retrieveOwnedJournalEntry({
        container,
        profileId: profile.id,
        journalEntryId: normalized.journalEntryId,
      })
      const expectedStatus = operation === "void" ? "active" : "voided"

      if (
        entry.status !== expectedStatus ||
        entry.current_revision_id !== normalized.expectedRevisionId
      ) {
        conflict("research_journal_changed")
      }

      const transitioned = await trackingService.transitionJournalEntry({
        profileId: profile.id,
        journalEntryId: entry.id,
        expectedRevisionId: normalized.expectedRevisionId,
        expectedStatus,
        status: operation === "void" ? "voided" : "active",
        operation,
        occurredAt: new Date(),
        mutation: {
          mutation_id: mutationState.mutationId,
          response_payload: {},
        },
      })

      return new StepResponse(transitioned.responsePayload)
    } catch (error) {
      await recordJournalMutationFailure({
        trackingService,
        mutationId: mutationState.mutationId,
        error,
      })
    }
  },
)
