import type {
  IFulfillmentModuleService,
  IInventoryService,
  IOrderModuleService,
  IProductModuleService,
  ISalesChannelModuleService,
  IStockLocationService,
  IUserModuleService,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  generateJwtToken,
  Modules,
} from "@medusajs/framework/utils"
import {
  cancelOrderWorkflow,
  createOrderFulfillmentWorkflow,
  createReservationsWorkflow,
  createShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

import { PEPSTACK_BOM_MODULE } from "../../src/modules/bom"
import type PepstackBomModuleService from "../../src/modules/bom/service"
import type { CompoundedProductPresentationSnapshot } from "../../src/modules/compounded-product/contracts/configuration"
import { DEFAULT_COMPOUNDED_PRODUCT_READINESS_POLICY } from "../../src/modules/compounded-product/contracts/governance"
import setComponentProfileWorkflow from "../../src/workflows/set-component-profile"

jest.setTimeout(240 * 1000)

const jwtSecret = "compounded-product-order-lifecycle-test-secret"
let runtimeJwtSecret = jwtSecret
let adminUserId = ""

type RecipeLink = {
  variant_id: string
  inventory_item_id: string
  required_quantity: number
}

type SavedVariant = {
  id: string
  sku: string
  title: string
  metadata: Record<string, unknown> | null
}

function adminConfig() {
  const token = generateJwtToken(
    {
      actor_id: adminUserId,
      actor_type: "user",
      auth_identity_id: `auth_${adminUserId}`,
      app_metadata: { user_id: adminUserId },
      user_metadata: {},
    },
    { secret: runtimeJwtSecret, expiresIn: "1h" },
  )

  return {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  }
}

function lifecycleSnapshot(inventory: {
  finishedVial: string
  bacWater: string
  syringe1cc: string
  syringe3cc: string
  alcoholPad: string
  mailer: string
}): CompoundedProductPresentationSnapshot {
  return {
    schema_version: "1",
    label: "Configurable compounded vial",
    description: "Disposable Phase 7 lifecycle presentation",
    fields: [],
    variation_axes: [
      {
        key: "inclusion",
        semantic_name: "Inclusion",
        help_text: null,
        position: 0,
        values: [
          {
            key: "vial_only",
            label: "Vial Only",
            position: 0,
            active: true,
            measurement: null,
          },
          {
            key: "vial_bac",
            label: "Vial + BAC",
            position: 1,
            active: true,
            measurement: null,
          },
          {
            key: "subq_set",
            label: "SubQ Set",
            position: 2,
            active: true,
            measurement: null,
          },
        ],
      },
      {
        key: "net_content",
        semantic_name: "Net Content",
        help_text: null,
        position: 1,
        values: [
          {
            key: "fifty_milligrams",
            label: "50 mg",
            position: 0,
            active: true,
            measurement: {
              amount: "50",
              display_unit: "mg",
              material_profile_id: null,
            },
          },
        ],
      },
    ],
    recipe_rules: [
      {
        key: "finished_vial_50mg",
        label: "Finished 50 mg vial",
        kind: "finished_product",
        position: 0,
        match: {
          axis_key: "net_content",
          value_key: "fifty_milligrams",
        },
        components: [
          {
            inventory_item_id: inventory.finishedVial,
            required_display_amount: "1",
          },
        ],
      },
      {
        key: "vial_with_bac",
        label: "10 mL BAC Water",
        kind: "variation_value",
        position: 1,
        match: { axis_key: "inclusion", value_key: "vial_bac" },
        components: [
          {
            inventory_item_id: inventory.bacWater,
            required_display_amount: "1",
          },
        ],
      },
      {
        key: "subq_supplies",
        label: "SubQ supplies",
        kind: "variation_value",
        position: 2,
        match: { axis_key: "inclusion", value_key: "subq_set" },
        components: [
          {
            inventory_item_id: inventory.bacWater,
            required_display_amount: "1",
          },
          {
            inventory_item_id: inventory.syringe1cc,
            required_display_amount: "6",
          },
          {
            inventory_item_id: inventory.syringe3cc,
            required_display_amount: "1",
          },
          {
            inventory_item_id: inventory.alcoholPad,
            required_display_amount: "10",
          },
        ],
      },
      {
        key: "common_mailer",
        label: "Mailer box",
        kind: "common_packaging",
        position: 3,
        components: [
          {
            inventory_item_id: inventory.mailer,
            required_display_amount: "1",
          },
        ],
      },
    ],
    sku_suggestion_policy: null,
    readiness_policy: DEFAULT_COMPOUNDED_PRODUCT_READINESS_POLICY,
    variant_warning_threshold: 20,
  }
}

medusaIntegrationTestRunner({
  moduleName: "compounded-product-order-lifecycle-http",
  inApp: true,
  env: {
    STORE_CORS: "http://localhost:8000",
    ADMIN_CORS: "http://localhost:9000",
    AUTH_CORS: "http://localhost:8000,http://localhost:9000",
    JWT_SECRET: jwtSecret,
    COOKIE_SECRET: jwtSecret,
  },
  testSuite: ({ api, getContainer, dbConnection }) => {
    describe("saved compounded-product order lifecycle", () => {
      let salesChannelId = ""
      let shippingProfileId = ""
      let productId = ""
      let variants: SavedVariant[] = []
      let recipeLinks: RecipeLink[] = []
      let inventoryItemIds: Record<string, string> = {}
      let presentationRevisionId = ""
      let presentationFingerprint = ""

      const variantByTitle = (inclusion: string) => {
        const variant = variants.find((candidate) =>
          candidate.title.includes(inclusion),
        )

        if (!variant) {
          throw new Error(`Saved variant was not found for ${inclusion}`)
        }

        return variant
      }

      const linksForVariant = (variantId: string) =>
        recipeLinks.filter((link) => link.variant_id === variantId)

      const createLocationWithStock = async (
        label: string,
        quantities: Partial<Record<keyof typeof inventoryItemIds, number>> = {},
      ) => {
        const container = getContainer()
        const stockLocationService = container.resolve<IStockLocationService>(
          Modules.STOCK_LOCATION,
        )
        const inventoryService = container.resolve<IInventoryService>(
          Modules.INVENTORY,
        )
        const location = await stockLocationService.createStockLocations({
          name: `Phase 7 ${label} warehouse`,
          address: {
            city: "Quezon City",
            country_code: "PH",
            address_1: "Disposable integration address",
          },
        })
        const defaultQuantity = 100

        await inventoryService.createInventoryLevels(
          Object.entries(inventoryItemIds).map(([key, inventoryItemId]) => ({
            inventory_item_id: inventoryItemId,
            location_id: location.id,
            stocked_quantity:
              quantities[key as keyof typeof inventoryItemIds] ?? defaultQuantity,
          })),
        )

        return location
      }

      const createOrder = async (variant: SavedVariant, quantity: number) => {
        const orderService = getContainer().resolve<IOrderModuleService>(
          Modules.ORDER,
        )

        return orderService.createOrders({
          currency_code: "php",
          sales_channel_id: salesChannelId,
          email: "phase7-customer@example.test",
          shipping_address: {
            first_name: "Phase",
            last_name: "Seven",
            address_1: "Disposable integration address",
            city: "Quezon City",
            country_code: "ph",
            postal_code: "1100",
          },
          items: [
            {
              title: variant.title,
              quantity,
              unit_price: 1000,
              product_id: productId,
              product_title: "Phase 7 GHK-CU",
              variant_id: variant.id,
              variant_title: variant.title,
              variant_sku: variant.sku,
              requires_shipping: true,
            },
          ],
        })
      }

      const reserveOrder = async (
        order: Awaited<ReturnType<typeof createOrder>>,
        variant: SavedVariant,
        locationId: string,
      ) => {
        const lineItem = order.items?.[0]

        if (!lineItem) {
          throw new Error("Created order is missing its line item")
        }

        return createReservationsWorkflow(getContainer()).run({
          input: {
            reservations: linksForVariant(variant.id).map((link) => ({
              line_item_id: lineItem.id,
              inventory_item_id: link.inventory_item_id,
              location_id: locationId,
              quantity: Number(link.required_quantity) * Number(lineItem.quantity),
              allow_backorder: false,
              description: `Phase 7 reservation for ${variant.sku}`,
            })),
          },
        })
      }

      const availability = async (variantId: string, locationId: string) => {
        const response = await api.get(
          "/admin/bom/availability",
          {
            ...adminConfig(),
            params: {
              variant_ids: variantId,
              location_id: locationId,
            },
          },
        )

        expect(response.status).toBe(200)
        return response.data.variants[0]
      }

      beforeAll(async () => {
        const container = getContainer()
        const config = container.resolve<{
          projectConfig: { http: { jwtSecret: string } }
        }>(ContainerRegistrationKeys.CONFIG_MODULE)
        const userService = container.resolve<IUserModuleService>(Modules.USER)
        const salesChannelService =
          container.resolve<ISalesChannelModuleService>(Modules.SALES_CHANNEL)
        const fulfillmentService =
          container.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
        const inventoryService = container.resolve<IInventoryService>(
          Modules.INVENTORY,
        )
        const user = await userService.createUsers({
          email: "phase7-admin@example.test",
        })
        const salesChannel = await salesChannelService.createSalesChannels({
          name: "Phase 7 disposable channel",
        })
        const shippingProfile = await fulfillmentService.createShippingProfiles({
          name: "Phase 7 disposable shipping",
          type: "default",
        })
        const inventoryItems = await inventoryService.createInventoryItems([
          { sku: "PHASE7-GHKCU-50MG", title: "GHK-CU 50 mg finished vial" },
          { sku: "PHASE7-BAC-10ML", title: "10 mL BAC Water" },
          { sku: "PHASE7-SYRINGE-1CC", title: "1 cc syringe" },
          { sku: "PHASE7-SYRINGE-3CC", title: "3 cc syringe" },
          { sku: "PHASE7-ALCOHOL-PAD", title: "Alcohol pad" },
          { sku: "PHASE7-MAILER", title: "Mailer box" },
        ])

        adminUserId = user.id
        runtimeJwtSecret = config.projectConfig.http.jwtSecret
        salesChannelId = salesChannel.id
        shippingProfileId = shippingProfile.id
        inventoryItemIds = {
          finishedVial: inventoryItems[0].id,
          bacWater: inventoryItems[1].id,
          syringe1cc: inventoryItems[2].id,
          syringe3cc: inventoryItems[3].id,
          alcoholPad: inventoryItems[4].id,
          mailer: inventoryItems[5].id,
        }

        await Promise.all(
          Object.entries(inventoryItemIds).map(([key, inventoryItemId]) =>
            setComponentProfileWorkflow(container).run({
              input: {
                inventoryItemId,
                baseUnit: "piece",
                displayUnit: "piece",
                baseUnitsPerDisplayUnit: 1,
                displayPrecision: 0,
                reorderThresholdBaseUnits: 10,
                classification:
                  key === "finishedVial"
                    ? "finished_product"
                    : key === "mailer"
                      ? "packaging"
                      : "included_supply",
                supplierUnit: key === "alcoholPad" ? "box" : "piece",
                inventoryUnitsPerSupplierUnit: key === "alcoholPad" ? 100 : 1,
                category: key === "mailer" ? "packaging" : "component",
                lotTrackingRequired: key === "finishedVial",
                expiryTrackingRequired:
                  key === "finishedVial" || key === "bacWater",
              },
            }),
          ),
        )

        const snapshot = lifecycleSnapshot({
          finishedVial: inventoryItemIds.finishedVial,
          bacWater: inventoryItemIds.bacWater,
          syringe1cc: inventoryItemIds.syringe1cc,
          syringe3cc: inventoryItemIds.syringe3cc,
          alcoholPad: inventoryItemIds.alcoholPad,
          mailer: inventoryItemIds.mailer,
        })
        const suffix = Date.now()
        const createdConfiguration = await api.post(
          "/admin/compounded-product/presentations",
          { key: `phase7_lifecycle_${suffix}`, snapshot },
          adminConfig(),
        )
        expect(createdConfiguration.status).toBe(201)
        const presentation = createdConfiguration.data.presentation
        const revision = createdConfiguration.data.current_revision
        presentationRevisionId = revision.id
        presentationFingerprint = revision.fingerprint
        const activated = await api.post(
          `/admin/compounded-product/presentations/${presentation.id}/transitions`,
          {
            expected_current_revision_id: revision.id,
            target_status: "active",
            reason: "Activate Phase 7 disposable lifecycle presentation",
          },
          adminConfig(),
        )
        expect(activated.status).toBe(200)

        const preview = await api.post(
          "/admin/compounded-product/products/preview",
          {
            presentation_revision_id: revision.id,
            expected_configuration_fingerprint: revision.fingerprint,
            selected_value_keys_by_axis: {
              inclusion: ["vial_only", "vial_bac", "subq_set"],
              net_content: ["fifty_milligrams"],
            },
            excluded_combination_keys: [],
          },
          adminConfig(),
        )
        expect(preview.status).toBe(200)
        const createdDraft = await api.post(
          "/admin/compounded-product/products",
          {
            idempotency_key: `phase7:draft:${suffix}`,
            presentation_revision_id: revision.id,
            expected_configuration_fingerprint: revision.fingerprint,
            selected_value_keys_by_axis: {
              inclusion: ["vial_only", "vial_bac", "subq_set"],
              net_content: ["fifty_milligrams"],
            },
            excluded_combination_keys: [],
            matrix_confirmation: null,
            product: {
              title: "Phase 7 GHK-CU",
              description: "Disposable saved-draft lifecycle fixture",
              handle: `phase7-ghkcu-${suffix}`,
              type_id: null,
              collection_id: null,
              category_ids: [],
              tag_ids: [],
              sales_channel_ids: [salesChannelId],
              shipping_profile_id: shippingProfileId,
              image_urls: [],
              configured_values: {},
            },
            variants: preview.data.matrix.rows.map((row: { key: string }) => ({
              matrix_row_key: row.key,
              sku: "",
              prices: [{ amount: "1000", currency_code: "php" }],
              image_urls: [],
              manage_inventory: true,
              allow_backorder: false,
              configured_values: {},
            })),
          },
          adminConfig(),
        )
        expect(createdDraft.status).toBe(201)
        productId = createdDraft.data.result.product_id

        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const [{ data: rawVariants }, { data: rawLinks }] = await Promise.all([
          query.graph({
            entity: "product_variant",
            fields: ["id", "sku", "title", "metadata"],
            filters: { product_id: productId },
          }),
          query.graph({
            entity: "product_variant_inventory_item",
            fields: ["variant_id", "inventory_item_id", "required_quantity"],
            filters: { variant_id: createdDraft.data.result.variant_ids },
          }),
        ])

        variants = rawVariants as SavedVariant[]
        recipeLinks = rawLinks as RecipeLink[]
      })

      it("saves native variants, automatic SKUs, shared links, and audit snapshots", async () => {
        const container = getContainer()
        const productService = container.resolve<IProductModuleService>(
          Modules.PRODUCT,
        )
        const bomService = container.resolve<PepstackBomModuleService>(
          PEPSTACK_BOM_MODULE,
        )
        const product = await productService.retrieveProduct(productId)
        const snapshots = await bomService.listRecipeAuditSnapshots({
          variant_id: variants.map((variant) => variant.id),
        })

        expect(product.status).toBe("draft")
        expect(variants).toHaveLength(3)
        expect(new Set(variants.map((variant) => variant.sku)).size).toBe(3)
        variants.forEach((variant) => {
          expect(variant.sku).toMatch(/^[A-Z0-9][A-Z0-9._-]*-[A-F0-9]{16}$/)
          expect(linksForVariant(variant.id)).not.toHaveLength(0)
        })
        expect(snapshots).toHaveLength(3)

        const finishedVialLinks = recipeLinks.filter(
          (link) => link.inventory_item_id === inventoryItemIds.finishedVial,
        )
        expect(finishedVialLinks).toHaveLength(3)
        expect(
          new Set(finishedVialLinks.map((link) => link.inventory_item_id)),
        ).toEqual(new Set([inventoryItemIds.finishedVial]))
        expect(
          finishedVialLinks.every(
            (link) => Number(link.required_quantity) === 1,
          ),
        ).toBe(true)
      })

      it("reserves atomically, reduces calculated stock, and releases on cancellation", async () => {
        const variant = variantByTitle("Vial Only")
        const location = await createLocationWithStock("reservation", {
          finishedVial: 1,
          mailer: 1,
        })
        const firstOrder = await createOrder(variant, 1)
        const secondOrder = await createOrder(variant, 1)
        const before = await availability(variant.id, location.id)

        expect(before.calculated_stock).toBe(1)

        const attempts = await Promise.allSettled([
          reserveOrder(firstOrder, variant, location.id),
          reserveOrder(secondOrder, variant, location.id),
        ])
        const fulfilled = attempts.filter(
          (attempt) => attempt.status === "fulfilled",
        )
        const rejected = attempts.filter((attempt) => attempt.status === "rejected")

        expect(fulfilled).toHaveLength(1)
        expect(rejected).toHaveLength(1)
        const reservedOrder =
          attempts[0].status === "fulfilled" ? firstOrder : secondOrder
        const afterReservation = await availability(variant.id, location.id)
        expect(afterReservation.calculated_stock).toBe(0)
        expect(
          afterReservation.components.find(
            (component: { inventory_item_id: string }) =>
              component.inventory_item_id === inventoryItemIds.finishedVial,
          )?.reserved_quantity,
        ).toBe(1)

        await cancelOrderWorkflow(getContainer()).run({
          input: { order_id: reservedOrder.id },
        })

        const afterCancellation = await availability(variant.id, location.id)
        expect(afterCancellation.calculated_stock).toBe(1)
        expect(
          afterCancellation.components.every(
            (component: { reserved_quantity: number }) =>
              component.reserved_quantity === 0,
          ),
        ).toBe(true)
      })

      it("fulfillment consumes every reserved SubQ component exactly once", async () => {
        const container = getContainer()
        const variant = variantByTitle("SubQ Set")
        const location = await createLocationWithStock("fulfillment", {
          finishedVial: 5,
          bacWater: 5,
          syringe1cc: 30,
          syringe3cc: 5,
          alcoholPad: 50,
          mailer: 5,
        })
        const fulfillmentService =
          container.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT)
        const link = container.resolve(ContainerRegistrationKeys.LINK)
        const fulfillmentSet = await fulfillmentService.createFulfillmentSets({
          name: "Phase 7 disposable delivery",
          type: "shipping",
          service_zones: [
            {
              name: "Phase 7 Philippines",
              geo_zones: [{ country_code: "ph", type: "country" }],
            },
          ],
        })

        await link.create([
          {
            [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
            [Modules.FULFILLMENT]: {
              fulfillment_provider_id: "manual_manual",
            },
          },
          {
            [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
            [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
          },
        ])
        const { result: shippingOptions } = await createShippingOptionsWorkflow(
          container,
        ).run({
          input: [
            {
              name: "Phase 7 manual shipping",
              price_type: "flat",
              provider_id: "manual_manual",
              service_zone_id: fulfillmentSet.service_zones[0].id,
              shipping_profile_id: shippingProfileId,
              type: {
                label: "Phase 7 manual",
                description: "Disposable fulfillment option",
                code: `phase7-manual-${Date.now()}`,
              },
              prices: [{ currency_code: "php", amount: 100 }],
              rules: [],
            },
          ],
        })
        const orderService = container.resolve<IOrderModuleService>(Modules.ORDER)
        const order = await orderService.createOrders({
          currency_code: "php",
          sales_channel_id: salesChannelId,
          email: "phase7-fulfillment@example.test",
          shipping_address: {
            first_name: "Phase",
            last_name: "Seven",
            address_1: "Disposable integration address",
            city: "Quezon City",
            country_code: "ph",
            postal_code: "1100",
          },
          items: [
            {
              title: variant.title,
              quantity: 1,
              unit_price: 1000,
              product_id: productId,
              product_title: "Phase 7 GHK-CU",
              variant_id: variant.id,
              variant_title: variant.title,
              variant_sku: variant.sku,
              requires_shipping: true,
            },
          ],
          shipping_methods: [
            {
              name: "Phase 7 manual shipping",
              amount: 100,
              shipping_option_id: shippingOptions[0].id,
              data: {},
            },
          ],
        })
        const lineItem = order.items?.[0]

        if (!lineItem) {
          throw new Error("Fulfillment order is missing its line item")
        }

        await reserveOrder(order, variant, location.id)
        await createOrderFulfillmentWorkflow(container).run({
          input: {
            order_id: order.id,
            items: [{ id: lineItem.id, quantity: 1 }],
            location_id: location.id,
            shipping_option_id: shippingOptions[0].id,
            no_notification: true,
          },
        })

        const inventoryService = container.resolve<IInventoryService>(
          Modules.INVENTORY,
        )
        const levels = await inventoryService.listInventoryLevels({
          location_id: location.id,
        })
        const levelByItem = new Map(
          levels.map((level) => [level.inventory_item_id, level]),
        )
        const requiredByItem = new Map(
          linksForVariant(variant.id).map((recipe) => [
            recipe.inventory_item_id,
            Number(recipe.required_quantity),
          ]),
        )

        for (const [inventoryItemId, required] of requiredByItem) {
          const level = levelByItem.get(inventoryItemId)
          expect(Number(level?.reserved_quantity)).toBe(0)
          const initial =
            inventoryItemId === inventoryItemIds.syringe1cc
              ? 30
              : inventoryItemId === inventoryItemIds.alcoholPad
                ? 50
                : 5
          expect(Number(level?.stocked_quantity)).toBe(initial - required)
        }
      })

      it("compensates the product, links, and snapshots when recipe auditing fails", async () => {
        const suffix = Date.now()
        const failedHandle = `phase7-compensated-${suffix}`

        await dbConnection.raw(`
          CREATE OR REPLACE FUNCTION reject_phase7_recipe_snapshot()
          RETURNS trigger AS $$
          BEGIN
            RAISE EXCEPTION 'forced Phase 7 recipe snapshot failure';
          END;
          $$ LANGUAGE plpgsql;

          CREATE TRIGGER reject_phase7_recipe_snapshot
          BEFORE INSERT ON recipe_audit_snapshot
          FOR EACH ROW EXECUTE FUNCTION reject_phase7_recipe_snapshot();
        `)

        try {
          const service = getContainer().resolve<PepstackBomModuleService>(
            PEPSTACK_BOM_MODULE,
          )
          const existingSnapshot = await service.listRecipeAuditSnapshots(
            { variant_id: variants[0].id },
            { take: 1 },
          )
          expect(existingSnapshot).toHaveLength(1)

          const query = getContainer().resolve(ContainerRegistrationKeys.QUERY)
          const preview = await api.post(
            "/admin/compounded-product/products/preview",
            {
              presentation_revision_id: presentationRevisionId,
              expected_configuration_fingerprint: presentationFingerprint,
              selected_value_keys_by_axis: {
                inclusion: ["vial_only", "vial_bac", "subq_set"],
                net_content: ["fifty_milligrams"],
              },
              excluded_combination_keys: [],
            },
            adminConfig(),
          )
          expect(preview.status).toBe(200)
          const failed = await api.post(
            "/admin/compounded-product/products",
            {
              idempotency_key: `phase7:compensated:${suffix}`,
              presentation_revision_id: presentationRevisionId,
              expected_configuration_fingerprint: presentationFingerprint,
              selected_value_keys_by_axis: {
                inclusion: ["vial_only", "vial_bac", "subq_set"],
                net_content: ["fifty_milligrams"],
              },
              excluded_combination_keys: [],
              matrix_confirmation: null,
              product: {
                title: "Phase 7 compensated product",
                description: null,
                handle: failedHandle,
                type_id: null,
                collection_id: null,
                category_ids: [],
                tag_ids: [],
                sales_channel_ids: [salesChannelId],
                shipping_profile_id: shippingProfileId,
                image_urls: [],
                configured_values: {},
              },
              variants: preview.data.matrix.rows.map((row: { key: string }) => ({
                matrix_row_key: row.key,
                sku: "",
                prices: [{ amount: "1000", currency_code: "php" }],
                image_urls: [],
                manage_inventory: true,
                allow_backorder: false,
                configured_values: {},
              })),
            },
            adminConfig(),
          )

          expect(failed.status).toBeGreaterThanOrEqual(400)
          const { data: compensatedProducts } = await query.graph({
            entity: "product",
            fields: ["id", "variants.id"],
            filters: { handle: failedHandle },
          })
          expect(compensatedProducts).toHaveLength(0)
        } finally {
          await dbConnection.raw(`
            DROP TRIGGER IF EXISTS reject_phase7_recipe_snapshot
              ON recipe_audit_snapshot;
            DROP FUNCTION IF EXISTS reject_phase7_recipe_snapshot();
          `)
        }
      })
    })
  },
})
