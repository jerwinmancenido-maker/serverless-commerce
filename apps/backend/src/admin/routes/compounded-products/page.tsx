import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Spinner } from "@medusajs/icons"
import {
  Button,
  Checkbox,
  Container,
  Heading,
  Input,
  Label,
  Prompt,
  Select,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { sdk } from "../../lib/sdk"
import { loadAllAdminPages } from "../../lib/load-all-pages"
import { ConfiguredFieldInput } from "./configured-field-input"
import {
  createCompoundedProductCreationReview,
  suggestCompoundedProductHandle,
} from "./creation-review"
import type {
  ConfiguredField,
  ConfiguredValue,
  ConfigurationRevisionImpact,
  ConfigurationRevisionImpactResponse,
  ConfigurationRevisionResolution,
  CreateDraftResponse,
  MatrixPreviewResponse,
  PresentationListItem,
  PresentationListResponse,
  VariantDraft,
} from "./types"

const emptyProduct = {
  title: "",
  subtitle: "",
  handle: "",
  description: "",
  typeId: "",
  collectionId: "",
  shippingProfileId: "",
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

class RevisionDecisionRequiredError extends Error {}

const countStructuredMeasurements = (values: Record<string, ConfiguredValue>) =>
  Object.values(values).reduce((count, value) => {
    if (!value || typeof value !== "object") return count
    if ("amount" in value) return count + 1
    if ("numerator" in value && "denominator" in value) return count + 2
    return count
  }, 0)

const CompoundedProductsPage = () => {
  const navigate = useNavigate()
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [presentationRevisionId, setPresentationRevisionId] = useState("")
  const [pinnedPresentation, setPinnedPresentation] =
    useState<PresentationListItem | null>(null)
  const [pendingPresentationRevisionId, setPendingPresentationRevisionId] =
    useState<string | null>(null)
  const [selectedValues, setSelectedValues] = useState<
    Record<string, string[]>
  >({})
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
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const [salesChannelIds, setSalesChannelIds] = useState<string[]>([])
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [tagIds, setTagIds] = useState<string[]>([])
  const [uploadedMedia, setUploadedMedia] = useState<
    Array<{ id: string; url: string }>
  >([])
  const [submissionKey, setSubmissionKey] = useState(newSubmissionKey)
  const [revisionResolution, setRevisionResolution] =
    useState<ConfigurationRevisionResolution | null>(null)
  const [pendingRevisionImpact, setPendingRevisionImpact] = useState<{
    impact: ConfigurationRevisionImpact
    target: PresentationListItem
  } | null>(null)
  const [pendingVariationChange, setPendingVariationChange] = useState<{
    axisKey: string
    axisLabel: string
    valueKey: string
    valueLabel: string
    selecting: boolean
  } | null>(null)
  const [revisionDecisionReason, setRevisionDecisionReason] = useState("")

  const presentationsQuery = useQuery({
    queryKey: ["compounded-product-presentations", "creation"],
    queryFn: () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.client.fetch<PresentationListResponse>(
            `/admin/compounded-product/presentations?limit=${limit}&offset=${offset}`,
          )

          return { items: page.presentations, count: page.count }
        },
      }),
  })
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

  const activePresentations = useMemo(
    () =>
      (presentationsQuery.data || []).filter(
        (item) =>
          item.presentation.status === "active" &&
          item.current_revision?.status === "active",
      ),
    [presentationsQuery.data],
  )
  const selectedPresentation = useMemo(
    () =>
      (pinnedPresentation?.current_revision?.id === presentationRevisionId
        ? pinnedPresentation
        : activePresentations.find(
            (item) => item.current_revision?.id === presentationRevisionId,
          )) || null,
    [activePresentations, pinnedPresentation, presentationRevisionId],
  )
  const presentationOptions = useMemo(() => {
    if (
      !pinnedPresentation?.current_revision ||
      activePresentations.some(
        (item) =>
          item.current_revision?.id === pinnedPresentation.current_revision?.id,
      )
    ) {
      return activePresentations
    }

    return [pinnedPresentation, ...activePresentations]
  }, [activePresentations, pinnedPresentation])
  const snapshot = selectedPresentation?.current_revision?.snapshot || null
  const productFields = useMemo(
    () => sortedFields(snapshot?.fields || [], "product"),
    [snapshot],
  )
  const variantFields = useMemo(
    () => sortedFields(snapshot?.fields || [], "variant"),
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

  useEffect(() => {
    if (presentationRevisionId || activePresentations.length !== 1) {
      return
    }

    setPinnedPresentation(activePresentations[0])
    setPresentationRevisionId(activePresentations[0].current_revision!.id)
  }, [activePresentations, presentationRevisionId])

  useEffect(() => {
    if (!snapshot) {
      setSelectedValues({})
      setPreview(null)
      return
    }

    setSelectedValues(
      Object.fromEntries(
        snapshot.variation_axes.map((axis) => [
          axis.key,
          axis.values
            .filter((value) => value.active)
            .sort((left, right) => left.position - right.position)
            .map((value) => value.key),
        ]),
      ),
    )
    setExcludedKeys([])
    setPreview(null)
    setLargeMatrixConfirmed(false)
  }, [presentationRevisionId, snapshot])

  const previewMutation = useMutation({
    mutationFn: () => {
      if (!selectedPresentation?.current_revision) {
        throw new Error("Select an active presentation configuration")
      }

      return sdk.client.fetch<MatrixPreviewResponse>(
        "/admin/compounded-product/products/preview",
        {
          method: "POST",
          body: {
            presentation_revision_id: selectedPresentation.current_revision.id,
            expected_configuration_fingerprint:
              selectedPresentation.current_revision.fingerprint,
            selected_value_keys_by_axis: selectedValues,
            excluded_combination_keys: excludedKeys,
          },
        },
      )
    },
    onSuccess: (result) => {
      setPreview(result)
      setLargeMatrixConfirmed(false)
      setVariantDrafts((current) => {
        const next = { ...current }

        result.matrix.rows.forEach((row) => {
          next[row.key] = next[row.key] || {
            sku: "",
            priceAmount: "",
            currencyCode: currencies.length === 1 ? currencies[0] : "",
            imageUrls: [],
            manageInventory: true,
            allowBackorder: false,
            configuredValues: {},
          }
        })

        return next
      })
    },
    onError: (error) =>
      toast.error(messageFromError(error, "Variant matrix could not be generated")),
  })

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const oversized = files.find((file) => file.size > 10 * 1024 * 1024)

      if (oversized) {
        throw new Error(`${oversized.name} exceeds the 10 MB upload limit`)
      }

      return sdk.admin.upload.create({ files })
    },
    onSuccess: ({ files }) => {
      setUploadedMedia((current) => [
        ...current,
        ...files.map((file) => ({ id: file.id, url: file.url })),
      ])
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
    mutationFn: async (
      resolutionOverride?: ConfigurationRevisionResolution,
    ) => {
      if (!selectedPresentation?.current_revision || !preview) {
        throw new Error("Generate the current variant matrix before saving")
      }

      if (!product.title.trim()) {
        throw new Error("Product title is required")
      }

      if (!product.shippingProfileId) {
        throw new Error("Shipping profile is required")
      }

      const refreshed = await presentationsQuery.refetch()
      const currentPresentation = refreshed.data?.find(
        (item) => item.presentation.id === selectedPresentation.presentation.id,
      )

      if (!currentPresentation?.current_revision) {
        throw new Error(
          "The selected presentation is no longer available for new products",
        )
      }

      const effectiveResolution = resolutionOverride || revisionResolution

      if (
        currentPresentation.current_revision.id !==
        selectedPresentation.current_revision.id
      ) {
        const impactResponse =
          await sdk.client.fetch<ConfigurationRevisionImpactResponse>(
            "/admin/compounded-product/products/revision-impact",
            {
              method: "POST",
              body: {
                from_revision_id: selectedPresentation.current_revision.id,
                to_revision_id: currentPresentation.current_revision.id,
              },
            },
          )
        const retainingThisImpact =
          effectiveResolution?.action === "retain" &&
          effectiveResolution.from_revision_id ===
            selectedPresentation.current_revision.id &&
          effectiveResolution.to_revision_id ===
            currentPresentation.current_revision.id &&
          effectiveResolution.impact_fingerprint ===
            impactResponse.impact.impact_fingerprint

        if (!retainingThisImpact) {
          setPendingRevisionImpact({
            impact: impactResponse.impact,
            target: currentPresentation,
          })
          setRevisionDecisionReason("")
          throw new RevisionDecisionRequiredError()
        }
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

      return sdk.client.fetch<CreateDraftResponse>(
        "/admin/compounded-product/products",
        {
          method: "POST",
          body: {
            idempotency_key: submissionKey,
            presentation_revision_id: selectedPresentation.current_revision.id,
            expected_configuration_fingerprint:
              selectedPresentation.current_revision.fingerprint,
            configuration_revision_resolution: effectiveResolution,
            selected_value_keys_by_axis: selectedValues,
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
              subtitle: product.subtitle || null,
              description: product.description || null,
              handle: product.handle || null,
              type_id: product.typeId || null,
              collection_id: product.collectionId || null,
              category_ids: categoryIds,
              tag_ids: tagIds,
              sales_channel_ids: salesChannelIds,
              shipping_profile_id: product.shippingProfileId,
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
    onError: (error) => {
      if (error instanceof RevisionDecisionRequiredError) return
      toast.error(messageFromError(error, "Product draft could not be created"))
    },
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

  const applySelectedValueChange = (axisKey: string, valueKey: string) => {
    setSelectedValues((current) => {
      const selected = current[axisKey] || []
      const next = selected.includes(valueKey)
        ? selected.filter((key) => key !== valueKey)
        : [...selected, valueKey]

      return { ...current, [axisKey]: next }
    })
    setExcludedKeys([])
    setPreview(null)
    setLargeMatrixConfirmed(false)
    setExpandedRows([])
    setPendingVariationChange(null)
  }

  const requestSelectedValueChange = (input: {
    axisKey: string
    axisLabel: string
    valueKey: string
    valueLabel: string
  }) => {
    const selected = selectedValues[input.axisKey] || []
    const hasDownstreamWork =
      Boolean(preview) ||
      excludedKeys.length > 0 ||
      Object.values(variantDrafts).some(
        (draft) =>
          Boolean(draft.sku.trim()) ||
          Boolean(draft.priceAmount) ||
          Boolean(draft.currencyCode) ||
          Object.keys(draft.configuredValues).length > 0,
      )

    if (!hasDownstreamWork) {
      applySelectedValueChange(input.axisKey, input.valueKey)
      return
    }

    setPendingVariationChange({
      ...input,
      selecting: !selected.includes(input.valueKey),
    })
  }

  const toggleId = (
    current: string[],
    id: string,
    setter: (ids: string[]) => void,
  ) => setter(current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  const isLoadingReferenceData =
    presentationsQuery.isLoading ||
    shippingProfilesQuery.isLoading ||
    salesChannelsQuery.isLoading ||
    regionsQuery.isLoading ||
    productTypesQuery.isLoading ||
    collectionsQuery.isLoading ||
    categoriesQuery.isLoading ||
    tagsQuery.isLoading
  const referenceDataError =
    presentationsQuery.error ||
    shippingProfilesQuery.error ||
    salesChannelsQuery.error ||
    regionsQuery.error ||
    productTypesQuery.error ||
    collectionsQuery.error ||
    categoriesQuery.error ||
    tagsQuery.error
  const revisionDownstreamImpact = {
    product_field_values: Object.keys(productConfiguredValues).length,
    variants: preview?.matrix.resultingVariantCount || 0,
    skus: Object.values(variantDrafts).filter((draft) => draft.sku.trim())
      .length,
    prices: Object.values(variantDrafts).filter(
      (draft) => draft.priceAmount && draft.currencyCode,
    ).length,
    measurements:
      countStructuredMeasurements(productConfiguredValues) +
      Object.values(variantDrafts).reduce(
        (count, draft) =>
          count + countStructuredMeasurements(draft.configuredValues),
        0,
      ),
    assigned_images: Object.values(variantDrafts).reduce(
      (count, draft) => count + draft.imageUrls.length,
      0,
    ),
    bom_choices: 0,
  }
  const {
    autoGeneratedSkuCount,
    managedVariantCount,
    draftSaveBlockers,
    publicationReviewItems,
  } = createCompoundedProductCreationReview({
    title: product.title,
    shippingProfileId: product.shippingProfileId,
    rows: preview?.matrix.rows || [],
    drafts: variantDrafts,
    policy: snapshot?.readiness_policy || {
      require_price: false,
      require_sales_channel: false,
      require_bom_for_managed_inventory: false,
    },
    salesChannelCount: salesChannelIds.length,
    largeMatrixRequiresConfirmation:
      preview?.matrix.requiresConfirmation || false,
    largeMatrixConfirmed,
  })

  const applyPresentationChange = (
    presentation: PresentationListItem,
    resolution: ConfigurationRevisionResolution | null = null,
  ) => {
    if (!presentation.current_revision) return
    setPinnedPresentation(presentation)
    setPresentationRevisionId(presentation.current_revision.id)
    setRevisionResolution(resolution)
    setProductConfiguredValues({})
    setVariantDrafts({})
    setSelectedValues({})
    setExcludedKeys([])
    setPreview(null)
    setLargeMatrixConfirmed(false)
    setExpandedRows([])
    setPendingPresentationRevisionId(null)
  }

  if (isLoadingReferenceData) {
    return (
      <Container className="flex min-h-96 items-center justify-center">
        <Spinner />
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="flex flex-col gap-y-1 px-6 py-4">
        <Heading>Create compounded product</Heading>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Build a native Medusa draft from an active, versioned presentation.
          Presentation fields and variation axes come from configuration.
        </Text>
      </Container>

      {referenceDataError ? (
        <Container className="px-6 py-4">
          <Text size="small" className="text-ui-fg-error">
            Required Medusa reference data could not be loaded. Refresh the
            page before creating a product.
          </Text>
        </Container>
      ) : null}

      <Container className="flex flex-col gap-y-5 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Text size="small" leading="compact" weight="plus">
            1. Product identity
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            The title identifies the catalog product. Strength, package, and
            inclusion belong in configured fields or variation values.
          </Text>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-y-2">
            <Label>Presentation configuration</Label>
            <Select
              value={presentationRevisionId}
              onValueChange={(revisionId) => {
                if (!presentationRevisionId) {
                  const selected = presentationOptions.find(
                    (item) => item.current_revision?.id === revisionId,
                  )
                  if (selected) applyPresentationChange(selected)
                  return
                }

                if (revisionId !== presentationRevisionId) {
                  setPendingPresentationRevisionId(revisionId)
                }
              }}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select active presentation" />
              </Select.Trigger>
              <Select.Content>
                {presentationOptions.map((item) => (
                  <Select.Item
                    key={item.current_revision!.id}
                    value={item.current_revision!.id}
                  >
                    {item.current_revision!.snapshot.label} · revision {item.current_revision!.revision}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="product-title">Title</Label>
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
              placeholder="Research compound name"
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="product-subtitle">Subtitle</Label>
            <Input
              id="product-subtitle"
              value={product.subtitle}
              onChange={(event) =>
                setProduct((current) => ({
                  ...current,
                  subtitle: event.target.value,
                }))
              }
              placeholder="Optional presentation-neutral subtitle"
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="product-handle">Handle</Label>
            <Input
              id="product-handle"
              value={product.handle}
              onChange={(event) => {
                setHandleEdited(true)
                setProduct((current) => ({
                  ...current,
                  handle: event.target.value,
                }))
              }}
              placeholder="research-compound-name"
            />
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="product-description">Description</Label>
          <Textarea
            id="product-description"
            value={product.description}
            onChange={(event) =>
              setProduct((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Product description"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-y-2">
            <Label>Shipping profile *</Label>
            <Select
              value={product.shippingProfileId}
              onValueChange={(shippingProfileId) =>
                setProduct((current) => ({ ...current, shippingProfileId }))
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Select shipping profile" />
              </Select.Trigger>
              <Select.Content>
                {(shippingProfilesQuery.data || []).map(
                  (profile) => (
                    <Select.Item key={profile.id} value={profile.id}>
                      {profile.name}
                    </Select.Item>
                  ),
                )}
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Product type</Label>
            <Select
              value={product.typeId || undefined}
              onValueChange={(typeId) =>
                setProduct((current) => ({ ...current, typeId }))
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="No product type" />
              </Select.Trigger>
              <Select.Content>
                {(productTypesQuery.data || []).map((type) => (
                  <Select.Item key={type.id} value={type.id}>
                    {type.value}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Collection</Label>
            <Select
              value={product.collectionId || undefined}
              onValueChange={(collectionId) =>
                setProduct((current) => ({ ...current, collectionId }))
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="No collection" />
              </Select.Trigger>
              <Select.Content>
                {(collectionsQuery.data || []).map((collection) => (
                  <Select.Item key={collection.id} value={collection.id}>
                    {collection.title}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>

        <ReferenceCheckboxes
          label="Sales channels"
          items={(salesChannelsQuery.data || []).map((item) => ({
            id: item.id,
            label: item.name,
          }))}
          selected={salesChannelIds}
          onToggle={(id) => toggleId(salesChannelIds, id, setSalesChannelIds)}
        />
        <ReferenceCheckboxes
          label="Categories"
          items={(categoriesQuery.data || []).map((item) => ({
            id: item.id,
            label: item.name,
          }))}
          selected={categoryIds}
          onToggle={(id) => toggleId(categoryIds, id, setCategoryIds)}
        />
        <ReferenceCheckboxes
          label="Tags"
          items={(tagsQuery.data || []).map((item) => ({
            id: item.id,
            label: item.value,
          }))}
          selected={tagIds}
          onToggle={(id) => toggleId(tagIds, id, setTagIds)}
        />

        <div className="flex flex-col gap-y-3">
          <div className="flex items-center justify-between gap-x-3">
            <div className="flex flex-col gap-y-1">
              <Label>Media</Label>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Upload images up to 10 MB each.
              </Text>
            </div>
            <Button
              size="small"
              variant="secondary"
              isLoading={uploadMutation.isPending}
              onClick={() => uploadInputRef.current?.click()}
            >
              Upload images
            </Button>
            <input
              ref={uploadInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files || [])
                if (files.length) uploadMutation.mutate(files)
                event.target.value = ""
              }}
            />
          </div>
          {uploadedMedia.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {uploadedMedia.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-col gap-y-2 rounded-lg border border-ui-border-base p-3"
                >
                  <img
                    src={file.url}
                    alt="Uploaded product media"
                    className="aspect-square w-full rounded-md object-cover"
                  />
                  <Button
                    size="small"
                    variant="secondary"
                    isLoading={removeUploadMutation.isPending}
                    onClick={() => removeUploadMutation.mutate(file)}
                  >
                    Remove from product
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Container>

      {snapshot ? (
        <Container className="flex flex-col gap-y-5 px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <Text size="small" leading="compact" weight="plus">
              2. Presentation data
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Fields, units, requirements, and persistence targets are defined
              by {snapshot.label}.
            </Text>
          </div>
          {snapshot.fields.some((field) => !field.metadata_target) ? (
            <Text size="small" className="text-ui-fg-warning">
              Fields without a metadata persistence target are configuration
              guidance only and cannot be written into this draft.
            </Text>
          ) : null}
          {productFields.length ? (
            <div className="flex flex-col gap-y-5">
              {productFields.map((field) => (
                <ConfiguredFieldInput
                  key={field.key}
                  field={field}
                  value={productConfiguredValues[field.key]}
                  onChange={(value) =>
                    setProductConfiguredValues((current) => {
                      const next = { ...current }
                      if (value === undefined) delete next[field.key]
                      else next[field.key] = value
                      return next
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <Text size="small" className="text-ui-fg-subtle">
              This presentation has no product-level configured fields.
            </Text>
          )}
        </Container>
      ) : null}

      {snapshot ? (
        <Container className="flex flex-col gap-y-5 px-6 py-4">
          <div className="flex items-start justify-between gap-x-4">
            <div className="flex flex-col gap-y-1">
              <Text size="small" leading="compact" weight="plus">
                3. Variations
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                Select values for every ordered, semantic product option.
              </Text>
            </div>
            <Button
              size="small"
              onClick={() => previewMutation.mutate()}
              isLoading={previewMutation.isPending}
            >
              Generate matrix
            </Button>
          </div>

          {snapshot.variation_axes
            .slice()
            .sort((left, right) => left.position - right.position)
            .map((axis, index) => (
              <div
                key={axis.key}
                className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4"
              >
                <div className="flex flex-col gap-y-1">
                  <Text size="small" leading="compact" weight="plus">
                    Variation {index + 1} — {axis.semantic_name}
                  </Text>
                  {axis.help_text ? (
                    <Text size="small" className="text-ui-fg-subtle">
                      {axis.help_text}
                    </Text>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {axis.values
                    .filter((value) => value.active)
                    .sort((left, right) => left.position - right.position)
                    .map((value) => (
                      <label
                        key={value.key}
                        className="flex cursor-pointer items-start gap-x-3 rounded-lg border border-ui-border-base p-3"
                      >
                        <Checkbox
                          checked={(selectedValues[axis.key] || []).includes(
                            value.key,
                          )}
                          onCheckedChange={() =>
                            requestSelectedValueChange({
                              axisKey: axis.key,
                              axisLabel: axis.semantic_name,
                              valueKey: value.key,
                              valueLabel: value.label,
                            })
                          }
                        />
                        <span className="flex flex-col gap-y-1">
                          <Text size="small" weight="plus">
                            {value.label}
                          </Text>
                          {value.measurement ? (
                            <Text size="small" className="text-ui-fg-subtle">
                              {value.measurement.amount} {value.measurement.display_unit}
                            </Text>
                          ) : null}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
        </Container>
      ) : null}

      {preview ? (
        <Container className="flex flex-col gap-y-5 px-6 py-4">
          <div className="flex items-start justify-between gap-x-4">
            <div className="flex flex-col gap-y-1">
              <Text size="small" leading="compact" weight="plus">
                4. Variant matrix
              </Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                {preview.matrix.totalCombinationCount} total · {preview.matrix.excludedCombinationCount} excluded · {preview.matrix.resultingVariantCount} resulting
              </Text>
            </div>
            {excludedKeys.length ? (
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  setExcludedKeys([])
                  setPreview(null)
                }}
              >
                Clear exclusions
              </Button>
            ) : null}
          </div>

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

          <div className="flex flex-col gap-y-3">
            {preview.matrix.rows.map((row) => {
              const draft = variantDrafts[row.key]
              const expanded = expandedRows.includes(row.key)

              return (
                <div
                  key={row.key}
                  className="flex flex-col gap-y-4 rounded-lg border border-ui-border-base p-4"
                >
                  <div className="flex items-start justify-between gap-x-4">
                    <div className="flex flex-col gap-y-1">
                      <Text size="small" weight="plus">
                        {row.title}
                      </Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        {row.options
                          .map(
                            (option) =>
                              `${option.semanticName}: ${option.valueLabel}`,
                          )
                          .join(" · ")}
                      </Text>
                    </div>
                    <div className="flex items-center gap-x-2">
                      {variantFields.length ? (
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() =>
                            setExpandedRows((current) =>
                              current.includes(row.key)
                                ? current.filter((key) => key !== row.key)
                                : [...current, row.key],
                            )
                          }
                        >
                          {expanded ? "Hide fields" : "Configured fields"}
                        </Button>
                      ) : null}
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => {
                          setExcludedKeys((current) => [...current, row.key])
                          setPreview(null)
                        }}
                      >
                        Exclude
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-3">
                    <div className="flex flex-col gap-y-2">
                      <Label htmlFor={`sku-${row.key}`}>SKU (optional)</Label>
                      <Input
                        id={`sku-${row.key}`}
                        value={draft?.sku || ""}
                        placeholder="Generated automatically when blank"
                        onChange={(event) =>
                          updateVariant(row.key, { sku: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label htmlFor={`price-${row.key}`}>Price amount</Label>
                      <Input
                        id={`price-${row.key}`}
                        inputMode="decimal"
                        value={draft?.priceAmount || ""}
                        onChange={(event) =>
                          updateVariant(row.key, {
                            priceAmount: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-y-2">
                      <Label>Currency</Label>
                      {currencies.length ? (
                        <Select
                          value={draft?.currencyCode || undefined}
                          onValueChange={(currencyCode) =>
                            updateVariant(row.key, { currencyCode })
                          }
                        >
                          <Select.Trigger>
                            <Select.Value placeholder="Select currency" />
                          </Select.Trigger>
                          <Select.Content>
                            {currencies.map((currency) => (
                              <Select.Item key={currency} value={currency}>
                                {currency}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      ) : (
                        <Input
                          maxLength={3}
                          value={draft?.currencyCode || ""}
                          onChange={(event) =>
                            updateVariant(row.key, {
                              currencyCode: event.target.value.toUpperCase(),
                            })
                          }
                        />
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ToggleSetting
                      label="Manage inventory"
                      description="Use Medusa inventory for this sellable variant."
                      checked={draft?.manageInventory ?? true}
                      onChange={(manageInventory) =>
                        updateVariant(row.key, { manageInventory })
                      }
                    />
                    <ToggleSetting
                      label="Allow backorders"
                      description="Allow checkout when available stock is exhausted."
                      checked={draft?.allowBackorder ?? false}
                      onChange={(allowBackorder) =>
                        updateVariant(row.key, { allowBackorder })
                      }
                    />
                  </div>
                  {uploadedMedia.length ? (
                    <div className="flex flex-col gap-y-2">
                      <Text size="small" weight="plus">
                        Variant images
                      </Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        Assign uploaded product images that represent this
                        specific option combination.
                      </Text>
                      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {uploadedMedia.map((file) => {
                          const selected =
                            draft?.imageUrls.includes(file.url) || false

                          return (
                            <label
                              key={file.id}
                              className="flex cursor-pointer flex-col gap-y-2 rounded-lg border border-ui-border-base p-2"
                            >
                              <img
                                src={file.url}
                                alt="Uploaded product media option"
                                className="aspect-square w-full rounded-md object-cover"
                              />
                              <span className="flex items-center gap-x-2">
                                <Checkbox
                                  checked={selected}
                                  onCheckedChange={() =>
                                    updateVariant(row.key, {
                                      imageUrls: selected
                                        ? (draft?.imageUrls || []).filter(
                                            (url) => url !== file.url,
                                          )
                                        : [
                                            ...(draft?.imageUrls || []),
                                            file.url,
                                          ],
                                    })
                                  }
                                />
                                <Text size="small">
                                  {selected ? "Assigned" : "Assign"}
                                </Text>
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                  {expanded ? (
                    <div className="flex flex-col gap-y-5 border-t border-ui-border-base pt-4">
                      {variantFields.map((field) => (
                        <ConfiguredFieldInput
                          key={field.key}
                          field={field}
                          value={draft?.configuredValues[field.key]}
                          onChange={(value) => {
                            const configuredValues = {
                              ...(draft?.configuredValues || {}),
                            }
                            if (value === undefined) delete configuredValues[field.key]
                            else configuredValues[field.key] = value
                            updateVariant(row.key, { configuredValues })
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </Container>
      ) : null}

      {preview ? (
        <Container className="flex flex-col gap-y-4 px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <Text size="small" leading="compact" weight="plus">
              5. BOM readiness
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Recipes attach to native variants after the draft exists. This
              stage previews which generated variants will require component
              review without inventing inventory-item IDs or quantities.
            </Text>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-ui-border-base p-4">
              <Text size="small" weight="plus">
                {managedVariantCount} managed-inventory variant{managedVariantCount === 1 ? "" : "s"}
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                {snapshot?.readiness_policy.require_bom_for_managed_inventory
                  ? "A valid recipe is required before publication."
                  : "This presentation does not make a recipe a publication requirement."}
              </Text>
            </div>
            <div className="rounded-lg border border-ui-border-base p-4">
              <Text size="small" weight="plus">
                Recipe selection remains pending
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Save the draft, then select approved BOM component profiles and
                exact base-unit quantities from the product readiness page.
              </Text>
            </div>
          </div>
        </Container>
      ) : null}

      {preview ? (
        <Container className="flex flex-col gap-y-4 px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <Text size="small" leading="compact" weight="plus">
              6. Review
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Confirm what can be saved now and what must be resolved before
              the separately governed publication action.
            </Text>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-ui-border-base p-4">
              <Text size="small" weight="plus">
                Draft save
              </Text>
              {draftSaveBlockers.length ? (
                <div className="mt-2 flex flex-col gap-y-1">
                  {draftSaveBlockers.map((blocker) => (
                    <Text key={blocker} size="small" className="text-ui-fg-error">
                      {blocker}
                    </Text>
                  ))}
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-y-1">
                  <Text size="small" className="text-ui-fg-success">
                    The current payload is ready to save as a native Medusa
                    draft.
                  </Text>
                  {autoGeneratedSkuCount > 0 ? (
                    <Text size="small" className="text-ui-fg-subtle">
                      {autoGeneratedSkuCount} blank SKU
                      {autoGeneratedSkuCount === 1 ? " will" : "s will"} be
                      generated automatically when saved.
                    </Text>
                  ) : null}
                </div>
              )}
            </div>
            <div className="rounded-lg border border-ui-border-base p-4">
              <Text size="small" weight="plus">
                Publication follow-up
              </Text>
              {publicationReviewItems.length ? (
                <div className="mt-2 flex flex-col gap-y-1">
                  {publicationReviewItems.map((item) => (
                    <Text key={item} size="small" className="text-ui-fg-warning">
                      {item}
                    </Text>
                  ))}
                </div>
              ) : (
                <Text size="small" className="mt-2 text-ui-fg-subtle">
                  No known configuration-level publication follow-up is shown;
                  server readiness is evaluated again after draft creation.
                </Text>
              )}
            </div>
          </div>
        </Container>
      ) : null}

      <Container className="flex items-center justify-between gap-x-4 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Text size="small" weight="plus">
            Save as draft
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            Publication, BOM completion, and readiness evaluation remain
            separate governed actions.
          </Text>
        </div>
        <Button
          size="small"
          disabled={
            !preview ||
            Boolean(referenceDataError) ||
            draftSaveBlockers.length > 0 ||
            createMutation.isPending
          }
          isLoading={createMutation.isPending}
          onClick={() => createMutation.mutate(undefined)}
        >
          Save product draft
        </Button>
      </Container>

      <Prompt
        open={Boolean(pendingPresentationRevisionId)}
        onOpenChange={(open) => {
          if (!open) setPendingPresentationRevisionId(null)
        }}
      >
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Change presentation configuration?</Prompt.Title>
            <Prompt.Description>
              This resets presentation fields, selected variation values,
              exclusions, generated variants, SKUs, prices, and variant-level
              metadata. Product identity and uploaded media are retained. The
              current downstream impact is {revisionDownstreamImpact.variants}
              {" "}variants, {revisionDownstreamImpact.skus} SKUs,{" "}
              {revisionDownstreamImpact.prices} prices,{" "}
              {revisionDownstreamImpact.measurements} measurements,{" "}
              {revisionDownstreamImpact.assigned_images} image assignments,
              and{" "}
              {revisionDownstreamImpact.bom_choices} BOM choices.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel>Keep current presentation</Prompt.Cancel>
            <Prompt.Action
              onClick={() => {
                const selected = activePresentations.find(
                  (item) =>
                    item.current_revision?.id === pendingPresentationRevisionId,
                )
                if (selected) {
                  applyPresentationChange(selected)
                }
              }}
            >
              Reset and change
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>

      <Prompt
        open={Boolean(pendingVariationChange)}
        onOpenChange={(open) => {
          if (!open) setPendingVariationChange(null)
        }}
      >
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Change the variant matrix inputs?</Prompt.Title>
            <Prompt.Description>
              {pendingVariationChange
                ? `${pendingVariationChange.selecting ? "Adding" : "Removing"} ${pendingVariationChange.valueLabel} in ${pendingVariationChange.axisLabel} invalidates the current matrix preview and exclusions.`
                : "This variation change invalidates the current matrix preview."}{" "}
              Existing configured row data is retained by combination key and
              will be reused when the same row appears again. Current impact:{" "}
              {revisionDownstreamImpact.variants} variants,{" "}
              {revisionDownstreamImpact.skus} SKUs,{" "}
              {revisionDownstreamImpact.prices} prices,{" "}
              {revisionDownstreamImpact.measurements} measurements,{" "}
              {revisionDownstreamImpact.assigned_images} image assignments,
              and{" "}
              {revisionDownstreamImpact.bom_choices} BOM choices.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel>Keep current matrix</Prompt.Cancel>
            <Prompt.Action
              onClick={() => {
                if (pendingVariationChange) {
                  applySelectedValueChange(
                    pendingVariationChange.axisKey,
                    pendingVariationChange.valueKey,
                  )
                }
              }}
            >
              Change and regenerate
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>

      <Prompt
        open={Boolean(pendingRevisionImpact)}
        onOpenChange={(open) => {
          if (!open) setPendingRevisionImpact(null)
        }}
      >
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Configuration revision changed</Prompt.Title>
            <Prompt.Description>
              Review the impact before retaining the pinned configuration or
              migrating this unfinished draft. Migration resets the affected
              presentation data; it never discards it silently.
            </Prompt.Description>
          </Prompt.Header>
          {pendingRevisionImpact ? (
            <div className="flex flex-col gap-y-4 px-6 pb-4">
              <div className="rounded-lg border border-ui-border-base p-4">
                <Text size="small" weight="plus">
                  Revision {pendingRevisionImpact.impact.from_revision.revision}
                  {" → "}
                  {pendingRevisionImpact.impact.to_revision.revision}
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  Fields changed: {pendingRevisionImpact.impact.changed_fields.length}
                  {" · "}variation axes changed:{" "}
                  {pendingRevisionImpact.impact.changed_variation_axes.length}
                  {" · "}label/description:{" "}
                  {pendingRevisionImpact.impact.label_changed ||
                  pendingRevisionImpact.impact.description_changed
                    ? "changed"
                    : "unchanged"}
                  {" · "}SKU policy:{" "}
                  {pendingRevisionImpact.impact.sku_policy_changed
                    ? "changed"
                    : "unchanged"}
                  {" · "}readiness policy:{" "}
                  {pendingRevisionImpact.impact.readiness_policy_changed
                    ? "changed"
                    : "unchanged"}
                </Text>
              </div>
              <div className="rounded-lg border border-ui-border-base p-4">
                <Text size="small" weight="plus">
                  Unfinished work affected by migration
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  {revisionDownstreamImpact.product_field_values} product field
                  values · {revisionDownstreamImpact.variants} variants ·{" "}
                  {revisionDownstreamImpact.skus} SKUs ·{" "}
                  {revisionDownstreamImpact.prices} prices ·{" "}
                  {revisionDownstreamImpact.measurements} measurements ·{" "}
                  {revisionDownstreamImpact.bom_choices} BOM choices
                </Text>
              </div>
              {!pendingRevisionImpact.impact.retain_eligible ? (
                <Text size="small" className="text-ui-fg-error">
                  The pinned revision is blocked or archived and cannot be
                  retained for a new product.
                </Text>
              ) : null}
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="revision-decision-reason">
                  Decision reason
                </Label>
                <Textarea
                  id="revision-decision-reason"
                  value={revisionDecisionReason}
                  onChange={(event) =>
                    setRevisionDecisionReason(event.target.value)
                  }
                  placeholder="Explain why this draft should retain or migrate configuration"
                />
              </div>
            </div>
          ) : null}
          <Prompt.Footer>
            <Prompt.Cancel>Continue reviewing</Prompt.Cancel>
            <Button
              size="small"
              variant="secondary"
              disabled={
                !pendingRevisionImpact?.impact.retain_eligible ||
                revisionDecisionReason.trim().length < 3
              }
              onClick={() => {
                if (!pendingRevisionImpact) return
                const resolution: ConfigurationRevisionResolution = {
                  action: "retain",
                  from_revision_id:
                    pendingRevisionImpact.impact.from_revision.id,
                  to_revision_id: pendingRevisionImpact.impact.to_revision.id,
                  impact_fingerprint:
                    pendingRevisionImpact.impact.impact_fingerprint,
                  reason: revisionDecisionReason.trim(),
                }
                setRevisionResolution(resolution)
                setPendingRevisionImpact(null)
                createMutation.mutate(resolution)
              }}
            >
              Retain pinned revision
            </Button>
            <Prompt.Action
              disabled={revisionDecisionReason.trim().length < 3}
              onClick={() => {
                if (!pendingRevisionImpact) return
                const resolution: ConfigurationRevisionResolution = {
                  action: "migrate",
                  from_revision_id:
                    pendingRevisionImpact.impact.from_revision.id,
                  to_revision_id: pendingRevisionImpact.impact.to_revision.id,
                  impact_fingerprint:
                    pendingRevisionImpact.impact.impact_fingerprint,
                  reason: revisionDecisionReason.trim(),
                }
                applyPresentationChange(
                  pendingRevisionImpact.target,
                  resolution,
                )
                setPendingRevisionImpact(null)
              }}
            >
              Migrate and reset affected work
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </div>
  )
}

const ReferenceCheckboxes = ({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string
  items: Array<{ id: string; label: string }>
  selected: string[]
  onToggle: (id: string) => void
}) => {
  if (!items.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Label>{label}</Label>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-x-3 rounded-lg border border-ui-border-base p-3"
          >
            <Checkbox
              checked={selected.includes(item.id)}
              onCheckedChange={() => onToggle(item.id)}
            />
            <Text size="small">{item.label}</Text>
          </label>
        ))}
      </div>
    </div>
  )
}

const ToggleSetting = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) => (
  <div className="flex items-center justify-between gap-x-4 rounded-lg border border-ui-border-base p-4">
    <div className="flex flex-col gap-y-1">
      <Text size="small" weight="plus">
        {label}
      </Text>
      <Text size="small" className="text-ui-fg-subtle">
        {description}
      </Text>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
)

export const config = defineRouteConfig({
  label: "Create Compounded Product",
})

export default CompoundedProductsPage
