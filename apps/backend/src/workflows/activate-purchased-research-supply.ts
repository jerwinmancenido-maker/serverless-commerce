import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  acquireLockStep,
  releaseLockStep,
} from "@medusajs/medusa/core-flows"

import type { ActivatePurchasedSupplyInput } from "../modules/research-tracking/contracts/purchased-supplies"
import {
  createPurchasedTrackedMaterialStep,
  normalizePurchasedSupplyActivationStep,
  persistPurchasedSupplyActivationStep,
  preparePurchasedSupplyActivationStep,
} from "./steps/activate-purchased-research-supply"

export const activatePurchasedResearchSupplyWorkflow = createWorkflow(
  "activate-purchased-research-supply",
  function (input: ActivatePurchasedSupplyInput) {
    const normalized = normalizePurchasedSupplyActivationStep(input)
    const requestLock = transform({ normalized }, ({ normalized }) => ({
      key: `research-supply-request:${normalized.customerId}:${normalized.idempotencyKey}`,
      timeout: 10,
      ttl: 60,
    }))
    const lineLock = transform({ normalized }, ({ normalized }) => ({
      key: `research-supply-line:${normalized.lineItemId}`,
      timeout: 10,
      ttl: 60,
    }))

    acquireLockStep(requestLock)
    acquireLockStep(lineLock).config({ name: "acquire-line-lock" })

    const firstPrepared = preparePurchasedSupplyActivationStep(normalized)
    const materialLock = transform(
      { firstPrepared },
      ({ firstPrepared }) => ({
        key: firstPrepared.materialLockKey,
        timeout: 10,
        ttl: 60,
      }),
    )

    acquireLockStep(materialLock).config({ name: "acquire-material-lock" })

    const prepared = preparePurchasedSupplyActivationStep(normalized).config({
      name: "refresh-purchased-supply-activation",
    })
    const createdMaterial = when(
      "create-new-purchased-tracked-material",
      { prepared },
      ({ prepared }) => prepared.shouldCreate && !prepared.trackedMaterialId,
    ).then(() =>
      createPurchasedTrackedMaterialStep(prepared.trackedMaterialInput),
    )
    const trackedMaterialId = transform(
      { createdMaterial, prepared },
      ({ createdMaterial, prepared }) =>
        createdMaterial?.id ?? prepared.trackedMaterialId ?? "",
    )
    const persisted = persistPurchasedSupplyActivationStep(
      transform(
        { prepared, trackedMaterialId },
        ({ prepared, trackedMaterialId }) => ({
          prepared,
          trackedMaterialId,
        }),
      ),
    )

    releaseLockStep(materialLock).config({ name: "release-material-lock" })
    releaseLockStep(lineLock)
    releaseLockStep(requestLock).config({ name: "release-request-lock" })

    return new WorkflowResponse(persisted)
  },
)
