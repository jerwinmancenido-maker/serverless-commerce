import { Spinner } from "@medusajs/icons"
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { sdk } from "../../lib/sdk"
import { loadAllAdminPages } from "../../lib/load-all-pages"
import { AdvancedSettingsDrawer } from "./advanced-settings-drawer"
import { BuilderSection } from "./builder-section"
import { ConfiguredFieldInput } from "./configured-field-input"
import { ProductDescriptionEditor } from "./product-description-editor"
import { InventoryRecipeBuilder } from "./inventory-recipe-builder"
import {
  buildDirectRecipeRules,
  configuredRecipeCoverageIsComplete,
  emptyDirectRecipeConfiguration,
  type DirectRecipeConfiguration,
} from "./direct-recipe-rules"
import {
  createCompoundedProductCreationReview,
  suggestCompoundedProductHandle,
} from "./creation-review"
import {
  DirectVariationBuilder,
} from "./direct-variation-builder"
import {
  newDirectVariationAxis,
  prepareAutomaticDirectProductSnapshot,
  selectedValuesForSnapshot,
  type DirectVariationAxis,
} from "./direct-variation-snapshot"
import type {
  ConfiguredField,
  ConfiguredValue,
  ConfiguredRecipeAvailabilityResponse,
  CreateDraftResponse,
  MatrixPreviewResponse,
  PresentationListItem,
  PresentationSnapshot,
  RecipeRule,
  VariantDraft,
} from "./types"

const emptyProduct = {
  title: "",
  handle: "",
  description: "",
  typeId: "",
  collectionId: "",
}

const newSubmissionKey = () => crypto.randomUUID()

const sortedFields = (
  fields: ConfiguredField[],
  scope: "product" | "variant",
) =>
  fields
    .filter((field) => field.metadata_target?.scope === scope)
    .sort((left, right) => left.position - right.position)

const messageFromError = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

const CompoundedProductsPage = () => {
  const navigate = useNavigate()
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const variantUploadInputRef = useRef<HTMLInputElement>(null)
  const latestPreviewRequestKeyRef = useRef<string | null>(null)
  const [directVariationAxes, setDirectVariationAxes] = useState<
    DirectVariationAxis[]
  >(() => [newDirectVariationAxis(), newDirectVariationAxis()])
  const [directSnapshot, setDirectSnapshot] =
    useState<PresentationSnapshot | null>(null)
  const [productConfiguration, setProductConfiguration] =
    useState<PresentationListItem | null>(null)
  const [excludedKeys, setExcludedKeys] = useState<string[]>([])
  const [preview, setPreview] = useState<MatrixPreviewResponse | null>(null)
  const [largeMatrixConfirmed, setLargeMatrixConfirmed] = useState(false)
  const [product, setProduct] = useState(emptyProduct)
  const [handleEdited, setHandleEdited] = useState(false)
  const [productConfiguredValues, setProductConfiguredValues] = useState<
    Record<string, ConfiguredValue>
  >({})
  const [variantDrafts, setVariantDrafts] = useState<
    Record<string, VariantDraft>
  >({})
  const [bulkPriceAmount, setBulkPriceAmount] = useState("")
  const [pricingCurrencyCode, setPricingCurrencyCode] = useState("")
  const [imagePickerRowKey, setImagePickerRowKey] = useState<string | null>(null)
  const [salesChannelIds, setSalesChannelIds] = useState<string[]>([])
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [tagIds, setTagIds] = useState<string[]>([])
  const [uploadedMedia, setUploadedMedia] = useState<
    Array<{ id: string; url: string }>
  >([])
  const [submissionKey, setSubmissionKey] = useState(newSubmissionKey)
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false)
  const [variationsTouched, setVariationsTouched] = useState(false)
  const [selectedStockLocationId, setSelectedStockLocationId] = useState("")
  const [recipeConfiguration, setRecipeConfiguration] =
    useState<DirectRecipeConfiguration>(emptyDirectRecipeConfiguration)
  const shippingProfilesQuery = useQuery({
    queryKey: ["shipping-profiles", "compounded-product-creation"],
    queryFn: () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.admin.shippingProfile.list({ limit, offset })

          return { items: page.shipping_profiles, count: page.count }
        },
      }),
  })
  const salesChannelsQuery = useQuery({
    queryKey: ["sales-channels", "compounded-product-creation"],
    queryFn: () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.admin.salesChannel.list({ limit, offset })

          return { items: page.sales_channels, count: page.count }
        },
      }),
  })
  const stockLocationsQuery = useQuery({
    queryKey: ["stock-locations", "compounded-product-creation"],
    queryFn: () => sdk.admin.stockLocation.list({ limit: 100 }),
  })
  const regionsQuery = useQuery({
    queryKey: ["regions", "compounded-product-creation"],
    queryFn: () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.admin.region.list({ limit, offset })

          return { items: page.regions, count: page.count }
        },
      }),
  })
  const productTypesQuery = useQuery({
    queryKey: ["product-types", "compounded-product-creation"],
    queryFn: () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.admin.productType.list({ limit, offset })

          return { items: page.product_types, count: page.count }
        },
      }),
  })
  const collectionsQuery = useQuery({
    queryKey: ["product-collections", "compounded-product-creation"],
    queryFn: () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.admin.productCollection.list({ limit, offset })

          return { items: page.collections, count: page.count }
        },
      }),
  })
  const categoriesQuery = useQuery({
    queryKey: ["product-categories", "compounded-product-creation"],
    queryFn: () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.admin.productCategory.list({ limit, offset })

          return { items: page.product_categories, count: page.count }
        },
      }),
  })
  const tagsQuery = useQuery({
    queryKey: ["product-tags", "compounded-product-creation"],
    queryFn: () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.admin.productTag.list({ limit, offset })

          return { items: page.product_tags, count: page.count }
        },
      }),
  })

  const snapshot = directSnapshot
  const productFields = useMemo(
    () => sortedFields(snapshot?.fields || [], "product"),
    [snapshot],
  )
  const currencies = useMemo(
    () =>
      Array.from(
        new Set(
          (regionsQuery.data || []).map((region) =>
            region.currency_code.toUpperCase(),
          ),
        ),
      ).sort(),
    [regionsQuery.data],
  )
  const imageUrls = uploadedMedia.map((file) => file.url)
  const shippingProfileId = useMemo(() => {
    const profiles = shippingProfilesQuery.data || []
    const defaultProfile = profiles.find(
      (profile) => profile.type === "default",
    )

    return defaultProfile?.id || (profiles.length === 1 ? profiles[0].id : "")
  }, [shippingProfilesQuery.data])
  const automaticSnapshot = useMemo(() => {
    const prepared = prepareAutomaticDirectProductSnapshot({
        productTitle: product.title,
        axes: directVariationAxes,
      })

    if (!prepared.snapshot) {
      return prepared
    }

    return {
      ...prepared,
      snapshot: {
        ...prepared.snapshot,
        recipe_rules: buildDirectRecipeRules({
          configuration: recipeConfiguration,
          axes: directVariationAxes,
          snapshot: prepared.snapshot,
        }),
      },
    }
  }, [directVariationAxes, product.title, recipeConfiguration])

  useEffect(() => {
    const salesChannels = salesChannelsQuery.data || []

    if (!salesChannelIds.length && salesChannels.length === 1) {
      setSalesChannelIds([salesChannels[0].id])
    }
  }, [salesChannelIds.length, salesChannelsQuery.data])

  useEffect(() => {
    const locations = stockLocationsQuery.data?.stock_locations || []

    if (
      !locations.some((location) => location.id === selectedStockLocationId)
    ) {
      setSelectedStockLocationId(locations[0]?.id || "")
    }
  }, [selectedStockLocationId, stockLocationsQuery.data?.stock_locations])

  useEffect(() => {
    if (!pricingCurrencyCode && currencies.length === 1) {
      setPricingCurrencyCode(currencies[0])
    }
  }, [currencies, pricingCurrencyCode])

  const previewMutation = useMutation({
    mutationFn: (snapshotInput: PresentationSnapshot) => {
      const selected = selectedValuesForSnapshot(snapshotInput)

      return sdk.client.fetch<MatrixPreviewResponse>(
        "/admin/compounded-product/products/preview",
        {
          method: "POST",
          body: {
            configuration_snapshot: snapshotInput,
            selected_value_keys_by_axis: selected,
            excluded_combination_keys: excludedKeys,
          },
        },
      )
    },
    onSuccess: (result, snapshotInput) => {
      if (
        latestPreviewRequestKeyRef.current !== JSON.stringify(snapshotInput)
      ) {
        return
      }

      setPreview(result)
      setLargeMatrixConfirmed(false)
      setVariantDrafts((current) => {
        const next: Record<string, VariantDraft> = {}

        result.matrix.rows.forEach((row) => {
          next[row.key] = next[row.key] || {
            sku: "",
            priceAmount: "",
            currencyCode:
              pricingCurrencyCode ||
              (currencies.length === 1 ? currencies[0] : ""),
            imageUrls: [],
            manageInventory: true,
            allowBackorder: false,
            configuredValues: {},
          }
        })

        return next
      })
    },
    onError: (error, snapshotInput) => {
      if (
        latestPreviewRequestKeyRef.current === JSON.stringify(snapshotInput)
      ) {
        toast.error(
          messageFromError(error, "Product combinations could not be updated"),
        )
      }
    },
  })

  useEffect(() => {
    setProductConfiguration(null)
    setExcludedKeys([])
    setPreview(null)
    setLargeMatrixConfirmed(false)

    if (!automaticSnapshot.snapshot) {
      latestPreviewRequestKeyRef.current = null
      setDirectSnapshot(null)
      return
    }

    const snapshotInput = automaticSnapshot.snapshot
    const requestKey = JSON.stringify(snapshotInput)
    latestPreviewRequestKeyRef.current = requestKey

    const timeout = window.setTimeout(() => {
      if (latestPreviewRequestKeyRef.current !== requestKey) return

      setDirectSnapshot(snapshotInput)
      previewMutation.mutate(snapshotInput)
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [automaticSnapshot.snapshot])

  const uploadMutation = useMutation({
    mutationFn: async ({ files }: { files: File[]; assignToRowKey?: string }) => {
      const oversized = files.find((file) => file.size > 10 * 1024 * 1024)

      if (oversized) {
        throw new Error(`${oversized.name} exceeds the 10 MB upload limit`)
      }

      return sdk.admin.upload.create({ files })
    },
    onSuccess: ({ files }, variables) => {
      setUploadedMedia((current) => [
        ...current,
        ...files.map((file) => ({ id: file.id, url: file.url })),
      ])
      if (variables.assignToRowKey) {
        setVariantDrafts((current) => {
          const draft = current[variables.assignToRowKey!]
          if (!draft) return current

          return {
            ...current,
            [variables.assignToRowKey!]: {
              ...draft,
              imageUrls: Array.from(
                new Set([...draft.imageUrls, ...files.map((file) => file.url)]),
              ),
            },
          }
        })
      }
      toast.success(`${files.length} image${files.length === 1 ? "" : "s"} uploaded`)
    },
    onError: (error) =>
      toast.error(messageFromError(error, "Images could not be uploaded")),
  })
  const removeUploadMutation = useMutation({
    mutationFn: (file: { id: string; url: string }) =>
      sdk.admin.upload.delete(file.id).then(() => file),
    onSuccess: (file) => {
      setUploadedMedia((current) =>
        current.filter((item) => item.id !== file.id),
      )
      setVariantDrafts((current) =>
        Object.fromEntries(
          Object.entries(current).map(([key, draft]) => [
            key,
            {
              ...draft,
              imageUrls: draft.imageUrls.filter((url) => url !== file.url),
            },
          ]),
        ),
      )
    },
    onError: (error) =>
      toast.error(messageFromError(error, "Uploaded image could not be removed")),
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!directSnapshot || !preview) {
        throw new Error("Wait for the current product combinations to update")
      }

      if (!product.title.trim()) {
        throw new Error("Product title is required")
      }

      if (!shippingProfileId) {
        throw new Error("Store fulfillment setup is incomplete")
      }

      if (
        preview.matrix.requiresConfirmation &&
        !largeMatrixConfirmed
      ) {
        throw new Error("Confirm the current large variant matrix")
      }

      const variants = preview.matrix.rows.map((row) => {
        const draft = variantDrafts[row.key]

        if (Boolean(draft.priceAmount) !== Boolean(draft.currencyCode)) {
          throw new Error(
            `Price and currency must both be set for ${row.title}`,
          )
        }

        return {
          matrix_row_key: row.key,
          sku: draft.sku,
          prices:
            draft.priceAmount && draft.currencyCode
              ? [
                  {
                    amount: draft.priceAmount,
                    currency_code: draft.currencyCode.toLowerCase(),
                  },
                ]
              : [],
          image_urls: draft.imageUrls,
          manage_inventory: draft.manageInventory,
          allow_backorder: draft.allowBackorder,
          configured_values: draft.configuredValues,
        }
      })

      let activated = productConfiguration

      if (
        !activated?.current_revision ||
        activated.current_revision.fingerprint !== preview.configuration_fingerprint
      ) {
        const configuration = await sdk.client.fetch<PresentationListItem>(
          "/admin/compounded-product/presentations",
          {
            method: "POST",
            body: {
              key: `product_${submissionKey.replace(/-/g, "")}`,
              snapshot: directSnapshot,
            },
          },
        )

        if (!configuration.current_revision) {
          throw new Error("Product configuration could not be created")
        }

        activated = await sdk.client.fetch<PresentationListItem>(
          `/admin/compounded-product/presentations/${configuration.presentation.id}/transitions`,
          {
            method: "POST",
            body: {
              expected_current_revision_id: configuration.current_revision.id,
              target_status: "active",
              reason: "Automatically created with product draft",
            },
          },
        )
        setProductConfiguration(activated)
      }

      if (!activated.current_revision) {
        throw new Error("Product configuration could not be activated")
      }

      if (
        activated.current_revision.fingerprint !==
        preview.configuration_fingerprint
      ) {
        throw new Error("Product configuration changed before save")
      }

      return sdk.client.fetch<CreateDraftResponse>(
        "/admin/compounded-product/products",
        {
          method: "POST",
          body: {
            idempotency_key: submissionKey,
            presentation_revision_id: activated.current_revision.id,
            expected_configuration_fingerprint:
              activated.current_revision.fingerprint,
            configuration_revision_resolution: null,
            selected_value_keys_by_axis:
              selectedValuesForSnapshot(directSnapshot),
            excluded_combination_keys: excludedKeys,
            matrix_confirmation: preview.matrix.requiresConfirmation
              ? {
                  fingerprint: preview.matrix.fingerprint,
                  resulting_variant_count:
                    preview.matrix.resultingVariantCount,
                }
              : null,
            product: {
              title: product.title,
              description: product.description || null,
              handle: product.handle || null,
              type_id: product.typeId || null,
              collection_id: product.collectionId || null,
              category_ids: categoryIds,
              tag_ids: tagIds,
              sales_channel_ids: salesChannelIds,
              shipping_profile_id: shippingProfileId,
              image_urls: imageUrls,
              configured_values: productConfiguredValues,
            },
            variants,
          },
        },
      )
    },
    onSuccess: (response) => {
      setSubmissionKey(newSubmissionKey())
      toast.success(
        response.replayed
          ? "Existing draft returned safely"
          : "Compounded product draft created",
      )
      navigate(`/compounded-products/${response.result.product_id}`)
    },
    onError: (error) =>
      toast.error(messageFromError(error, "Product draft could not be created")),
  })

  const updateVariant = (rowKey: string, patch: Partial<VariantDraft>) => {
    setVariantDrafts((current) => ({
      ...current,
      [rowKey]: {
        ...(current[rowKey] || {
          sku: "",
          priceAmount: "",
          currencyCode: "",
          imageUrls: [],
          manageInventory: true,
          allowBackorder: false,
          configuredValues: {},
        }),
        ...patch,
      },
    }))
  }

  const toggleId = (
    current: string[],
    id: string,
    setter: (ids: string[]) => void,
  ) => setter(current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  const isLoadingReferenceData =
    shippingProfilesQuery.isLoading ||
    stockLocationsQuery.isLoading ||
    salesChannelsQuery.isLoading ||
    regionsQuery.isLoading ||
    productTypesQuery.isLoading ||
    collectionsQuery.isLoading ||
    categoriesQuery.isLoading ||
    tagsQuery.isLoading
  const referenceDataError =
    shippingProfilesQuery.error ||
    stockLocationsQuery.error ||
    salesChannelsQuery.error ||
    regionsQuery.error ||
    productTypesQuery.error ||
    collectionsQuery.error ||
    categoriesQuery.error ||
    tagsQuery.error
  const configuredRecipeCoverageComplete =
    configuredRecipeCoverageIsComplete({
      rules: directSnapshot?.recipe_rules || [],
      rows: preview?.matrix.rows || [],
    })
  const configuredRecipeRowCount = useMemo(() => {
    const rows = preview?.matrix.rows || []
    const finishedRules = (directSnapshot?.recipe_rules || []).filter(
      (
        rule,
      ): rule is Exclude<RecipeRule, { kind: "common_packaging" }> =>
        rule.kind === "finished_product",
    )

    return rows.filter(
      (row) =>
        finishedRules.filter((rule) =>
          row.options.some(
            (option) =>
              option.axisKey === rule.match.axis_key &&
              option.valueKey === rule.match.value_key,
          ),
        ).length === 1,
    ).length
  }, [directSnapshot?.recipe_rules, preview?.matrix.rows])
  const configuredAvailabilityQuery = useQuery({
    queryKey: [
      "configured-recipe-availability",
      selectedStockLocationId,
      preview?.matrix.fingerprint,
      directSnapshot?.recipe_rules,
    ],
    enabled: Boolean(
      selectedStockLocationId &&
        configuredRecipeCoverageComplete &&
        preview?.matrix.rows.length &&
        directSnapshot?.recipe_rules.length,
    ),
    queryFn: () =>
      sdk.client.fetch<ConfiguredRecipeAvailabilityResponse>(
        "/admin/compounded-product/products/availability-preview",
        {
          method: "POST",
          body: {
            location_id: selectedStockLocationId,
            matrix_rows: (preview?.matrix.rows || []).map((row) => ({
              key: row.key,
              options: row.options.map((option) => ({
                axis_key: option.axisKey,
                value_key: option.valueKey,
              })),
            })),
            recipe_rules: directSnapshot?.recipe_rules || [],
          },
        },
      ),
    staleTime: 15_000,
    refetchInterval: 15_000,
  })
  const configuredAvailabilityByRowKey = useMemo(
    () =>
      new Map(
        (configuredAvailabilityQuery.data?.variants || []).map((variant) => [
          variant.variant_id,
          variant,
        ]),
      ),
    [configuredAvailabilityQuery.data?.variants],
  )
  const sharedComponentAvailability = useMemo(() => {
    const summary = new Map<
      string,
      { title: string; available: number; usedByRows: number }
    >()

    for (const variant of configuredAvailabilityQuery.data?.variants || []) {
      for (const component of variant.components) {
        const existing = summary.get(component.inventory_item_id)

        summary.set(component.inventory_item_id, {
          title: component.inventory_item_title,
          available: component.available_quantity,
          usedByRows: (existing?.usedByRows || 0) + 1,
        })
      }
    }

    return Array.from(summary.entries())
      .map(([id, value]) => ({ id, ...value }))
      .sort((left, right) => left.title.localeCompare(right.title))
  }, [configuredAvailabilityQuery.data?.variants])
  const {
    autoGeneratedSkuCount,
    draftSaveBlockers,
    publicationReviewItems,
  } = createCompoundedProductCreationReview({
    title: product.title,
    storeConfigurationReady: Boolean(shippingProfileId),
    rows: preview?.matrix.rows || [],
    drafts: variantDrafts,
    policy: snapshot?.readiness_policy || {
      require_price: false,
      require_sales_channel: false,
      require_bom_for_managed_inventory: false,
    },
    salesChannelCount: salesChannelIds.length,
    configuredRecipeCoverageComplete,
    largeMatrixRequiresConfirmation:
      preview?.matrix.requiresConfirmation || false,
    largeMatrixConfirmed,
  })
  const productSaveBlockers = [
    ...(product.description.length > 20_000
      ? ["Product description must be 20,000 characters or fewer."]
      : []),
    ...(Boolean(directSnapshot?.recipe_rules.length) &&
    !configuredRecipeCoverageComplete
      ? ["Every product combination needs one finished-product inventory item."]
      : []),
    ...draftSaveBlockers,
  ]

  if (isLoadingReferenceData) {
    return (
      <Container className="flex min-h-96 items-center justify-center">
        <Spinner />
      </Container>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-y-3 pb-8">
      <div className="flex flex-col gap-y-1 px-1 py-1">
        <Heading>Create product</Heading>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Add product information, images, variations, and prices.
        </Text>
      </div>

      {referenceDataError ? (
        <Container className="px-6 py-4">
          <Text size="small" className="text-ui-fg-error">
            Required Medusa reference data could not be loaded. Refresh the
            page before creating a product.
          </Text>
        </Container>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <BuilderSection
          eyebrow="Step 1"
          title="Product information"
          description="Customer-facing product name and description."
        >
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="product-title">Product name *</Label>
            <Input
              id="product-title"
              value={product.title}
              onChange={(event) => {
                const title = event.target.value
                setProduct((current) => ({
                  ...current,
                  title,
                  handle: handleEdited
                    ? current.handle
                    : suggestCompoundedProductHandle(title),
                }))
              }}
              placeholder="Enter product name"
            />
          </div>
          <div className="mt-3 flex flex-col gap-y-2">
            <Label htmlFor="product-description">Description</Label>
            <ProductDescriptionEditor
              value={product.description}
              onChange={(description) =>
                setProduct((current) => ({
                  ...current,
                  description,
                }))
              }
            />
          </div>
        </BuilderSection>

        <BuilderSection
          eyebrow="Step 2"
          title="Product media"
          description="Up to 10 MB each. First image is primary."
          action={
            <Button
              size="small"
              variant="secondary"
              isLoading={uploadMutation.isPending}
              onClick={() => uploadInputRef.current?.click()}
            >
              Upload
            </Button>
          }
        >
          <input
            ref={uploadInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files || [])
              if (files.length) uploadMutation.mutate({ files })
              event.target.value = ""
            }}
          />
          {uploadedMedia.length ? (
            <div className="grid grid-cols-2 gap-2">
              {uploadedMedia.map((file, index) => (
                <div
                  key={file.id}
                  className="flex flex-col gap-y-2 rounded-lg border border-ui-border-base p-2"
                >
                  <div className="relative">
                    <img
                      src={file.url}
                      alt={`Uploaded product media ${index + 1}`}
                      className="aspect-square w-full rounded-md object-cover"
                    />
                    {index === 0 ? (
                      <Text
                        size="xsmall"
                        weight="plus"
                        className="absolute left-1 top-1 rounded-md bg-ui-bg-base px-2 py-1"
                      >
                        Primary
                      </Text>
                    ) : null}
                  </div>
                  <Button
                    size="small"
                    variant="secondary"
                    isLoading={removeUploadMutation.isPending}
                    onClick={() => removeUploadMutation.mutate(file)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <button
              type="button"
              className="flex min-h-28 w-full flex-col items-center justify-center gap-y-1 rounded-lg border border-dashed border-ui-border-strong bg-ui-bg-subtle p-4 text-center"
              onClick={() => uploadInputRef.current?.click()}
            >
              <Text size="small" leading="compact" weight="plus">
                Add product images
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Click to upload.
              </Text>
            </button>
          )}
        </BuilderSection>
      </div>

      <BuilderSection
        eyebrow="Step 3"
        title="Variations"
        description="Combinations update automatically as variation names and options are entered."
      >
        <DirectVariationBuilder
          axes={directVariationAxes}
          onChange={(axes) => {
            setVariationsTouched(true)
            setDirectVariationAxes(axes)
            setDirectSnapshot(null)
            setProductConfiguration(null)
            setExcludedKeys([])
            setPreview(null)
            setLargeMatrixConfirmed(false)
          }}
        />
        {previewMutation.isPending ? (
          <div className="mt-3 flex items-center gap-x-2">
            <Spinner className="text-ui-fg-muted" />
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Updating product combinations…
            </Text>
          </div>
        ) : variationsTouched && automaticSnapshot.validationMessage ? (
          <Text
            size="small"
            leading="compact"
            className="mt-3 text-ui-fg-subtle"
          >
            {automaticSnapshot.validationMessage}
          </Text>
        ) : null}
      </BuilderSection>

      <BuilderSection
        eyebrow="Step 4"
        title="Inventory recipes"
        description="Map variation values and common packaging to shared component inventory. Product-specific names and quantities are never hardcoded."
      >
        <InventoryRecipeBuilder
          axes={directVariationAxes}
          configuration={recipeConfiguration}
          onChange={setRecipeConfiguration}
        />

        <div className="mt-4 grid gap-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <div className="flex flex-col gap-y-1">
            <Label>Shared stock location</Label>
            <Select
              value={selectedStockLocationId || undefined}
              onValueChange={setSelectedStockLocationId}
              disabled={!stockLocationsQuery.data?.stock_locations.length}
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose stock location" />
              </Select.Trigger>
              <Select.Content>
                {(stockLocationsQuery.data?.stock_locations || []).map(
                  (location) => (
                    <Select.Item key={location.id} value={location.id}>
                      {location.name}
                    </Select.Item>
                  ),
                )}
              </Select.Content>
            </Select>
          </div>

          <div className="flex min-w-0 flex-col gap-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                color={configuredRecipeCoverageComplete ? "green" : "orange"}
              >
                {configuredRecipeCoverageComplete
                  ? "Recipes complete"
                  : "Recipes incomplete"}
              </Badge>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                {configuredRecipeRowCount}/{preview?.matrix.rows.length || 0}{" "}
                combinations mapped
              </Text>
              {configuredAvailabilityQuery.isFetching ? (
                <Spinner className="text-ui-fg-muted" />
              ) : null}
            </div>

            {!stockLocationsQuery.data?.stock_locations.length ? (
              <Text size="small" leading="compact" className="text-ui-fg-error">
                Configure a Medusa stock location before calculating inventory.
              </Text>
            ) : configuredAvailabilityQuery.error ? (
              <Text size="small" leading="compact" className="text-ui-fg-error">
                {messageFromError(
                  configuredAvailabilityQuery.error,
                  "Inventory availability could not be calculated",
                )}
              </Text>
            ) : sharedComponentAvailability.length ? (
              <div className="flex flex-wrap gap-2">
                {sharedComponentAvailability.map((component) => (
                  <span
                    key={component.id}
                    className="rounded-md border border-ui-border-base bg-ui-bg-base px-2 py-1"
                  >
                    <Text size="xsmall" leading="compact" weight="plus">
                      {component.title}: {component.available} available
                    </Text>
                    <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                      Shared by {component.usedByRows} combination
                      {component.usedByRows === 1 ? "" : "s"}
                    </Text>
                  </span>
                ))}
              </div>
            ) : (
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Complete the finished-product mappings to preview shared stock.
              </Text>
            )}
          </div>
        </div>
      </BuilderSection>

      {preview ? (
        <BuilderSection
          eyebrow="Step 5"
          title="Product combinations"
          description={`${preview.matrix.totalCombinationCount} combinations · ${preview.matrix.excludedCombinationCount} excluded · ${preview.matrix.resultingVariantCount} sellable variants`}
        >

          {preview.matrix.requiresConfirmation ? (
            <label className="flex items-start gap-x-3 rounded-lg border border-ui-border-warning bg-ui-bg-subtle p-4">
              <Checkbox
                checked={largeMatrixConfirmed}
                onCheckedChange={(checked) =>
                  setLargeMatrixConfirmed(checked === true)
                }
              />
              <span className="flex flex-col gap-y-1">
                <Text size="small" weight="plus">
                  Confirm this {preview.matrix.resultingVariantCount}-variant matrix
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  This confirmation is bound to the current server-generated
                  matrix fingerprint and becomes invalid when the matrix changes.
                </Text>
              </span>
            </label>
          ) : null}

          <div className="flex flex-wrap items-end gap-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3">
            <div className="flex min-w-40 max-w-56 flex-1 flex-col gap-y-1">
              <Label htmlFor="bulk-price">Apply price to all</Label>
              <Input
                id="bulk-price"
                inputMode="decimal"
                value={bulkPriceAmount}
                placeholder="Price amount"
                onChange={(event) => setBulkPriceAmount(event.target.value)}
              />
            </div>
            <Button
              size="small"
              variant="secondary"
              disabled={!bulkPriceAmount}
              onClick={() =>
                setVariantDrafts((current) =>
                  Object.fromEntries(
                    preview.matrix.rows.map((row) => [
                      row.key,
                      {
                        ...current[row.key],
                        ...(bulkPriceAmount
                          ? { priceAmount: bulkPriceAmount }
                          : {}),
                        ...(pricingCurrencyCode
                          ? { currencyCode: pricingCurrencyCode }
                          : {}),
                      },
                    ]),
                  ),
                )
              }
            >
              Apply to all
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-ui-border-base">
            <Table>
              <Table.Header>
                <Table.Row>
                  {(directSnapshot?.variation_axes || []).map((axis) => (
                    <Table.HeaderCell key={axis.key}>
                      {axis.semantic_name}
                    </Table.HeaderCell>
                  ))}
                  <Table.HeaderCell>Photo</Table.HeaderCell>
                  <Table.HeaderCell>Calculated stock</Table.HeaderCell>
                  <Table.HeaderCell>Limiting component</Table.HeaderCell>
                  <Table.HeaderCell>Price</Table.HeaderCell>
                  <Table.HeaderCell>SKU</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {preview.matrix.rows.map((row) => {
                  const draft = variantDrafts[row.key]
                  const availability =
                    configuredAvailabilityByRowKey.get(row.key)

                  return (
                    <Table.Row key={row.key}>
                      {(directSnapshot?.variation_axes || []).map((axis) => (
                        <Table.Cell key={`${row.key}-${axis.key}`}>
                          <Text size="small" leading="compact" weight="plus">
                            {row.options.find(
                              (option) => option.axisKey === axis.key,
                            )?.valueLabel || "—"}
                          </Text>
                        </Table.Cell>
                      ))}
                      <Table.Cell>
                        <div className="flex min-w-32 items-center gap-x-2">
                          {draft?.imageUrls[0] ? (
                            <img
                              src={draft.imageUrls[0]}
                              alt={`${row.title} combination`}
                              className="size-8 rounded-md object-cover"
                            />
                          ) : null}
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => setImagePickerRowKey(row.key)}
                          >
                            {draft?.imageUrls.length ? "Change photo" : "Add photo"}
                          </Button>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex min-w-48 flex-col gap-y-1">
                          <Text size="small" leading="compact" weight="plus">
                            {availability?.calculated_stock ?? "—"}
                          </Text>
                          {availability?.components.length ? (
                            <Text
                              size="xsmall"
                              leading="compact"
                              className="text-ui-fg-subtle"
                            >
                              {availability.components
                                .map(
                                  (component) =>
                                    `${component.inventory_item_title}: ${component.capacity}`,
                                )
                                .join(" · ")}
                            </Text>
                          ) : null}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Text
                          size="small"
                          leading="compact"
                          className="min-w-40"
                        >
                          {availability?.limiting_components.length
                            ? availability.limiting_components
                                .map(
                                  (component) =>
                                    component.inventory_item_title,
                                )
                                .join(", ")
                            : "—"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          aria-label={`Price for ${row.title}`}
                          className="min-w-28"
                          inputMode="decimal"
                          value={draft?.priceAmount || ""}
                          placeholder="0.00"
                          onChange={(event) =>
                            updateVariant(row.key, {
                              priceAmount: event.target.value,
                              currencyCode:
                                draft?.currencyCode || pricingCurrencyCode,
                            })
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          aria-label={`SKU for ${row.title}`}
                          className="min-w-48"
                          value={draft?.sku || ""}
                          placeholder="Auto-generated if blank"
                          onChange={(event) =>
                            updateVariant(row.key, { sku: event.target.value })
                          }
                        />
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          </div>

          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Blank SKUs are generated automatically. Calculated stock is the
            lowest component capacity at the selected location; shared balances
            are reused across combinations and are never summed.
          </Text>
        </BuilderSection>
      ) : null}

      <Container className="flex flex-col gap-2 border border-ui-border-base px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-y-1">
          {productSaveBlockers.length ? (
            <Text size="small" leading="compact" className="text-ui-fg-error">
              {preview || product.description.length > 20_000
                ? productSaveBlockers[0]
                : automaticSnapshot.validationMessage ||
                  "Product combinations are updating."}
            </Text>
          ) : (
            <Text size="small" leading="compact" weight="plus">
              Ready to save as a draft
            </Text>
          )}
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {preview && autoGeneratedSkuCount > 0
              ? `${autoGeneratedSkuCount} blank SKU${autoGeneratedSkuCount === 1 ? " will" : "s will"} be generated automatically.`
              : publicationReviewItems[0] ||
                "Configured inventory recipes will be linked when this draft is saved."}
          </Text>
        </div>
        <div className="flex shrink-0 items-center gap-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => setAdvancedSettingsOpen(true)}
          >
            More settings
          </Button>
          <Button
            size="small"
            disabled={
              !preview ||
              previewMutation.isPending ||
              Boolean(referenceDataError) ||
              productSaveBlockers.length > 0 ||
              createMutation.isPending
            }
            isLoading={createMutation.isPending}
            onClick={() => createMutation.mutate(undefined)}
          >
            Save draft
          </Button>
        </div>
      </Container>

      <AdvancedSettingsDrawer
        open={advancedSettingsOpen}
        onOpenChange={setAdvancedSettingsOpen}
        handle={product.handle}
        onHandleChange={(handle) => {
          setHandleEdited(true)
          setProduct((current) => ({ ...current, handle }))
        }}
        typeId={product.typeId}
        onTypeChange={(typeId) =>
          setProduct((current) => ({ ...current, typeId }))
        }
        collectionId={product.collectionId}
        onCollectionChange={(collectionId) =>
          setProduct((current) => ({ ...current, collectionId }))
        }
        productTypes={(productTypesQuery.data || []).map((item) => ({
          id: item.id,
          label: item.value,
        }))}
        collections={(collectionsQuery.data || []).map((item) => ({
          id: item.id,
          label: item.title,
        }))}
        salesChannels={(salesChannelsQuery.data || []).map((item) => ({
          id: item.id,
          label: item.name,
        }))}
        selectedSalesChannelIds={salesChannelIds}
        onToggleSalesChannel={(id) =>
          toggleId(salesChannelIds, id, setSalesChannelIds)
        }
        categories={(categoriesQuery.data || []).map((item) => ({
          id: item.id,
          label: item.name,
        }))}
        selectedCategoryIds={categoryIds}
        onToggleCategory={(id) => toggleId(categoryIds, id, setCategoryIds)}
        tags={(tagsQuery.data || []).map((item) => ({
          id: item.id,
          label: item.value,
        }))}
        selectedTagIds={tagIds}
        onToggleTag={(id) => toggleId(tagIds, id, setTagIds)}
        currencies={currencies}
        currencyCode={pricingCurrencyCode}
        onCurrencyChange={(currencyCode) => {
          setPricingCurrencyCode(currencyCode)
          setVariantDrafts((current) =>
            Object.fromEntries(
              Object.entries(current).map(([key, draft]) => [
                key,
                { ...draft, currencyCode },
              ]),
            ),
          )
        }}
      />

      <input
        ref={variantUploadInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files || [])
          if (files.length && imagePickerRowKey) {
            uploadMutation.mutate({
              files,
              assignToRowKey: imagePickerRowKey,
            })
          }
          event.target.value = ""
        }}
      />

      <Drawer
        open={Boolean(imagePickerRowKey)}
        onOpenChange={(open) => {
          if (!open) setImagePickerRowKey(null)
        }}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Combination photo</Drawer.Title>
            <Drawer.Description>
              Select existing product images or upload images for this product combination.
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto p-6">
            <Button
              size="small"
              variant="secondary"
              isLoading={uploadMutation.isPending}
              disabled={uploadMutation.isPending}
              onClick={() => variantUploadInputRef.current?.click()}
            >
              Upload new photo
            </Button>
            {imagePickerRowKey && uploadedMedia.length ? (
              <div className="grid grid-cols-2 gap-3">
                {uploadedMedia.map((file) => {
                  const draft = variantDrafts[imagePickerRowKey]
                  const selected = draft?.imageUrls.includes(file.url) || false

                  return (
                    <label
                      key={file.id}
                      className="flex cursor-pointer flex-col gap-y-2 rounded-lg border border-ui-border-base p-2"
                    >
                      <img
                        src={file.url}
                        alt="Available product media"
                        className="aspect-square w-full rounded-md object-cover"
                      />
                      <span className="flex items-center gap-x-2">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() =>
                            updateVariant(imagePickerRowKey, {
                              imageUrls: selected
                                ? (draft?.imageUrls || []).filter(
                                    (url) => url !== file.url,
                                  )
                                : [...(draft?.imageUrls || []), file.url],
                            })
                          }
                        />
                        <Text size="small">
                          {selected ? "Selected" : "Use this photo"}
                        </Text>
                      </span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <Text size="small" className="text-ui-fg-subtle">
                No product images are available yet. Upload a photo to add it to this combination.
              </Text>
            )}
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button size="small">Done</Button>
            </Drawer.Close>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

    </div>
  )
}

export default CompoundedProductsPage
