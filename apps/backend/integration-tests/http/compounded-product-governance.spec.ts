import type {
  IFulfillmentModuleService,
  IInventoryService,
  IProductModuleService,
  ISalesChannelModuleService,
  IUserModuleService,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  generateJwtToken,
  Modules,
} from "@medusajs/framework/utils"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

import { COMPOUNDED_PRODUCT_MODULE } from "../../src/modules/compounded-product"
import type { CompoundedProductPresentationSnapshot } from "../../src/modules/compounded-product/contracts/configuration"
import { DEFAULT_COMPOUNDED_PRODUCT_READINESS_POLICY } from "../../src/modules/compounded-product/contracts/governance"
import type CompoundedProductModuleService from "../../src/modules/compounded-product/service"
import createCompoundedProductPresentationWorkflow from "../../src/workflows/create-compounded-product-presentation"
import setComponentProfileWorkflow from "../../src/workflows/set-component-profile"
import transitionCompoundedProductPresentationWorkflow from "../../src/workflows/transition-compounded-product-presentation"

jest.setTimeout(180 * 1000)

const jwtSecret = "compounded-product-governance-test-secret"
let runtimeJwtSecret = jwtSecret
let adminUserId = ""

const snapshot: CompoundedProductPresentationSnapshot = {
  schema_version: "1",
  label: "Governed vial",
  description: "Disposable governed presentation",
  fields: [
    {
      key: "net_content",
      label: "Net content",
      help_text: null,
      position: 0,
      requirement: "publication",
      metadata_target: { scope: "variant", key: "net_content" },
      kind: "measurement",
      dimension: "mass",
      allowed_display_units: ["mcg", "mg", "g"],
      allow_product_specific_iu: false,
    },
  ],
  variation_axes: [
    {
      key: "net_content",
      semantic_name: "Net Content",
      help_text: null,
      position: 0,
      values: [
        {
          key: "ten_milligrams",
          label: "10 mg",
          position: 0,
          active: true,
          measurement: {
            amount: "10",
            display_unit: "mg",
            material_profile_id: null,
          },
        },
      ],
    },
  ],
  sku_suggestion_policy: null,
  readiness_policy: DEFAULT_COMPOUNDED_PRODUCT_READINESS_POLICY,
  variant_warning_threshold: 20,
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

medusaIntegrationTestRunner({
  moduleName: "compounded-product-governance-http",
  inApp: true,
  env: {
    STORE_CORS: "http://localhost:8000",
    ADMIN_CORS: "http://localhost:9000",
    AUTH_CORS: "http://localhost:8000,http://localhost:9000",
    JWT_SECRET: jwtSecret,
    COOKIE_SECRET: jwtSecret,
  },
  testSuite: ({ api, getContainer, dbConnection }) => {
    describe("governed compounded-product Admin API", () => {
      let salesChannelId = ""
      let shippingProfileId = ""
      let governedProductTypeId = ""
      let secondGovernedProductTypeId = ""
      let standardProductTypeId = ""

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
        const user = await userService.createUsers({
          email: "governance-admin@example.test",
        })
        const salesChannel = await salesChannelService.createSalesChannels({
          name: "Governance disposable channel",
        })
        const shippingProfile =
          await fulfillmentService.createShippingProfiles({
            name: "Governance disposable shipping",
            type: "default",
          })
        const productService = container.resolve<IProductModuleService>(
          Modules.PRODUCT,
        )
        const [
          governedProductType,
          secondGovernedProductType,
          standardProductType,
        ] =
          await productService.createProductTypes([
            { value: "Governed compounded research product" },
            { value: "Governed alternate compounded presentation" },
            { value: "Standard disposable supply" },
          ])

        adminUserId = user.id
        runtimeJwtSecret = config.projectConfig.http.jwtSecret
        salesChannelId = salesChannel.id
        shippingProfileId = shippingProfile.id
        governedProductTypeId = governedProductType.id
        secondGovernedProductTypeId = secondGovernedProductType.id
        standardProductTypeId = standardProductType.id
      })

      it("requires an impact-reviewed workflow for governed reclassification and removal", async () => {
        const suffix = Date.now()
        const createdConfiguration = await api.post(
          "/admin/compounded-product/presentations",
          { key: `classification_change_${suffix}`, snapshot },
          adminConfig(),
        )
        expect(createdConfiguration.status).toBe(201)
        const presentation = createdConfiguration.data.presentation
        const revision = createdConfiguration.data.current_revision
        expect(
          (
            await api.post(
              `/admin/compounded-product/presentations/${presentation.id}/transitions`,
              {
                expected_current_revision_id: revision.id,
                target_status: "active",
                reason: "Activate classification-change test presentation",
              },
              adminConfig(),
            )
          ).status,
        ).toBe(200)
        for (const productTypeId of [
          governedProductTypeId,
          secondGovernedProductTypeId,
        ]) {
          const response = await api.post(
            "/admin/compounded-product/governed-product-types",
            {
              product_type_id: productTypeId,
              presentation_id: presentation.id,
              reason: "Enable governed classification-change coverage",
            },
            adminConfig(),
          )
          expect(response.status).toBe(201)
        }

        const preview = await api.post(
          "/admin/compounded-product/products/preview",
          {
            presentation_revision_id: revision.id,
            expected_configuration_fingerprint: revision.fingerprint,
            selected_value_keys_by_axis: {
              net_content: ["ten_milligrams"],
            },
            excluded_combination_keys: [],
          },
          adminConfig(),
        )
        expect(preview.status).toBe(200)
        const createdDraft = await api.post(
          "/admin/compounded-product/products",
          {
            idempotency_key: `classification-change:${suffix}`,
            presentation_revision_id: revision.id,
            expected_configuration_fingerprint: revision.fingerprint,
            selected_value_keys_by_axis: {
              net_content: ["ten_milligrams"],
            },
            excluded_combination_keys: [],
            matrix_confirmation: null,
            product: {
              title: "Reclassifiable governed product",
              subtitle: null,
              description: null,
              handle: `reclassifiable-governed-${suffix}`,
              type_id: governedProductTypeId,
              collection_id: null,
              category_ids: [],
              tag_ids: [],
              sales_channel_ids: [salesChannelId],
              shipping_profile_id: shippingProfileId,
              image_urls: [],
              configured_values: {},
            },
            variants: [
              {
                matrix_row_key: preview.data.matrix.rows[0].key,
                sku: `RECLASSIFY-${suffix}`,
                prices: [{ amount: "1000", currency_code: "php" }],
                manage_inventory: false,
                allow_backorder: false,
                configured_values: {
                  net_content: {
                    amount: "10",
                    displayUnit: "mg",
                    dimension: "mass",
                    displayPrecision: 0,
                    provenance: "declared",
                    materialProfileId: null,
                    sourceDocumentId: null,
                    countBasis: null,
                  },
                },
              },
            ],
          },
          adminConfig(),
        )
        expect(createdDraft.status).toBe(201)
        const productId = createdDraft.data.result.product_id

        const reclassificationImpact = await api.post(
          `/admin/compounded-product/products/${productId}/classification-impact`,
          {
            action: "reclassify",
            target_product_type_id: secondGovernedProductTypeId,
          },
          adminConfig(),
        )
        expect(reclassificationImpact.status).toBe(200)
        expect(reclassificationImpact.data.impact).toMatchObject({
          allowed: true,
          current_product_type_id: governedProductTypeId,
          target_product_type_id: secondGovernedProductTypeId,
        })
        const staleDecision = await api.post(
          `/admin/compounded-product/products/${productId}/classification`,
          {
            action: "reclassify",
            target_product_type_id: secondGovernedProductTypeId,
            impact_fingerprint: "a".repeat(64),
            reason: "Exercise stale decision rejection",
          },
          adminConfig(),
        )
        expect(staleDecision.status).toBe(409)
        const reclassified = await api.post(
          `/admin/compounded-product/products/${productId}/classification`,
          {
            action: "reclassify",
            target_product_type_id: secondGovernedProductTypeId,
            impact_fingerprint:
              reclassificationImpact.data.impact.impact_fingerprint,
            reason: "Move to the reviewed governed product type",
          },
          adminConfig(),
        )
        expect(reclassified.status).toBe(200)

        const compensationImpact = await api.post(
          `/admin/compounded-product/products/${productId}/classification-impact`,
          {
            action: "reclassify",
            target_product_type_id: governedProductTypeId,
          },
          adminConfig(),
        )
        expect(compensationImpact.status).toBe(200)
        await dbConnection.raw(`
          CREATE OR REPLACE FUNCTION reject_classification_audit_for_test()
          RETURNS trigger AS $$
          BEGIN
            IF NEW.event_type = 'governed_registration_reclassified' THEN
              RAISE EXCEPTION 'forced classification audit failure';
            END IF;
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;

          CREATE TRIGGER reject_classification_audit_for_test
          BEFORE INSERT ON compounded_product_governance_audit_event
          FOR EACH ROW EXECUTE FUNCTION reject_classification_audit_for_test();
        `)
        try {
          const failedReclassification = await api.post(
            `/admin/compounded-product/products/${productId}/classification`,
            {
              action: "reclassify",
              target_product_type_id: governedProductTypeId,
              impact_fingerprint:
                compensationImpact.data.impact.impact_fingerprint,
              reason: "Force audit failure to verify workflow compensation",
            },
            adminConfig(),
          )
          expect(failedReclassification.status).toBe(500)
        } finally {
          await dbConnection.raw(`
            DROP TRIGGER IF EXISTS reject_classification_audit_for_test
              ON compounded_product_governance_audit_event;
            DROP FUNCTION IF EXISTS reject_classification_audit_for_test();
          `)
        }

        const productService = getContainer().resolve<IProductModuleService>(
          Modules.PRODUCT,
        )
        expect((await productService.retrieveProduct(productId)).type_id).toBe(
          secondGovernedProductTypeId,
        )
        const service = getContainer().resolve<CompoundedProductModuleService>(
          COMPOUNDED_PRODUCT_MODULE,
        )
        expect(
          (
            await service.listGovernedProductRegistrations({
              product_id: productId,
            })
          )[0].governed_product_type_id,
        ).toBe(secondGovernedProductTypeId)

        const removalImpact = await api.post(
          `/admin/compounded-product/products/${productId}/classification-impact`,
          {
            action: "remove_governance",
            target_product_type_id: standardProductTypeId,
          },
          adminConfig(),
        )
        expect(removalImpact.status).toBe(200)
        expect(removalImpact.data.impact.allowed).toBe(true)
        const removed = await api.post(
          `/admin/compounded-product/products/${productId}/classification`,
          {
            action: "remove_governance",
            target_product_type_id: standardProductTypeId,
            impact_fingerprint: removalImpact.data.impact.impact_fingerprint,
            reason: "Move the unused draft into the standard catalog",
          },
          adminConfig(),
        )
        expect(removed.status).toBe(200)

        const nativeProduct = await productService.retrieveProduct(productId)
        expect(nativeProduct.type_id).toBe(standardProductTypeId)
        expect(
          await service.listGovernedProductRegistrations({
            product_id: productId,
          }),
        ).toHaveLength(0)
        const events = await service.listGovernanceAuditEvents({
          product_id: productId,
        })
        expect(events.map((event) => event.event_type)).toEqual(
          expect.arrayContaining([
            "governed_registration_reclassified",
            "governed_registration_removed",
          ]),
        )
      })

      it("audits the lifecycle and blocks native publication bypasses", async () => {
        const suffix = Date.now()
        const key = `governed_vial_${suffix}`
        const createdConfiguration = await api.post(
          "/admin/compounded-product/presentations",
          { key, snapshot },
          adminConfig(),
        )
        expect(createdConfiguration.status).toBe(201)

        const presentation = createdConfiguration.data.presentation
        const revision = createdConfiguration.data.current_revision
        const activated = await api.post(
          `/admin/compounded-product/presentations/${presentation.id}/transitions`,
          {
            expected_current_revision_id: revision.id,
            target_status: "active",
            reason: "Activate disposable governed configuration",
          },
          adminConfig(),
        )
        expect(activated.status).toBe(200)

        const mapping = await api.post(
          "/admin/compounded-product/governed-product-types",
          {
            product_type_id: governedProductTypeId,
            presentation_id: presentation.id,
            reason: "Govern compounded research products for this presentation",
          },
          adminConfig(),
        )
        expect(mapping.status).toBe(201)
        expect(mapping.data.mapping.status).toBe("active")

        const bypassCreate = await api.post(
          "/admin/products",
          {
            title: "Native governed bypass",
            handle: `native-governed-bypass-${suffix}`,
            status: "draft",
            type_id: governedProductTypeId,
            shipping_profile_id: shippingProfileId,
            options: [{ title: "Default", values: ["Default"] }],
          },
          adminConfig(),
        )
        expect(bypassCreate.status).not.toBe(200)

        const standardProduct = await api.post(
          "/admin/products",
          {
            title: "Standard disposable supply",
            handle: `standard-supply-${suffix}`,
            status: "draft",
            type_id: standardProductTypeId,
            shipping_profile_id: shippingProfileId,
            options: [{ title: "Default", values: ["Default"] }],
          },
          adminConfig(),
        )
        expect(standardProduct.status).toBe(200)

        const bypassReclassification = await api.post(
          `/admin/products/${standardProduct.data.product.id}`,
          { type_id: governedProductTypeId },
          adminConfig(),
        )
        expect(bypassReclassification.status).not.toBe(200)

        const preview = await api.post(
          "/admin/compounded-product/products/preview",
          {
            presentation_revision_id: revision.id,
            expected_configuration_fingerprint: revision.fingerprint,
            selected_value_keys_by_axis: {
              net_content: ["ten_milligrams"],
            },
            excluded_combination_keys: [],
          },
          adminConfig(),
        )
        expect(preview.status).toBe(200)
        const matrixRow = preview.data.matrix.rows[0]

        const createdDraft = await api.post(
          "/admin/compounded-product/products",
          {
            idempotency_key: `governance:draft:${Date.now()}`,
            presentation_revision_id: revision.id,
            expected_configuration_fingerprint: revision.fingerprint,
            selected_value_keys_by_axis: {
              net_content: ["ten_milligrams"],
            },
            excluded_combination_keys: [],
            matrix_confirmation: null,
            product: {
              title: "Disposable governed 10 mg vial",
              subtitle: null,
              description: null,
              handle: `governed-vial-${suffix}-product`,
              type_id: governedProductTypeId,
              collection_id: null,
              category_ids: [],
              tag_ids: [],
              sales_channel_ids: [salesChannelId],
              shipping_profile_id: shippingProfileId,
              image_urls: [],
              configured_values: {},
            },
            variants: [
              {
                matrix_row_key: matrixRow.key,
                sku: "",
                prices: [{ amount: "1000", currency_code: "php" }],
                manage_inventory: false,
                allow_backorder: false,
                configured_values: {
                  net_content: {
                    amount: "10",
                    displayUnit: "mg",
                    dimension: "mass",
                    displayPrecision: 0,
                    provenance: "declared",
                    materialProfileId: null,
                    sourceDocumentId: null,
                    countBasis: null,
                  },
                },
              },
            ],
          },
          adminConfig(),
        )
        expect(createdDraft.status).toBe(201)
        const productId = createdDraft.data.result.product_id

        const readiness = await api.get(
          `/admin/compounded-product/products/${productId}/readiness`,
          adminConfig(),
        )
        expect(readiness.status).toBe(200)
        expect(readiness.data.ready).toBe(true)
        expect(readiness.data.variants[0].sku).toMatch(
          /^GOVERNED-VIAL-[A-Z0-9-]+-[A-F0-9]{16}$/,
        )

        const bypassPublish = await api.post(
          `/admin/products/${productId}`,
          { status: "published" },
          adminConfig(),
        )
        expect(bypassPublish.status).not.toBe(200)

        const published = await api.post(
          `/admin/compounded-product/products/${productId}/publication`,
          { action: "publish", reason: "All readiness checks pass" },
          adminConfig(),
        )
        expect(published.status).toBe(200)
        expect(published.data.accepted).toBe(true)

        const bypassWithdraw = await api.post(
          `/admin/products/${productId}`,
          { status: "draft" },
          adminConfig(),
        )
        expect(bypassWithdraw.status).not.toBe(200)

        const withdrawn = await api.post(
          `/admin/compounded-product/products/${productId}/publication`,
          { action: "withdraw", reason: "Withdraw disposable test product" },
          adminConfig(),
        )
        expect(withdrawn.status).toBe(200)

        const events = await api.get(
          `/admin/compounded-product/products/${productId}/audit-events`,
          adminConfig(),
        )
        expect(events.status).toBe(200)
        expect(events.data.audit_events.map((event: any) => event.event_type))
          .toEqual(
            expect.arrayContaining([
              "governed_registration_created",
              "product_draft_created",
              "readiness_evaluated",
              "publication_succeeded",
              "publication_withdrawn",
            ]),
          )

        const productService = getContainer().resolve<IProductModuleService>(
          Modules.PRODUCT,
        )
        const nativeProduct = await productService.retrieveProduct(productId)
        expect(nativeProduct.status).toBe("draft")
        expect(nativeProduct.type_id).toBe(governedProductTypeId)

        const service = getContainer().resolve<CompoundedProductModuleService>(
          COMPOUNDED_PRODUCT_MODULE,
        )
        const [registration] =
          await service.listGovernedProductRegistrations({
            product_id: productId,
          })
        expect(registration.governed_product_type_id).toBe(
          governedProductTypeId,
        )
        const classificationEvents = await service.listGovernanceAuditEvents({
          correlation_id: mapping.data.mapping.id,
        })
        expect(classificationEvents.map((event) => event.event_type)).toContain(
          "classification_mapping_created",
        )

        const failedHandle = `audit-compensated-${suffix}`
        const failedIdempotencyKey = `governance:audit-compensated:${suffix}`
        await dbConnection.raw(`
          CREATE OR REPLACE FUNCTION reject_draft_audit_for_test()
          RETURNS trigger AS $$
          BEGIN
            IF NEW.event_type = 'governed_registration_created' THEN
              RAISE EXCEPTION 'forced product draft audit failure';
            END IF;
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;

          CREATE TRIGGER reject_draft_audit_for_test
          BEFORE INSERT ON compounded_product_governance_audit_event
          FOR EACH ROW EXECUTE FUNCTION reject_draft_audit_for_test();
        `)
        try {
          const failedDraft = await api.post(
            "/admin/compounded-product/products",
            {
              idempotency_key: failedIdempotencyKey,
              presentation_revision_id: revision.id,
              expected_configuration_fingerprint: revision.fingerprint,
              selected_value_keys_by_axis: {
                net_content: ["ten_milligrams"],
              },
              excluded_combination_keys: [],
              matrix_confirmation: null,
              product: {
                title: "Audit-compensated governed draft",
                subtitle: null,
                description: null,
                handle: failedHandle,
                type_id: governedProductTypeId,
                collection_id: null,
                category_ids: [],
                tag_ids: [],
                sales_channel_ids: [salesChannelId],
                shipping_profile_id: shippingProfileId,
                image_urls: [],
                configured_values: {},
              },
              variants: [
                {
                  matrix_row_key: matrixRow.key,
                  sku: `AUDIT-COMPENSATED-${suffix}`,
                  prices: [{ amount: "1000", currency_code: "php" }],
                  manage_inventory: false,
                  allow_backorder: false,
                  configured_values: {
                    net_content: {
                      amount: "10",
                      displayUnit: "mg",
                      dimension: "mass",
                      displayPrecision: 0,
                      provenance: "declared",
                      materialProfileId: null,
                      sourceDocumentId: null,
                      countBasis: null,
                    },
                  },
                },
              ],
            },
            adminConfig(),
          )
          expect(failedDraft.status).toBe(500)
        } finally {
          await dbConnection.raw(`
            DROP TRIGGER IF EXISTS reject_draft_audit_for_test
              ON compounded_product_governance_audit_event;
            DROP FUNCTION IF EXISTS reject_draft_audit_for_test();
          `)
        }

        expect(await productService.listProducts({ handle: failedHandle })).toHaveLength(0)
        const [failedRequest] = await service.listProductCreationRequests({
          operation: "create_product",
          idempotency_key: failedIdempotencyKey,
        })
        expect(failedRequest).toMatchObject({
          status: "failed",
          native_product_id: null,
          response_payload: null,
          error_code: "workflow_compensated",
        })
      })

      it("requires and audits stale-revision retain or migrate decisions", async () => {
        const suffix = Date.now()
        const created = await api.post(
          "/admin/compounded-product/presentations",
          { key: `revision_decision_${suffix}`, snapshot },
          adminConfig(),
        )
        expect(created.status).toBe(201)
        const presentation = created.data.presentation
        const revisionOne = created.data.current_revision
        expect(
          (
            await api.post(
              `/admin/compounded-product/presentations/${presentation.id}/transitions`,
              {
                expected_current_revision_id: revisionOne.id,
                target_status: "active",
                reason: "Activate revision one for an in-progress draft",
              },
              adminConfig(),
            )
          ).status,
        ).toBe(200)

        const oldPreview = await api.post(
          "/admin/compounded-product/products/preview",
          {
            presentation_revision_id: revisionOne.id,
            expected_configuration_fingerprint: revisionOne.fingerprint,
            selected_value_keys_by_axis: {
              net_content: ["ten_milligrams"],
            },
            excluded_combination_keys: [],
          },
          adminConfig(),
        )
        expect(oldPreview.status).toBe(200)

        const revised = await api.post(
          `/admin/compounded-product/presentations/${presentation.id}/revisions`,
          {
            expected_current_revision_id: revisionOne.id,
            snapshot: { ...snapshot, label: "Governed vial revision two" },
            reason: "Update the presentation label without rewriting history",
          },
          adminConfig(),
        )
        expect(revised.status).toBe(201)
        const revisionTwo = revised.data.current_revision
        expect(
          (
            await api.post(
              `/admin/compounded-product/presentations/${presentation.id}/transitions`,
              {
                expected_current_revision_id: revisionTwo.id,
                target_status: "active",
                reason: "Activate revision two",
              },
              adminConfig(),
            )
          ).status,
        ).toBe(200)

        const impactResponse = await api.post(
          "/admin/compounded-product/products/revision-impact",
          {
            from_revision_id: revisionOne.id,
            to_revision_id: revisionTwo.id,
          },
          adminConfig(),
        )
        expect(impactResponse.status).toBe(200)
        expect(impactResponse.data.impact).toMatchObject({
          retain_eligible: true,
          label_changed: true,
        })

        const draftBody = (input: {
          idempotencyKey: string
          revision: any
          row: any
          title: string
          sku: string
          resolution?: Record<string, unknown> | null
        }) => ({
          idempotency_key: input.idempotencyKey,
          presentation_revision_id: input.revision.id,
          expected_configuration_fingerprint: input.revision.fingerprint,
          configuration_revision_resolution: input.resolution || null,
          selected_value_keys_by_axis: {
            net_content: ["ten_milligrams"],
          },
          excluded_combination_keys: [],
          matrix_confirmation: null,
          product: {
            title: input.title,
            subtitle: null,
            description: null,
            handle: `revision-decision-${suffix}-${input.sku.toLowerCase()}`,
            type_id: null,
            collection_id: null,
            category_ids: [],
            tag_ids: [],
            sales_channel_ids: [salesChannelId],
            shipping_profile_id: shippingProfileId,
            image_urls: [],
            configured_values: {},
          },
          variants: [
            {
              matrix_row_key: input.row.key,
              sku: input.sku,
              prices: [{ amount: "1000", currency_code: "php" }],
              manage_inventory: false,
              allow_backorder: false,
              configured_values: {
                net_content: {
                  amount: "10",
                  displayUnit: "mg",
                  dimension: "mass",
                  displayPrecision: 0,
                  provenance: "declared",
                  materialProfileId: null,
                  sourceDocumentId: null,
                  countBasis: null,
                },
              },
            },
          ],
        })

        const missingDecision = await api.post(
          "/admin/compounded-product/products",
          draftBody({
            idempotencyKey: `stale:missing:${suffix}`,
            revision: revisionOne,
            row: oldPreview.data.matrix.rows[0],
            title: "Stale decision missing",
            sku: `STALE-MISSING-${suffix}`,
          }),
          adminConfig(),
        )
        expect(missingDecision.status).toBe(409)

        const resolution = {
          from_revision_id: revisionOne.id,
          to_revision_id: revisionTwo.id,
          impact_fingerprint: impactResponse.data.impact.impact_fingerprint,
        }
        const retained = await api.post(
          "/admin/compounded-product/products",
          draftBody({
            idempotencyKey: `stale:retain:${suffix}`,
            revision: revisionOne,
            row: oldPreview.data.matrix.rows[0],
            title: "Retained revision product",
            sku: `STALE-RETAIN-${suffix}`,
            resolution: {
              ...resolution,
              action: "retain",
              reason: "Complete the reviewed draft with its pinned configuration",
            },
          }),
          adminConfig(),
        )
        expect(retained.status).toBe(201)

        const newPreview = await api.post(
          "/admin/compounded-product/products/preview",
          {
            presentation_revision_id: revisionTwo.id,
            expected_configuration_fingerprint: revisionTwo.fingerprint,
            selected_value_keys_by_axis: {
              net_content: ["ten_milligrams"],
            },
            excluded_combination_keys: [],
          },
          adminConfig(),
        )
        expect(newPreview.status).toBe(200)
        const migrated = await api.post(
          "/admin/compounded-product/products",
          draftBody({
            idempotencyKey: `stale:migrate:${suffix}`,
            revision: revisionTwo,
            row: newPreview.data.matrix.rows[0],
            title: "Migrated revision product",
            sku: `STALE-MIGRATE-${suffix}`,
            resolution: {
              ...resolution,
              action: "migrate",
              reason: "Rebuild the unfinished draft on the active configuration",
            },
          }),
          adminConfig(),
        )
        expect(migrated.status).toBe(201)

        const retainedEvents = await api.get(
          `/admin/compounded-product/products/${retained.data.result.product_id}/audit-events`,
          adminConfig(),
        )
        const migratedEvents = await api.get(
          `/admin/compounded-product/products/${migrated.data.result.product_id}/audit-events`,
          adminConfig(),
        )
        expect(
          retainedEvents.data.audit_events.map((event: any) => event.event_type),
        ).toContain("configuration_revision_retained")
        expect(
          migratedEvents.data.audit_events.map((event: any) => event.event_type),
        ).toContain("configuration_revision_migrated")
      })

      it("serializes draft creation and rejects conflicting idempotency reuse", async () => {
        const suffix = Date.now()
        const configuration =
          await createCompoundedProductPresentationWorkflow(
            getContainer(),
          ).run({
            input: {
              key: `concurrent_governed_${suffix}`,
              snapshot,
              actorId: adminUserId,
            },
          })
        const activated =
          await transitionCompoundedProductPresentationWorkflow(
            getContainer(),
          ).run({
            input: {
              presentationId: configuration.result.presentation.id,
              expected_current_revision_id:
                configuration.result.current_revision.id,
              target_status: "active",
              reason: "Activate concurrent creation test configuration",
              actorId: adminUserId,
            },
          })
        const revision = activated.result.current_revision
        const preview = await api.post(
          "/admin/compounded-product/products/preview",
          {
            presentation_revision_id: revision.id,
            expected_configuration_fingerprint: revision.fingerprint,
            selected_value_keys_by_axis: {
              net_content: ["ten_milligrams"],
            },
            excluded_combination_keys: [],
          },
          adminConfig(),
        )
        expect(preview.status).toBe(200)

        const handle = `concurrent-governed-${suffix}`
        const idempotencyKey = `governance:concurrent:${suffix}`
        const request = {
          idempotency_key: idempotencyKey,
          presentation_revision_id: revision.id,
          expected_configuration_fingerprint: revision.fingerprint,
          selected_value_keys_by_axis: {
            net_content: ["ten_milligrams"],
          },
          excluded_combination_keys: [],
          matrix_confirmation: null,
          product: {
            title: "Concurrent governed 10 mg vial",
            subtitle: null,
            description: null,
            handle,
            type_id: null,
            collection_id: null,
            category_ids: [],
            tag_ids: [],
            sales_channel_ids: [salesChannelId],
            shipping_profile_id: shippingProfileId,
            image_urls: [],
            configured_values: {},
          },
          variants: [
            {
              matrix_row_key: preview.data.matrix.rows[0].key,
              sku: `CONCURRENT-${suffix}`,
              prices: [{ amount: "1000", currency_code: "php" }],
              manage_inventory: false,
              allow_backorder: false,
              configured_values: {
                net_content: {
                  amount: "10",
                  displayUnit: "mg",
                  dimension: "mass",
                  displayPrecision: 0,
                  provenance: "declared",
                  materialProfileId: null,
                  sourceDocumentId: null,
                  countBasis: null,
                },
              },
            },
          ],
        }

        const concurrent = await Promise.all([
          api.post(
            "/admin/compounded-product/products",
            request,
            adminConfig(),
          ),
          api.post(
            "/admin/compounded-product/products",
            request,
            adminConfig(),
          ),
        ])
        expect(concurrent.map((response) => response.status).sort()).toEqual([
          200,
          201,
        ])
        expect(concurrent[0].data.result.product_id).toBe(
          concurrent[1].data.result.product_id,
        )

        const replay = await api.post(
          "/admin/compounded-product/products",
          request,
          adminConfig(),
        )
        expect(replay.status).toBe(200)
        expect(replay.data.result.product_id).toBe(
          concurrent[0].data.result.product_id,
        )

        const conflict = await api.post(
          "/admin/compounded-product/products",
          {
            ...request,
            product: {
              ...request.product,
              title: "Conflicting governed product",
            },
          },
          adminConfig(),
        )
        expect(conflict.status).toBe(409)

        const productService = getContainer().resolve<IProductModuleService>(
          Modules.PRODUCT,
        )
        const products = await productService.listProducts({ handle })
        expect(products).toHaveLength(1)

        const service = getContainer().resolve<CompoundedProductModuleService>(
          COMPOUNDED_PRODUCT_MODULE,
        )
        const registrations = await service.listGovernedProductRegistrations({
          product_id: concurrent[0].data.result.product_id,
        })
        expect(registrations).toHaveLength(1)
      })

      it("preserves the successful governed product when concurrent requests share a SKU", async () => {
        const suffix = Date.now()
        const configuration =
          await createCompoundedProductPresentationWorkflow(
            getContainer(),
          ).run({
            input: {
              key: `concurrent_sku_${suffix}`,
              snapshot,
              actorId: adminUserId,
            },
          })
        const activated =
          await transitionCompoundedProductPresentationWorkflow(
            getContainer(),
          ).run({
            input: {
              presentationId: configuration.result.presentation.id,
              expected_current_revision_id:
                configuration.result.current_revision.id,
              target_status: "active",
              reason: "Activate concurrent SKU-conflict test configuration",
              actorId: adminUserId,
            },
          })
        const revision = activated.result.current_revision
        const preview = await api.post(
          "/admin/compounded-product/products/preview",
          {
            presentation_revision_id: revision.id,
            expected_configuration_fingerprint: revision.fingerprint,
            selected_value_keys_by_axis: {
              net_content: ["ten_milligrams"],
            },
            excluded_combination_keys: [],
          },
          adminConfig(),
        )
        expect(preview.status).toBe(200)

        const sharedSku = `SHARED-SKU-${suffix}`
        const requestFor = (requestSuffix: string) => ({
          idempotency_key: `governance:sku-conflict:${suffix}:${requestSuffix}`,
          presentation_revision_id: revision.id,
          expected_configuration_fingerprint: revision.fingerprint,
          selected_value_keys_by_axis: {
            net_content: ["ten_milligrams"],
          },
          excluded_combination_keys: [],
          matrix_confirmation: null,
          product: {
            title: `Concurrent SKU product ${requestSuffix}`,
            subtitle: null,
            description: null,
            handle: `concurrent-sku-${suffix}-${requestSuffix}`,
            type_id: null,
            collection_id: null,
            category_ids: [],
            tag_ids: [],
            sales_channel_ids: [salesChannelId],
            shipping_profile_id: shippingProfileId,
            image_urls: [],
            configured_values: {},
          },
          variants: [
            {
              matrix_row_key: preview.data.matrix.rows[0].key,
              sku: sharedSku,
              prices: [{ amount: "1000", currency_code: "php" }],
              manage_inventory: false,
              allow_backorder: false,
              configured_values: {
                net_content: {
                  amount: "10",
                  displayUnit: "mg",
                  dimension: "mass",
                  displayPrecision: 0,
                  provenance: "declared",
                  materialProfileId: null,
                  sourceDocumentId: null,
                  countBasis: null,
                },
              },
            },
          ],
        })

        const responses = await Promise.all([
          api.post(
            "/admin/compounded-product/products",
            requestFor("first"),
            adminConfig(),
          ),
          api.post(
            "/admin/compounded-product/products",
            requestFor("second"),
            adminConfig(),
          ),
        ])
        const succeeded = responses.filter((response) => response.status === 201)
        const rejected = responses.filter((response) => response.status >= 400)

        expect(succeeded).toHaveLength(1)
        expect(rejected).toHaveLength(1)
        expect(rejected[0].data.message).toContain("already exists")

        const productId = succeeded[0].data.result.product_id
        const productService = getContainer().resolve<IProductModuleService>(
          Modules.PRODUCT,
        )
        const successfulProduct = await productService.retrieveProduct(
          productId,
          { relations: ["variants"] },
        )
        expect(successfulProduct.variants).toHaveLength(1)
        expect(successfulProduct.variants?.[0].sku).toBe(sharedSku)

        const service = getContainer().resolve<CompoundedProductModuleService>(
          COMPOUNDED_PRODUCT_MODULE,
        )
        const registrations = await service.listGovernedProductRegistrations({
          product_id: productId,
        })
        expect(registrations).toHaveLength(1)

        const requests = await service.listProductCreationRequests({
          operation: "create_product",
          idempotency_key: [
            `governance:sku-conflict:${suffix}:first`,
            `governance:sku-conflict:${suffix}:second`,
          ],
        })
        expect(requests.map((request) => request.status).sort()).toEqual([
          "failed",
          "succeeded",
        ])
      })

      it("records rejected publication without mutating the native product", async () => {
        const container = getContainer()
        const productService = container.resolve<IProductModuleService>(
          Modules.PRODUCT,
        )
        const service = container.resolve<CompoundedProductModuleService>(
          COMPOUNDED_PRODUCT_MODULE,
        )
        const configuration =
          await createCompoundedProductPresentationWorkflow(container).run({
            input: {
              key: `incomplete_governed_${Date.now()}`,
              snapshot,
              actorId: adminUserId,
            },
          })
        const activated =
          await transitionCompoundedProductPresentationWorkflow(container).run({
            input: {
              presentationId: configuration.result.presentation.id,
              expected_current_revision_id:
                configuration.result.current_revision.id,
              target_status: "active",
              reason: "Activate incomplete-product test configuration",
              actorId: adminUserId,
            },
          })
        const activeRevision = activated.result.current_revision
        const product = await productService.createProducts({
          title: "Incomplete governed product",
          status: "draft",
          metadata: {
            compounded_product: { schema_version: "1" },
          },
          variants: [
            {
              title: "Incomplete variant",
              sku: `INCOMPLETE-${Date.now()}`,
              manage_inventory: false,
              metadata: {
                compounded_product: { schema_version: "1" },
              },
            },
          ],
        })
        const policy = {
          schema_version: "1" as const,
          require_price: true,
          require_sales_channel: true,
          require_bom_for_managed_inventory: true,
          require_valid_structured_measurements: true,
          require_governance_audit: true,
        }
        await service.createGovernedProductRegistrations({
          product_id: product.id,
          catalog_kind: "compounded",
          contract_schema_version: "1",
          configuration_snapshot: activeRevision.snapshot,
          configuration_fingerprint: activeRevision.fingerprint,
          readiness_policy_revision: "1",
          readiness_policy_snapshot: policy,
          state: "draft",
          created_by_actor_id: adminUserId,
          updated_by_actor_id: adminUserId,
          published_at: null,
          withdrawn_at: null,
          presentation_revision_id: activeRevision.id,
        })

        const rejected = await api.post(
          `/admin/compounded-product/products/${product.id}/publication`,
          { action: "publish", reason: "Exercise blocker audit" },
          adminConfig(),
        )
        expect(rejected.status).toBe(409)
        expect(rejected.data.accepted).toBe(false)
        expect(rejected.data.readiness.blockers).toEqual(
          expect.arrayContaining(["price_missing", "sales_channel_missing"]),
        )

        const unchanged = await productService.retrieveProduct(product.id)
        expect(unchanged.status).toBe("draft")
        const auditEvents = await service.listGovernanceAuditEvents({
          product_id: product.id,
        })
        expect(auditEvents.map((event) => event.event_type)).toEqual(
          expect.arrayContaining([
            "readiness_evaluated",
            "publication_rejected",
          ]),
        )
        await expect(
          service.updateGovernanceAuditEvents({
            id: auditEvents[0].id,
            outcome: "succeeded",
          }),
        ).rejects.toThrow("immutable")
        await expect(
          service.deleteGovernanceAuditEvents(auditEvents[0].id),
        ).rejects.toThrow("cannot be deleted")
      })

      it("sets a governed variant recipe through the authenticated workflow boundary", async () => {
        const container = getContainer()
        const productService = container.resolve<IProductModuleService>(
          Modules.PRODUCT,
        )
        const inventoryService = container.resolve<IInventoryService>(
          Modules.INVENTORY,
        )
        const service = container.resolve<CompoundedProductModuleService>(
          COMPOUNDED_PRODUCT_MODULE,
        )
        const suffix = Date.now()
        const configuration =
          await createCompoundedProductPresentationWorkflow(container).run({
            input: {
              key: `recipe_governed_${suffix}`,
              snapshot,
              actorId: adminUserId,
            },
          })
        const activated =
          await transitionCompoundedProductPresentationWorkflow(container).run({
            input: {
              presentationId: configuration.result.presentation.id,
              expected_current_revision_id:
                configuration.result.current_revision.id,
              target_status: "active",
              reason: "Activate recipe workflow test configuration",
              actorId: adminUserId,
            },
          })
        const product = await productService.createProducts({
          title: "Governed recipe product",
          status: "draft",
          metadata: { compounded_product: { schema_version: "1" } },
          variants: [
            {
              title: "10 mg vial",
              sku: `RECIPE-${suffix}`,
              manage_inventory: true,
              allow_backorder: false,
              metadata: { compounded_product: { schema_version: "1" } },
            },
          ],
        })
        const unrelatedProduct = await productService.createProducts({
          title: "Unrelated recipe product",
          status: "draft",
          variants: [
            {
              title: "Unrelated variant",
              sku: `RECIPE-UNRELATED-${suffix}`,
              manage_inventory: false,
            },
          ],
        })
        await service.createGovernedProductRegistrations({
          product_id: product.id,
          catalog_kind: "compounded",
          contract_schema_version: "1",
          configuration_snapshot: activated.result.current_revision.snapshot,
          configuration_fingerprint:
            activated.result.current_revision.fingerprint,
          readiness_policy_revision: "1",
          readiness_policy_snapshot:
            DEFAULT_COMPOUNDED_PRODUCT_READINESS_POLICY,
          state: "draft",
          created_by_actor_id: adminUserId,
          updated_by_actor_id: adminUserId,
          published_at: null,
          withdrawn_at: null,
          presentation_revision_id: activated.result.current_revision.id,
        })
        const [active, vial] = await inventoryService.createInventoryItems([
          { sku: `RECIPE-ACTIVE-${suffix}`, title: "Recipe active material" },
          { sku: `RECIPE-VIAL-${suffix}`, title: "Recipe vial" },
        ])
        await Promise.all([
          setComponentProfileWorkflow(container).run({
            input: {
              inventoryItemId: active.id,
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
              inventoryItemId: vial.id,
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
        ])

        const rejectedOwnership = await api.post(
          `/admin/compounded-product/products/${product.id}/variants/${unrelatedProduct.variants[0].id}/recipe`,
          {
            components: [
              {
                inventory_item_id: active.id,
                required_display_amount: "10",
              },
            ],
            note: "Reject an unrelated variant",
          },
          adminConfig(),
        )
        expect(rejectedOwnership.status).toBe(404)

        const response = await api.post(
          `/admin/compounded-product/products/${product.id}/variants/${product.variants[0].id}/recipe`,
          {
            components: [
              {
                inventory_item_id: active.id,
                required_display_amount: "10",
              },
              {
                inventory_item_id: vial.id,
                required_display_amount: "1",
              },
            ],
            note: "Persist a normalized 10 mg vial recipe",
          },
          adminConfig(),
        )

        expect(response.status).toBe(200)
        expect(response.data.normalized_components).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              inventoryItemId: active.id,
              requiredQuantity: 10_000,
              baseUnit: "microgram",
            }),
            expect.objectContaining({
              inventoryItemId: vial.id,
              requiredQuantity: 1,
              baseUnit: "piece",
            }),
          ]),
        )
        expect(response.data.readiness.blockers).not.toContain(
          "managed_inventory_recipe_missing",
        )

        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const { data: links } = await query.graph({
          entity: "product_variant_inventory_item",
          fields: ["variant_id", "inventory_item_id", "required_quantity"],
          filters: { variant_id: product.variants[0].id },
        })
        expect(links).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              inventory_item_id: active.id,
              required_quantity: 10_000,
            }),
            expect.objectContaining({
              inventory_item_id: vial.id,
              required_quantity: 1,
            }),
          ]),
        )
        const auditEvents = await service.listGovernanceAuditEvents({
          product_id: product.id,
          variant_id: product.variants[0].id,
        })
        expect(auditEvents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              event_type: "recipe_changed",
              outcome: "succeeded",
            }),
          ]),
        )
      })
    })
  },
})
