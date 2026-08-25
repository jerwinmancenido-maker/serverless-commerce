import {
  createRemoteLinkStep,
  dismissRemoteLinkStep,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import {
  type SetVariantInventoryKitInput,
  validateVariantInventoryKitChangeStep,
  validateVariantInventoryKitInputStep,
} from "./steps/validate-variant-inventory-kit-change";
import { createRecipeAuditSnapshotStep } from "./steps/create-recipe-audit-snapshot";

export const setVariantInventoryKitWorkflow = createWorkflow(
  "set-variant-inventory-kit",
  function (input: SetVariantInventoryKitInput) {
    const validatedInput = validateVariantInventoryKitInputStep(input);
    const change = validateVariantInventoryKitChangeStep(validatedInput);
    const variantUpdate = transform(
      { validatedInput },
      ({ validatedInput }) => ({
        product_variants: [
          {
            id: validatedInput.variantId,
            manage_inventory: true,
            allow_backorder: false,
          },
        ],
      }),
    );

    updateProductVariantsWorkflow.runAsStep({ input: variantUpdate });

    const replacedLinks = when(
      { change },
      ({ change }) => change.shouldReplace,
    ).then(() => {
      dismissRemoteLinkStep(change.dismissLinks);
      return createRemoteLinkStep(change.createLinks);
    });

    const auditInput = transform(
      { change, replacedLinks },
      ({ change }) => change,
    );
    const auditSnapshot = createRecipeAuditSnapshotStep(auditInput);

    return new WorkflowResponse({ change, auditSnapshot });
  },
);

export default setVariantInventoryKitWorkflow;
