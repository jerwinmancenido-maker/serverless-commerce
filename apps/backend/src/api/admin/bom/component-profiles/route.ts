import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { PEPSTACK_BOM_MODULE } from "../../../../modules/bom"
import type PepstackBomModuleService from "../../../../modules/bom/service"
import setComponentProfileWorkflow from "../../../../workflows/set-component-profile"
import type { AdminSetComponentProfileType } from "../validators"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const bomService = req.scope.resolve<PepstackBomModuleService>(
    PEPSTACK_BOM_MODULE,
  )
  const componentProfiles = await bomService.listComponentProfiles(
    {},
    { order: { inventory_item_id: "ASC" } },
  )

  res.json({
    component_profiles: componentProfiles,
    count: componentProfiles.length,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminSetComponentProfileType>,
  res: MedusaResponse,
) {
  const input = req.validatedBody
  const { result: componentProfile } = await setComponentProfileWorkflow(
    req.scope,
  ).run({
    input: {
      inventoryItemId: input.inventory_item_id,
      baseUnit: input.base_unit,
      displayUnit: input.display_unit,
      baseUnitsPerDisplayUnit: input.base_units_per_display_unit,
      displayPrecision: input.display_precision,
      reorderThresholdBaseUnits: input.reorder_threshold_base_units,
      category: input.category,
      lotTrackingRequired: input.lot_tracking_required,
      expiryTrackingRequired: input.expiry_tracking_required,
    },
  })

  res.status(200).json({ component_profile: componentProfile })
}
