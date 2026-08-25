import type {
  IInventoryService,
  IOrderModuleService,
  IProductModuleService,
  IStockLocationService,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  getTotalVariantAvailability,
  Modules,
} from "@medusajs/framework/utils";
import { medusaIntegrationTestRunner } from "@medusajs/test-utils";

import setVariantInventoryKitWorkflow from "../../src/workflows/set-variant-inventory-kit";
import setComponentProfileWorkflow from "../../src/workflows/set-component-profile";

jest.setTimeout(120 * 1000);

medusaIntegrationTestRunner({
  moduleName: "bom-native",
  inApp: true,
  env: {
    STORE_CORS: "http://localhost:8000",
    ADMIN_CORS: "http://localhost:9000",
    AUTH_CORS: "http://localhost:8000,http://localhost:9000",
    JWT_SECRET: "phase-2-disposable-test-secret",
    COOKIE_SECRET: "phase-2-disposable-test-secret",
  },
  testSuite: ({ getContainer }) => {
    describe("Medusa-native BOM inventory kit", () => {
      let variantId: string;
      let activeInventoryItemId: string;
      let vialInventoryItemId: string;
      let labelInventoryItemId: string;

      beforeEach(async () => {
        const container = getContainer();
        const productService = container.resolve<IProductModuleService>(
          Modules.PRODUCT,
        );
        const inventoryService = container.resolve<IInventoryService>(
          Modules.INVENTORY,
        );
        const stockLocationService = container.resolve<IStockLocationService>(
          Modules.STOCK_LOCATION,
        );

        const location = await stockLocationService.createStockLocations({
          name: "Phase 2 Disposable Warehouse",
        });
        const product = await productService.createProducts({
          title: "Phase 2 Disposable Product",
          variants: [
            {
              title: "Phase 2 Variant",
              sku: "PHASE-2-VARIANT",
              manage_inventory: false,
              allow_backorder: true,
            },
          ],
        });
        const inventoryItems = await inventoryService.createInventoryItems([
          { sku: "PHASE-2-ACTIVE", title: "Disposable Active" },
          { sku: "PHASE-2-VIAL", title: "Disposable Vial" },
          { sku: "PHASE-2-LABEL", title: "Disposable Label" },
        ]);

        variantId = product.variants[0].id;
        activeInventoryItemId = inventoryItems[0].id;
        vialInventoryItemId = inventoryItems[1].id;
        labelInventoryItemId = inventoryItems[2].id;

        await Promise.all([
          setComponentProfileWorkflow(container).run({
            input: {
              inventoryItemId: activeInventoryItemId,
              baseUnit: "microgram",
              displayUnit: "mg",
              baseUnitsPerDisplayUnit: 1_000,
              displayPrecision: 2,
              reorderThresholdBaseUnits: 10_000,
              category: "active ingredient",
              lotTrackingRequired: true,
              expiryTrackingRequired: true,
            },
          }),
          setComponentProfileWorkflow(container).run({
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
          }),
          setComponentProfileWorkflow(container).run({
            input: {
              inventoryItemId: labelInventoryItemId,
              baseUnit: "piece",
              displayUnit: "piece",
              baseUnitsPerDisplayUnit: 1,
              displayPrecision: 0,
              reorderThresholdBaseUnits: 10,
              category: "label",
              lotTrackingRequired: false,
              expiryTrackingRequired: false,
            },
          }),
        ]);

        await inventoryService.createInventoryLevels([
          {
            inventory_item_id: activeInventoryItemId,
            location_id: location.id,
            stocked_quantity: 50_000,
          },
          {
            inventory_item_id: vialInventoryItemId,
            location_id: location.id,
            stocked_quantity: 3,
          },
          {
            inventory_item_id: labelInventoryItemId,
            location_id: location.id,
            stocked_quantity: 8,
          },
        ]);
      });

      it("persists a multi-component kit and uses the limiting component", async () => {
        const container = getContainer();

        await setVariantInventoryKitWorkflow(container).run({
          input: {
            variantId,
            components: [
              {
                inventoryItemId: activeInventoryItemId,
                requiredQuantity: 10_000,
              },
              {
                inventoryItemId: vialInventoryItemId,
                requiredQuantity: 1,
              },
              {
                inventoryItemId: labelInventoryItemId,
                requiredQuantity: 1,
              },
            ],
          },
        });

        const query = container.resolve(ContainerRegistrationKeys.QUERY);
        const productService = container.resolve<IProductModuleService>(
          Modules.PRODUCT,
        );
        const { data: links } = await query.graph({
          entity: "product_variant_inventory_item",
          fields: ["variant_id", "inventory_item_id", "required_quantity"],
          filters: { variant_id: variantId },
        });
        const availability = await getTotalVariantAvailability(query, {
          variant_ids: [variantId],
        });
        const variant = await productService.retrieveProductVariant(variantId);

        expect(links).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              inventory_item_id: activeInventoryItemId,
              required_quantity: 10_000,
            }),
            expect.objectContaining({
              inventory_item_id: vialInventoryItemId,
              required_quantity: 1,
            }),
            expect.objectContaining({
              inventory_item_id: labelInventoryItemId,
              required_quantity: 1,
            }),
          ]),
        );
        expect(links).toHaveLength(3);
        expect(availability[variantId].availability).toBe(3);
        expect(variant.manage_inventory).toBe(true);
        expect(variant.allow_backorder).toBe(false);
      });

      it("replaces a pre-order recipe and removes stale native links", async () => {
        const container = getContainer();
        const query = container.resolve(ContainerRegistrationKeys.QUERY);

        await setVariantInventoryKitWorkflow(container).run({
          input: {
            variantId,
            components: [
              {
                inventoryItemId: activeInventoryItemId,
                requiredQuantity: 10_000,
              },
              {
                inventoryItemId: vialInventoryItemId,
                requiredQuantity: 1,
              },
            ],
          },
        });
        await setVariantInventoryKitWorkflow(container).run({
          input: {
            variantId,
            components: [
              {
                inventoryItemId: activeInventoryItemId,
                requiredQuantity: 5_000,
              },
              {
                inventoryItemId: labelInventoryItemId,
                requiredQuantity: 2,
              },
            ],
          },
        });

        const { data: links } = await query.graph({
          entity: "product_variant_inventory_item",
          fields: ["inventory_item_id", "required_quantity"],
          filters: { variant_id: variantId },
        });

        expect(links).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              inventory_item_id: activeInventoryItemId,
              required_quantity: 5_000,
            }),
            expect.objectContaining({
              inventory_item_id: labelInventoryItemId,
              required_quantity: 2,
            }),
          ]),
        );
        expect(links).toHaveLength(2);
        expect(
          links.some((link) => link.inventory_item_id === vialInventoryItemId),
        ).toBe(false);
      });

      it("leaves the active recipe unchanged when validation fails", async () => {
        const container = getContainer();
        const query = container.resolve(ContainerRegistrationKeys.QUERY);

        await setVariantInventoryKitWorkflow(container).run({
          input: {
            variantId,
            components: [
              {
                inventoryItemId: vialInventoryItemId,
                requiredQuantity: 1,
              },
            ],
          },
        });

        const failedExecution = await setVariantInventoryKitWorkflow(
          container,
        ).run({
          input: {
            variantId,
            components: [
              {
                inventoryItemId: "iitem_missing",
                requiredQuantity: 1,
              },
            ],
          },
          throwOnError: false,
        });

        expect(failedExecution.errors).toEqual([
          expect.objectContaining({
            error: expect.objectContaining({
              message: "inventory items were not found: iitem_missing",
            }),
          }),
        ]);

        const { data: links } = await query.graph({
          entity: "product_variant_inventory_item",
          fields: ["inventory_item_id", "required_quantity"],
          filters: { variant_id: variantId },
        });

        expect(links).toEqual([
          expect.objectContaining({
            inventory_item_id: vialInventoryItemId,
            required_quantity: 1,
          }),
        ]);
      });

      it("prevents a material recipe change after the variant is ordered", async () => {
        const container = getContainer();
        const query = container.resolve(ContainerRegistrationKeys.QUERY);
        const orderService = container.resolve<IOrderModuleService>(
          Modules.ORDER,
        );

        await setVariantInventoryKitWorkflow(container).run({
          input: {
            variantId,
            components: [
              {
                inventoryItemId: vialInventoryItemId,
                requiredQuantity: 1,
              },
            ],
          },
        });
        await orderService.createOrders({
          currency_code: "php",
          items: [
            {
              title: "Phase 2 Ordered Variant",
              quantity: 1,
              unit_price: 100,
              variant_id: variantId,
            },
          ],
        });

        const failedExecution = await setVariantInventoryKitWorkflow(
          container,
        ).run({
          input: {
            variantId,
            components: [
              {
                inventoryItemId: labelInventoryItemId,
                requiredQuantity: 1,
              },
            ],
          },
          throwOnError: false,
        });

        expect(failedExecution.errors).toEqual([
          expect.objectContaining({
            error: expect.objectContaining({
              message:
                "an inventory kit cannot change after the variant has been ordered; create a new variant instead",
            }),
          }),
        ]);

        const { data: links } = await query.graph({
          entity: "product_variant_inventory_item",
          fields: ["inventory_item_id", "required_quantity"],
          filters: { variant_id: variantId },
        });

        expect(links).toEqual([
          expect.objectContaining({
            inventory_item_id: vialInventoryItemId,
            required_quantity: 1,
          }),
        ]);
      });
    });
  },
});
