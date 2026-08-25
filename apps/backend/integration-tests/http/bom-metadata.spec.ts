import type {
  IInventoryService,
  IProductModuleService,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

import { PEPSTACK_BOM_MODULE } from "../../src/modules/bom"
import type PepstackBomModuleService from "../../src/modules/bom/service"
import setComponentProfileWorkflow from "../../src/workflows/set-component-profile"
import setVariantInventoryKitWorkflow from "../../src/workflows/set-variant-inventory-kit"

jest.setTimeout(120 * 1000)

medusaIntegrationTestRunner({
  moduleName: "bom-metadata",
  inApp: true,
  env: {
    STORE_CORS: "http://localhost:8000",
    ADMIN_CORS: "http://localhost:9000",
    AUTH_CORS: "http://localhost:8000,http://localhost:9000",
    JWT_SECRET: "phase-3-disposable-test-secret",
    COOKIE_SECRET: "phase-3-disposable-test-secret",
  },
  testSuite: ({ getContainer }) => {
    describe("PepStack BOM metadata and recipe audit", () => {
      let variantId: string
      let activeInventoryItemId: string
      let vialInventoryItemId: string

      beforeEach(async () => {
        const container = getContainer()
        const productService = container.resolve<IProductModuleService>(
          Modules.PRODUCT,
        )
        const inventoryService = container.resolve<IInventoryService>(
          Modules.INVENTORY,
        )
        const product = await productService.createProducts({
          title: "Phase 3 Disposable Product",
          variants: [
            {
              title: "Phase 3 Variant",
              sku: "PHASE-3-VARIANT",
              manage_inventory: false,
              allow_backorder: true,
            },
          ],
        })
        const inventoryItems = await inventoryService.createInventoryItems([
          { sku: "PHASE-3-ACTIVE", title: "Disposable Active" },
          { sku: "PHASE-3-VIAL", title: "Disposable Vial" },
        ])

        variantId = product.variants[0].id
        activeInventoryItemId = inventoryItems[0].id
        vialInventoryItemId = inventoryItems[1].id

        await setComponentProfileWorkflow(container).run({
          input: {
            inventoryItemId: activeInventoryItemId,
            baseUnit: "microgram",
            displayUnit: "mg",
            baseUnitsPerDisplayUnit: 1_000,
            displayPrecision: 2,
            reorderThresholdBaseUnits: 50_000,
            category: "active ingredient",
            lotTrackingRequired: true,
            expiryTrackingRequired: true,
          },
        })
      })

      it("creates and updates one metadata profile per inventory item", async () => {
        const container = getContainer()
        const bomService = container.resolve<PepstackBomModuleService>(
          PEPSTACK_BOM_MODULE,
        )
        const query = container.resolve(ContainerRegistrationKeys.QUERY)

        await setComponentProfileWorkflow(container).run({
          input: {
            inventoryItemId: activeInventoryItemId,
            baseUnit: "microgram",
            displayUnit: "mcg",
            baseUnitsPerDisplayUnit: 1,
            displayPrecision: 0,
            reorderThresholdBaseUnits: 25_000,
            category: "controlled material",
            lotTrackingRequired: true,
            expiryTrackingRequired: true,
          },
        })

        const profiles = await bomService.listComponentProfiles({
          inventory_item_id: activeInventoryItemId,
        })
        const { data: linkedProfiles } = await query.graph({
          entity: "component_profile",
          fields: ["id", "inventory_item.id"],
          filters: { inventory_item_id: activeInventoryItemId },
        })

        expect(profiles).toHaveLength(1)
        expect(profiles[0]).toEqual(
          expect.objectContaining({
            base_unit: "microgram",
            display_unit: "mcg",
            base_units_per_display_unit: 1,
            display_precision: 0,
            reorder_threshold_base_units: 25_000,
            category: "controlled material",
            lot_tracking_required: true,
            expiry_tracking_required: true,
          }),
        )
        expect(linkedProfiles[0]?.inventory_item?.id).toBe(
          activeInventoryItemId,
        )
      })

      it("rejects missing inventory items without creating metadata", async () => {
        const container = getContainer()
        const bomService = container.resolve<PepstackBomModuleService>(
          PEPSTACK_BOM_MODULE,
        )
        const execution = await setComponentProfileWorkflow(container).run({
          input: {
            inventoryItemId: "iitem_missing",
            baseUnit: "piece",
            displayUnit: "piece",
            baseUnitsPerDisplayUnit: 1,
            displayPrecision: 0,
            reorderThresholdBaseUnits: 0,
            category: "other",
            lotTrackingRequired: false,
            expiryTrackingRequired: false,
          },
          throwOnError: false,
        })

        expect(execution.errors).toEqual([
          expect.objectContaining({
            error: expect.objectContaining({
              message: "inventory item iitem_missing was not found",
            }),
          }),
        ])
        expect(
          await bomService.listComponentProfiles({
            inventory_item_id: "iitem_missing",
          }),
        ).toHaveLength(0)
      })

      it("versions immutable recipe snapshots only for material changes", async () => {
        const container = getContainer()
        const bomService = container.resolve<PepstackBomModuleService>(
          PEPSTACK_BOM_MODULE,
        )
        const query = container.resolve(ContainerRegistrationKeys.QUERY)

        await setComponentProfileWorkflow(container).run({
          input: {
            inventoryItemId: vialInventoryItemId,
            baseUnit: "piece",
            displayUnit: "piece",
            baseUnitsPerDisplayUnit: 1,
            displayPrecision: 0,
            reorderThresholdBaseUnits: 10,
            category: "container",
            lotTrackingRequired: false,
            expiryTrackingRequired: false,
          },
        })
        const recipe = [
          {
            inventoryItemId: activeInventoryItemId,
            requiredQuantity: 10_000,
          },
          {
            inventoryItemId: vialInventoryItemId,
            requiredQuantity: 1,
          },
        ]

        await setVariantInventoryKitWorkflow(container).run({
          input: { variantId, components: recipe, actorId: "user_phase_3" },
        })
        await setVariantInventoryKitWorkflow(container).run({
          input: { variantId, components: [...recipe].reverse() },
        })
        await setComponentProfileWorkflow(container).run({
          input: {
            inventoryItemId: activeInventoryItemId,
            baseUnit: "microgram",
            displayUnit: "mcg",
            baseUnitsPerDisplayUnit: 1,
            displayPrecision: 0,
            reorderThresholdBaseUnits: 50_000,
            category: "active ingredient",
            lotTrackingRequired: true,
            expiryTrackingRequired: true,
          },
        })
        await setVariantInventoryKitWorkflow(container).run({
          input: {
            variantId,
            components: [
              { ...recipe[0], requiredQuantity: 5_000 },
              recipe[1],
            ],
            note: "Pre-order recipe revision",
          },
        })

        const snapshots = await bomService.listRecipeAuditSnapshots(
          { variant_id: variantId },
          { order: { version: "ASC" } },
        )
        const { data: linkedSnapshots } = await query.graph({
          entity: "recipe_audit_snapshot",
          fields: ["id", "product_variant.id"],
          filters: { variant_id: variantId },
        })

        expect(snapshots).toHaveLength(2)
        expect(snapshots.map(({ version }) => version)).toEqual([1, 2])
        expect(snapshots[0]).toEqual(
          expect.objectContaining({
            actor_id: "user_phase_3",
            note: null,
          }),
        )
        expect(snapshots[0].components).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              inventoryItemId: activeInventoryItemId,
              requiredQuantity: 10_000,
              displayUnit: "mg",
              baseUnitsPerDisplayUnit: 1_000,
            }),
          ]),
        )
        expect(snapshots[1]).toEqual(
          expect.objectContaining({
            note: "Pre-order recipe revision",
          }),
        )
        expect(snapshots[1].components).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              inventoryItemId: activeInventoryItemId,
              requiredQuantity: 5_000,
              displayUnit: "mcg",
              baseUnitsPerDisplayUnit: 1,
            }),
          ]),
        )
        expect(snapshots[0].recipe_hash).not.toBe(snapshots[1].recipe_hash)
        await expect(
          bomService.updateRecipeAuditSnapshots({
            id: snapshots[0].id,
            note: "attempted rewrite",
          }),
        ).rejects.toThrow("recipe audit snapshots are immutable")
        expect(linkedSnapshots).toHaveLength(2)
        expect(
          linkedSnapshots.every(
            (snapshot) =>
              snapshot.product_variant?.length === 1 &&
              snapshot.product_variant[0]?.id === variantId,
          ),
        ).toBe(true)
      })

      it("rolls back native kit changes when component metadata is missing", async () => {
        const container = getContainer()
        const inventoryService = container.resolve<IInventoryService>(
          Modules.INVENTORY,
        )
        const productService = container.resolve<IProductModuleService>(
          Modules.PRODUCT,
        )
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const [unprofiledItem] = await inventoryService.createInventoryItems([
          { sku: "PHASE-3-UNPROFILED", title: "Unprofiled Component" },
        ])

        const execution = await setVariantInventoryKitWorkflow(container).run({
          input: {
            variantId,
            components: [
              {
                inventoryItemId: unprofiledItem.id,
                requiredQuantity: 1,
              },
            ],
          },
          throwOnError: false,
        })
        const { data: links } = await query.graph({
          entity: "product_variant_inventory_item",
          fields: ["inventory_item_id"],
          filters: { variant_id: variantId },
        })
        const variant = await productService.retrieveProductVariant(variantId)

        expect(execution.errors).toEqual([
          expect.objectContaining({
            error: expect.objectContaining({
              message: `component profiles were not found: ${unprofiledItem.id}`,
            }),
          }),
        ])
        expect(links).toHaveLength(0)
        expect(variant.manage_inventory).toBe(false)
        expect(variant.allow_backorder).toBe(true)
      })
    })
  },
})
