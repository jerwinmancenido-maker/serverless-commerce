import { ChevronDownMini, ChevronUpMini, Spinner } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import {
  Badge,
  Button,
  Container,
  Copy,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { sdk } from "../../../lib/sdk"
import type {
  ComponentProfile,
  ComponentProfilesResponse,
  ClassificationChangeResponse,
  ClassificationImpact,
  ClassificationImpactResponse,
  GovernanceAuditEventsResponse,
  PublicationChangeResponse,
  ProductReadinessResponse,
  ConfiguredRecipeAvailabilityResponse,
} from "../types"

type RecipeRow = {
  inventoryItemId: string
  requiredDisplayAmount: string
}

type CompoundFormat = {
  id: string
  key: string
  name: string
  status: "active" | "archived"
}

type CompoundFormatsResponse = {
  formats: CompoundFormat[]
  count: number
}

const formatVariantPrices = (
  prices: HttpTypes.AdminProductVariant["prices"],
) => {
  if (!prices?.length) {
    return "No price"
  }

  return prices
    .map((price) =>
      new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: price.currency_code.toUpperCase(),
      }).format(price.amount),
    )
    .join(", ")
}

const blockerLabels: Record<
  ProductReadinessResponse["blockers"][number],
  string
> = {
  registration_missing: "Governed registration is missing",
  configuration_revision_inactive: "Pinned configuration is no longer active",
  variant_matrix_empty: "The product has no variants",
  price_missing: "One or more variants have no price",
  sales_channel_missing: "No sales channel is assigned",
  bom_recipe_missing:
    "One or more managed-inventory variants need a BOM recipe",
  structured_measurement_invalid: "Structured quantity metadata is invalid",
  audit_unavailable: "Governance audit support is not available yet",
}

const classificationBlockerLabels: Record<
  ClassificationImpact["blockers"][number],
  string
> = {
  already_published:
    "Governance cannot be removed or reclassified after publication",
  ordered_variant_exists:
    "Governance cannot change after a variant appears on an order",
  target_type_unchanged: "Choose a different product type",
  target_type_must_be_governed:
    "Reclassification requires an active governed product-type mapping",
  target_type_must_be_standard:
    "Governance removal requires a standard, non-governed product type",
}

const messageFromError = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

const listAllInventoryItems = async () => {
  const pageSize = 100
  let offset = 0
  let count = 0
  const inventoryItems: HttpTypes.AdminInventoryItem[] = []

  do {
    const page = await sdk.admin.inventoryItem.list({
      limit: pageSize,
      offset,
    })
    inventoryItems.push(...page.inventory_items)
    count = page.count
    offset += page.inventory_items.length
  } while (offset < count)

  return inventoryItems
}

const CompoundedProductReadinessPage = () => {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [recipes, setRecipes] = useState<Record<string, RecipeRow[]>>({})
  const [expandedRecipeIds, setExpandedRecipeIds] = useState<Set<string>>(
    new Set(),
  )
  const [publicationDrawerOpen, setPublicationDrawerOpen] = useState(false)
  const [classificationDrawerOpen, setClassificationDrawerOpen] =
    useState(false)
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false)
  const [publicationReason, setPublicationReason] = useState("")
  const [classificationAction, setClassificationAction] = useState<
    "reclassify" | "remove_governance"
  >("reclassify")
  const [targetProductTypeId, setTargetProductTypeId] = useState("")
  const [classificationReason, setClassificationReason] = useState("")
  const [classificationImpact, setClassificationImpact] =
    useState<ClassificationImpact | null>(null)
  const [selectedStockLocationId, setSelectedStockLocationId] = useState("")
  const publicationReasonValid = publicationReason.trim().length >= 3

  const productQuery = useQuery({
    queryKey: ["compounded-product-native-product", id],
    enabled: Boolean(id),
    queryFn: () =>
      sdk.admin.product.retrieve(id, {
        fields:
          "+metadata,+categories.*,+images.*,+sales_channels.*,+variants.*,+variants.prices.*,+variants.options.*",
      }),
  })
  const compoundFormatsQuery = useQuery({
    queryKey: ["compound-product-formats", "merchant-product-details"],
    queryFn: () =>
      sdk.client.fetch<CompoundFormatsResponse>(
        "/admin/compounded-product/formats",
        { query: { limit: 100, offset: 0 } },
      ),
  })
  const stockLocationsQuery = useQuery({
    queryKey: ["stock-locations", "merchant-product-details"],
    queryFn: () => sdk.admin.stockLocation.list({ limit: 100 }),
  })
  const productTypesQuery = useQuery({
    queryKey: ["product-types", "compounded-product-classification"],
    queryFn: () => sdk.admin.productType.list({ limit: 100 }),
  })
  const readinessQuery = useQuery({
    queryKey: ["compounded-product-readiness", id],
    enabled: Boolean(id),
    queryFn: () =>
      sdk.client.fetch<ProductReadinessResponse>(
        `/admin/compounded-product/products/${id}/readiness`,
      ),
  })
  const profilesQuery = useQuery({
    queryKey: ["bom-component-profiles", "compounded-product-readiness"],
    queryFn: () =>
      sdk.client.fetch<ComponentProfilesResponse>(
        "/admin/bom/component-profiles",
      ),
  })
  const inventoryQuery = useQuery({
    queryKey: ["inventory-items", "compounded-product-readiness"],
    queryFn: listAllInventoryItems,
  })
  const auditQuery = useQuery({
    queryKey: ["compounded-product-audit-events", id],
    enabled: Boolean(id && auditDrawerOpen),
    queryFn: () =>
      sdk.client.fetch<GovernanceAuditEventsResponse>(
        `/admin/compounded-product/products/${id}/audit-events`,
      ),
  })
  const inventoryById = useMemo(
    () => new Map((inventoryQuery.data || []).map((item) => [item.id, item])),
    [inventoryQuery.data],
  )
  const profiles = profilesQuery.data?.component_profiles || []
  const profileByInventoryId = useMemo(
    () =>
      new Map(profiles.map((profile) => [profile.inventory_item_id, profile])),
    [profiles],
  )
  const variantIds = useMemo(
    () =>
      (productQuery.data?.product.variants || []).map((variant) => variant.id),
    [productQuery.data?.product.variants],
  )
  const variantIdKey = variantIds.join(",")
  const availabilityQuery = useQuery({
    queryKey: [
      "bom-location-availability",
      "merchant-product-details",
      selectedStockLocationId,
      variantIdKey,
    ],
    enabled: Boolean(selectedStockLocationId && variantIds.length),
    queryFn: () =>
      sdk.client.fetch<ConfiguredRecipeAvailabilityResponse>(
        "/admin/bom/availability",
        {
          query: {
            location_id: selectedStockLocationId,
            variant_ids: variantIdKey,
          },
        },
      ),
  })
  const availabilityByVariantId = useMemo(
    () =>
      new Map(
        (availabilityQuery.data?.variants || []).map((availability) => [
          availability.variant_id,
          availability,
        ]),
      ),
    [availabilityQuery.data?.variants],
  )

  useEffect(() => {
    const locations = stockLocationsQuery.data?.stock_locations || []

    if (
      !locations.some((location) => location.id === selectedStockLocationId)
    ) {
      setSelectedStockLocationId(locations[0]?.id || "")
    }
  }, [selectedStockLocationId, stockLocationsQuery.data?.stock_locations])

  const recipeMutation = useMutation({
    mutationFn: ({
      variantId,
      rows,
    }: {
      variantId: string
      rows: RecipeRow[]
    }) => {
      if (!rows.length) {
        throw new Error("Add at least one configured component")
      }

      rows.forEach((row) => {
        if (!row.inventoryItemId || !row.requiredDisplayAmount) {
          throw new Error(
            "Every component requires an inventory item and amount",
          )
        }
      })

      return sdk.client.fetch(
        `/admin/compounded-product/products/${id}/variants/${variantId}/recipe`,
        {
          method: "POST",
          body: {
            components: rows.map((row) => ({
              inventory_item_id: row.inventoryItemId,
              required_display_amount: row.requiredDisplayAmount,
            })),
            note: "Configured through compounded-product readiness review",
          },
        },
      )
    },
    onSuccess: async (_response, variables) => {
      toast.success("Variant BOM recipe saved")
      setRecipes((current) => {
        const next = { ...current }
        delete next[variables.variantId]
        return next
      })
      await queryClient.invalidateQueries({
        queryKey: ["compounded-product-readiness", id],
      })
    },
    onError: (error) =>
      toast.error(messageFromError(error, "BOM recipe could not be saved")),
  })
  const publicationMutation = useMutation({
    mutationFn: (action: "publish" | "withdraw") => {
      if (publicationReason.trim().length < 3) {
        throw new Error("Enter a reason of at least 3 characters")
      }

      return sdk.client.fetch<PublicationChangeResponse>(
        `/admin/compounded-product/products/${id}/publication`,
        {
          method: "POST",
          body: { action, reason: publicationReason.trim() },
        },
      )
    },
    onSuccess: async (response) => {
      toast.success(
        response.action === "publish"
          ? "Governed product published"
          : "Governed product withdrawn",
      )
      setPublicationReason("")
      setPublicationDrawerOpen(false)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-readiness", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-native-product", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-audit-events", id],
        }),
      ])
    },
    onError: async (error) => {
      toast.error(
        messageFromError(error, "Publication state could not be changed"),
      )
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-readiness", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-audit-events", id],
        }),
      ])
    },
  })
  const classificationImpactMutation = useMutation({
    mutationFn: () => {
      if (!targetProductTypeId) {
        throw new Error("Select a target product type")
      }

      return sdk.client.fetch<ClassificationImpactResponse>(
        `/admin/compounded-product/products/${id}/classification-impact`,
        {
          method: "POST",
          body: {
            action: classificationAction,
            target_product_type_id: targetProductTypeId,
          },
        },
      )
    },
    onSuccess: ({ impact }) => setClassificationImpact(impact),
    onError: (error) =>
      toast.error(
        messageFromError(error, "Classification impact could not be loaded"),
      ),
  })
  const classificationChangeMutation = useMutation({
    mutationFn: () => {
      if (!classificationImpact?.allowed) {
        throw new Error("Resolve every classification blocker first")
      }
      if (classificationReason.trim().length < 3) {
        throw new Error("Enter a reason of at least 3 characters")
      }

      return sdk.client.fetch<ClassificationChangeResponse>(
        `/admin/compounded-product/products/${id}/classification`,
        {
          method: "POST",
          body: {
            action: classificationAction,
            target_product_type_id: targetProductTypeId,
            impact_fingerprint: classificationImpact.impact_fingerprint,
            reason: classificationReason.trim(),
          },
        },
      )
    },
    onSuccess: async (response) => {
      toast.success(
        response.action === "reclassify"
          ? "Governed product reclassified"
          : "Governance removed from product",
      )
      setClassificationImpact(null)
      setClassificationReason("")
      setClassificationDrawerOpen(false)
      if (response.action === "remove_governance") {
        navigate(`/products/${id}`)
        return
      }
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-native-product", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-readiness", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-audit-events", id],
        }),
      ])
    },
    onError: async (error) => {
      toast.error(
        messageFromError(error, "Classification could not be changed"),
      )
      setClassificationImpact(null)
    },
  })

  if (
    productQuery.isLoading ||
    productTypesQuery.isLoading ||
    readinessQuery.isLoading ||
    profilesQuery.isLoading ||
    inventoryQuery.isLoading ||
    compoundFormatsQuery.isLoading ||
    stockLocationsQuery.isLoading
  ) {
    return (
      <Container className="flex min-h-96 items-center justify-center">
        <Spinner />
      </Container>
    )
  }

  if (
    productQuery.isError ||
    productTypesQuery.isError ||
    readinessQuery.isError ||
    profilesQuery.isError ||
    inventoryQuery.isError ||
    !productQuery.data?.product ||
    !readinessQuery.data
  ) {
    return (
      <Container className="flex flex-col gap-y-2 px-6 py-4">
        <Heading>Compounded product review unavailable</Heading>
        <Text className="text-ui-fg-error" size="small">
          The native product, component profiles, or readiness report could not
          be loaded.
        </Text>
      </Container>
    )
  }

  const product = productQuery.data.product
  const readiness = readinessQuery.data
  const compoundFormat = (compoundFormatsQuery.data?.formats || []).find(
    (format) => format.id === readiness.registration.compound_format_id,
  )

  const updateRecipe = (
    variantId: string,
    index: number,
    patch: Partial<RecipeRow>,
  ) => {
    setRecipes((current) => {
      const rows = [...(current[variantId] || [])]
      rows[index] = { ...rows[index], ...patch }
      return { ...current, [variantId]: rows }
    })
  }

  const seedRecipeRows = (variantId: string) => {
    const readinessVariant = readiness.variants.find(
      (variant) => variant.id === variantId,
    )

    if (!readinessVariant?.recipe_components.length) {
      return [{ inventoryItemId: "", requiredDisplayAmount: "" }]
    }

    return readinessVariant.recipe_components.map((component) => {
      const profile = profileByInventoryId.get(component.inventory_item_id)
      return {
        inventoryItemId: component.inventory_item_id,
        requiredDisplayAmount: profile
          ? String(
              component.required_quantity / profile.base_units_per_display_unit,
            )
          : String(component.required_quantity),
      }
    })
  }

  const toggleRecipe = (variantId: string) => {
    setExpandedRecipeIds((current) => {
      const next = new Set(current)

      if (next.has(variantId)) {
        next.delete(variantId)
      } else {
        next.add(variantId)
      }

      return next
    })
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="flex items-start justify-between gap-x-4 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Heading>{product.title}</Heading>
            <Badge color={product.status === "published" ? "green" : "grey"}>
              {product.status}
            </Badge>
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            Manage this product's storefront identity, variants, stock capacity,
            BOM recipes, and publication readiness.
          </Text>
        </div>
        <Button asChild size="small" variant="secondary">
          <Link to={`/products/${product.id}?view=advanced`}>
            Advanced Medusa details
          </Link>
        </Button>
      </Container>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Container className="flex flex-col gap-y-5 px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <Text size="small" weight="plus">
              Product overview
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              Customer-facing catalog information used by the peptide
              storefront.
            </Text>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-y-1">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Product format
              </Text>
              <Text size="small" weight="plus">
                {compoundFormat?.name || "Not assigned"}
              </Text>
            </div>
            <div className="flex flex-col gap-y-1">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Categories
              </Text>
              <Text size="small" weight="plus">
                {product.categories
                  ?.map((category) => category.name)
                  .join(", ") || "Not assigned"}
              </Text>
            </div>
            <div className="flex flex-col gap-y-1">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Sales channels
              </Text>
              <Text size="small" weight="plus">
                {product.sales_channels
                  ?.map((channel) => channel.name)
                  .join(", ") || "Not assigned"}
              </Text>
            </div>
          </div>
          <div className="flex flex-col gap-y-1 border-t border-ui-border-base pt-4">
            <Text size="xsmall" className="text-ui-fg-subtle">
              Description
            </Text>
            <Text size="small" className="whitespace-pre-wrap">
              {product.description || "No description yet."}
            </Text>
          </div>
        </Container>

        <Container className="flex flex-col gap-y-4 px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <Text size="small" weight="plus">
              Product media
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              {product.images?.length || 0} image
              {product.images?.length === 1 ? "" : "s"}
            </Text>
          </div>
          {product.images?.length ? (
            <div className="grid grid-cols-3 gap-2">
              {product.images.slice(0, 6).map((image, index) => (
                <img
                  key={image.id || image.url}
                  src={image.url}
                  alt={`${product.title} product image ${index + 1}`}
                  className="aspect-square w-full rounded-md border border-ui-border-base object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-ui-border-base">
              <Text size="small" className="text-ui-fg-subtle">
                No product images yet
              </Text>
            </div>
          )}
        </Container>
      </div>

      <Container className="flex flex-col gap-y-4 px-6 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-y-1">
            <Text size="small" weight="plus">
              Variants, prices, and calculated stock
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              Calculated stock is the lowest component capacity at the selected
              location. Physical stock remains managed in Inventory.
            </Text>
          </div>
          <div className="min-w-64">
            <Select
              value={selectedStockLocationId || undefined}
              onValueChange={setSelectedStockLocationId}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select stock location" />
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
        </div>
        <div className="overflow-hidden rounded-lg border border-ui-border-base">
          <div className="hidden gap-3 border-b border-ui-border-base bg-ui-bg-subtle px-4 py-2 md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_140px_minmax(0,1fr)]">
            <Text size="xsmall" className="text-ui-fg-subtle">
              Variant
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Price
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Calculated stock
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Limiting item
            </Text>
          </div>
          {(product.variants || []).map((variant) => {
            const availability = availabilityByVariantId.get(variant.id)

            return (
              <div
                key={variant.id}
                className="grid gap-3 border-b border-ui-border-base px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_140px_minmax(0,1fr)]"
              >
                <div className="flex flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    {variant.title || "Untitled variant"}
                  </Text>
                  <div className="flex min-w-0 items-center gap-x-1">
                    <Text
                      size="xsmall"
                      className="truncate text-ui-fg-subtle"
                      title={variant.sku || undefined}
                    >
                      {variant.sku || "SKU will be generated"}
                    </Text>
                    {variant.sku ? (
                      <Copy
                        content={variant.sku}
                        variant="mini"
                        className="shrink-0 text-ui-fg-muted"
                      />
                    ) : null}
                  </div>
                </div>
                <Text size="small">{formatVariantPrices(variant.prices)}</Text>
                <div className="flex items-center">
                  {!selectedStockLocationId ? (
                    <Text size="small" className="text-ui-fg-subtle">
                      —
                    </Text>
                  ) : availabilityQuery.isError ? (
                    <Text size="small" className="text-ui-fg-error">
                      Unavailable
                    </Text>
                  ) : availabilityQuery.isLoading ? (
                    <Text size="small" className="text-ui-fg-subtle">
                      Calculating…
                    </Text>
                  ) : availability?.status === "calculated" ? (
                    <Text size="small" weight="plus">
                      {availability.calculated_stock}
                    </Text>
                  ) : (
                    <Badge color="grey">No recipe</Badge>
                  )}
                </div>
                <Text size="small" className="text-ui-fg-subtle">
                  {selectedStockLocationId && !availabilityQuery.isError
                    ? availability?.limiting_components
                        .map((component) => component.inventory_item_title)
                        .join(", ") || "No limiting item"
                    : "—"}
                </Text>
              </div>
            )
          })}
        </div>
        {availabilityQuery.isError ? (
          <Text size="small" className="text-ui-fg-error">
            Calculated stock could not be loaded for this location.
          </Text>
        ) : null}
        {stockLocationsQuery.isError ? (
          <Text size="small" className="text-ui-fg-error">
            Stock locations could not be loaded.
          </Text>
        ) : null}
      </Container>

      <Container className="flex flex-col gap-y-4 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Text size="small" weight="plus">
            Inventory recipes
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            Add Product generates these links from the selected finished item,
            Inclusion supplies, and common packaging. You can review or revise
            them here before the variant appears on an order.
          </Text>
        </div>

        {!profiles.length ? (
          <Text size="small" className="text-ui-fg-warning">
            No component profiles are configured. Open the required Inventory
            items and configure Component and receiving before defining recipes.
          </Text>
        ) : null}

        {readiness.variants.map((variant) => {
          const rows = recipes[variant.id]
          const editing = Boolean(rows)
          const expanded = expandedRecipeIds.has(variant.id) || editing
          const componentCount = variant.recipe_components.length

          return (
            <div
              key={variant.id}
              className="overflow-hidden rounded-lg border border-ui-border-base"
            >
              <div className="flex items-center justify-between gap-x-4 px-4 py-3">
                <div className="flex min-w-0 flex-1 flex-col gap-y-1">
                  <div className="flex min-w-0 items-center gap-x-2">
                    <Text size="small" weight="plus" className="truncate">
                      {variant.title}
                    </Text>
                    <Badge color={variant.recipe_ready ? "green" : "orange"}>
                      {variant.recipe_ready ? "Ready" : "Required"}
                    </Badge>
                  </div>
                  <div className="flex min-w-0 items-center gap-x-1">
                    <Text size="xsmall" className="truncate text-ui-fg-subtle">
                      {componentCount} component
                      {componentCount === 1 ? "" : "s"} ·{" "}
                      {variant.manage_inventory
                        ? "Managed inventory"
                        : "Inventory not managed"}{" "}
                      · {variant.sku || "No SKU"}
                    </Text>
                    {variant.sku ? (
                      <Copy
                        content={variant.sku}
                        variant="mini"
                        className="shrink-0 text-ui-fg-muted"
                      />
                    ) : null}
                  </div>
                </div>
                <Button
                  size="small"
                  variant="transparent"
                  onClick={() => toggleRecipe(variant.id)}
                  disabled={editing}
                >
                  {expanded ? "Hide" : "View"}
                  {expanded ? <ChevronUpMini /> : <ChevronDownMini />}
                </Button>
              </div>

              {expanded && !editing ? (
                <div className="flex flex-col gap-y-3 border-t border-ui-border-base px-4 py-3">
                  {variant.recipe_components.length ? (
                    variant.recipe_components.map((component) => {
                      const profile = profileByInventoryId.get(
                        component.inventory_item_id,
                      )
                      const item = inventoryById.get(
                        component.inventory_item_id,
                      )
                      const displayAmount = profile
                        ? component.required_quantity /
                          profile.base_units_per_display_unit
                        : component.required_quantity

                      return (
                        <Text key={component.inventory_item_id} size="small">
                          {item?.title || component.inventory_item_id}:{" "}
                          {displayAmount}{" "}
                          {profile?.display_unit ||
                            profile?.base_unit ||
                            "base units"}
                        </Text>
                      )
                    })
                  ) : (
                    <Text size="small" className="text-ui-fg-subtle">
                      No active native inventory-kit links.
                    </Text>
                  )}
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={!variant.manage_inventory || !profiles.length}
                    onClick={() => {
                      setExpandedRecipeIds((current) =>
                        new Set(current).add(variant.id),
                      )
                      setRecipes((current) => ({
                        ...current,
                        [variant.id]: seedRecipeRows(variant.id),
                      }))
                    }}
                  >
                    {variant.recipe_components.length
                      ? "Edit recipe"
                      : "Add recipe"}
                  </Button>
                </div>
              ) : editing ? (
                <div className="flex flex-col gap-y-4 border-t border-ui-border-base px-4 py-3">
                  {rows.map((row, index) => {
                    const selectedProfile = profileByInventoryId.get(
                      row.inventoryItemId,
                    )

                    return (
                      <div
                        key={`${variant.id}-${index}`}
                        className="grid gap-3 rounded-lg border border-ui-border-base p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,220px)_auto]"
                      >
                        <div className="flex flex-col gap-y-2">
                          <Label>Component inventory item</Label>
                          <Select
                            value={row.inventoryItemId || undefined}
                            onValueChange={(inventoryItemId) =>
                              updateRecipe(variant.id, index, {
                                inventoryItemId,
                                requiredDisplayAmount: "",
                              })
                            }
                          >
                            <Select.Trigger>
                              <Select.Value placeholder="Select configured component" />
                            </Select.Trigger>
                            <Select.Content>
                              {profiles.map((profile) => (
                                <Select.Item
                                  key={profile.inventory_item_id}
                                  value={profile.inventory_item_id}
                                >
                                  {inventoryById.get(profile.inventory_item_id)
                                    ?.title || profile.inventory_item_id}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-y-2">
                          <Label>
                            Required amount
                            {selectedProfile
                              ? ` (${selectedProfile.display_unit})`
                              : ""}
                          </Label>
                          <Input
                            inputMode="decimal"
                            value={row.requiredDisplayAmount}
                            onChange={(event) =>
                              updateRecipe(variant.id, index, {
                                requiredDisplayAmount: event.target.value,
                              })
                            }
                          />
                        </div>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() =>
                            setRecipes((current) => ({
                              ...current,
                              [variant.id]: (current[variant.id] || []).filter(
                                (_item, rowIndex) => rowIndex !== index,
                              ),
                            }))
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    )
                  })}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() =>
                        setRecipes((current) => ({
                          ...current,
                          [variant.id]: [
                            ...(current[variant.id] || []),
                            {
                              inventoryItemId: "",
                              requiredDisplayAmount: "",
                            },
                          ],
                        }))
                      }
                    >
                      Add component
                    </Button>
                    <Button
                      size="small"
                      isLoading={recipeMutation.isPending}
                      onClick={() =>
                        recipeMutation.mutate({ variantId: variant.id, rows })
                      }
                    >
                      Save recipe
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() =>
                        setRecipes((current) => {
                          const next = { ...current }
                          delete next[variant.id]
                          return next
                        })
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </Container>

      <div className="grid gap-4 lg:grid-cols-2">
        <Container className="flex items-center justify-between gap-x-4 px-6 py-4">
          <div className="flex min-w-0 flex-col gap-y-1">
            <Text size="small" weight="plus">
              Publication readiness
            </Text>
            <Text size="small" className="truncate text-ui-fg-subtle">
              {readiness.ready
                ? "All configured checks pass."
                : `${readiness.blockers.length} issue${readiness.blockers.length === 1 ? "" : "s"} must be resolved.`}
            </Text>
          </div>
          <div className="flex shrink-0 items-center gap-x-2">
            <Badge color={readiness.ready ? "green" : "orange"}>
              {readiness.ready ? "Ready" : "Needs attention"}
            </Badge>
            <Button
              size="small"
              variant="secondary"
              onClick={() => setPublicationDrawerOpen(true)}
            >
              Manage
            </Button>
          </div>
        </Container>

        <Container className="flex items-center justify-between gap-x-4 px-6 py-4">
          <div className="flex min-w-0 flex-col gap-y-1">
            <Text size="small" weight="plus">
              Advanced operations
            </Text>
            <Text size="small" className="truncate text-ui-fg-subtle">
              Classification changes and immutable audit records.
            </Text>
          </div>
          <div className="flex shrink-0 gap-x-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setClassificationDrawerOpen(true)}
            >
              Classification
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => setAuditDrawerOpen(true)}
            >
              Audit history
            </Button>
          </div>
        </Container>
      </div>

      <Drawer
        open={publicationDrawerOpen}
        onOpenChange={setPublicationDrawerOpen}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Publication readiness</Drawer.Title>
            <Drawer.Description>
              Review blockers and record a reason before changing publication.
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex flex-1 flex-col gap-y-4 overflow-auto p-6">
            <div className="flex items-center justify-between gap-x-4">
              <Text size="small" className="text-ui-fg-subtle">
                Policy revision:{" "}
                {readiness.registration.readiness_policy_revision}
              </Text>
              <Badge color={readiness.ready ? "green" : "orange"}>
                {readiness.ready
                  ? "Ready"
                  : `${readiness.blockers.length} blocker${readiness.blockers.length === 1 ? "" : "s"}`}
              </Badge>
            </div>
            {readiness.blockers.length ? (
              <div className="flex flex-col gap-y-2 rounded-lg border border-ui-border-base p-4">
                {readiness.blockers.map((blocker) => (
                  <Text key={blocker} size="small">
                    • {blockerLabels[blocker]}
                  </Text>
                ))}
              </div>
            ) : (
              <Text size="small">
                All configured readiness checks currently pass.
              </Text>
            )}
            <div className="flex flex-col gap-y-2">
              <Label>Publication decision reason</Label>
              <Input
                value={publicationReason}
                onChange={(event) => setPublicationReason(event.target.value)}
                placeholder="Record why this product is being published or withdrawn"
              />
              {!publicationReasonValid ? (
                <Text size="small" className="text-ui-fg-subtle">
                  Enter a reason of at least 3 characters.
                </Text>
              ) : null}
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button
              variant="secondary"
              onClick={() => setPublicationDrawerOpen(false)}
            >
              Cancel
            </Button>
            {readiness.registration.state === "published" ? (
              <Button
                disabled={!publicationReasonValid}
                isLoading={publicationMutation.isPending}
                onClick={() => publicationMutation.mutate("withdraw")}
              >
                Withdraw product
              </Button>
            ) : (
              <Button
                disabled={!readiness.ready || !publicationReasonValid}
                isLoading={publicationMutation.isPending}
                onClick={() => publicationMutation.mutate("publish")}
              >
                Publish governed product
              </Button>
            )}
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      <Drawer
        open={classificationDrawerOpen}
        onOpenChange={setClassificationDrawerOpen}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Governance and classification</Drawer.Title>
            <Drawer.Description>
              Advanced, irreversible-boundary operations for the native product.
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex flex-1 flex-col gap-y-4 overflow-auto p-6">
            <Text size="small" className="text-ui-fg-subtle">
              Published or ordered products cannot be reclassified and cannot
              have governance removed.
            </Text>
            <div className="flex flex-col gap-y-2">
              <Label>Action</Label>
              <Select
                value={classificationAction}
                onValueChange={(value) => {
                  setClassificationAction(
                    value as "reclassify" | "remove_governance",
                  )
                  setClassificationImpact(null)
                }}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="reclassify">
                    Move to another governed type
                  </Select.Item>
                  <Select.Item value="remove_governance">
                    Move to a standard type and remove governance
                  </Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>Target product type</Label>
              <Select
                value={targetProductTypeId || undefined}
                onValueChange={(value) => {
                  setTargetProductTypeId(value)
                  setClassificationImpact(null)
                }}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select target product type" />
                </Select.Trigger>
                <Select.Content>
                  {(productTypesQuery.data?.product_types || []).map((type) => (
                    <Select.Item key={type.id} value={type.id}>
                      {type.value}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <Button
              size="small"
              variant="secondary"
              disabled={!targetProductTypeId}
              isLoading={classificationImpactMutation.isPending}
              onClick={() => classificationImpactMutation.mutate()}
            >
              Preview classification impact
            </Button>
            {classificationImpact ? (
              <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
                <div className="flex items-center justify-between gap-x-4">
                  <Text size="small" weight="plus">
                    Impact review
                  </Text>
                  <Badge
                    color={classificationImpact.allowed ? "green" : "orange"}
                  >
                    {classificationImpact.allowed ? "Allowed" : "Blocked"}
                  </Badge>
                </div>
                <Text size="small">
                  {classificationImpact.variant_count} variant
                  {classificationImpact.variant_count === 1 ? "" : "s"} ·{" "}
                  {classificationImpact.order_line_item_count} historical order
                  line
                  {classificationImpact.order_line_item_count === 1 ? "" : "s"}
                </Text>
                {classificationImpact.blockers.map((blocker) => (
                  <Text
                    key={blocker}
                    size="small"
                    className="text-ui-fg-warning"
                  >
                    • {classificationBlockerLabels[blocker]}
                  </Text>
                ))}
                {classificationImpact.allowed ? (
                  <div className="flex flex-col gap-y-2 border-t border-ui-border-base pt-3">
                    <Label>Decision reason</Label>
                    <Input
                      value={classificationReason}
                      onChange={(event) =>
                        setClassificationReason(event.target.value)
                      }
                      placeholder="Record why this classification change is required"
                    />
                    <Button
                      size="small"
                      disabled={classificationReason.trim().length < 3}
                      isLoading={classificationChangeMutation.isPending}
                      onClick={() => classificationChangeMutation.mutate()}
                    >
                      Confirm reviewed classification change
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Drawer.Body>
          <Drawer.Footer>
            <Button
              variant="secondary"
              onClick={() => setClassificationDrawerOpen(false)}
            >
              Close
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      <Drawer open={auditDrawerOpen} onOpenChange={setAuditDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Governance audit history</Drawer.Title>
            <Drawer.Description>
              Immutable product decisions. Historical events can reference
              fields that are no longer part of current product creation.
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex flex-1 flex-col gap-y-3 overflow-auto p-6">
            {auditQuery.isLoading ? (
              <div className="flex min-h-40 items-center justify-center">
                <Spinner />
              </div>
            ) : auditQuery.isError ? (
              <Text size="small" className="text-ui-fg-error">
                Governance audit history could not be loaded.
              </Text>
            ) : auditQuery.data?.audit_events.length ? (
              auditQuery.data.audit_events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between gap-x-4 rounded-lg border border-ui-border-base p-3"
                >
                  <div className="flex min-w-0 flex-col gap-y-1">
                    <Text size="small" weight="plus">
                      {event.event_type.replaceAll("_", " ")}
                    </Text>
                    <Text size="xsmall" className="truncate text-ui-fg-subtle">
                      {new Date(event.created_at).toLocaleString()} · actor{" "}
                      {event.actor_id}
                    </Text>
                  </div>
                  <Badge
                    color={event.outcome === "succeeded" ? "green" : "red"}
                  >
                    {event.outcome}
                  </Badge>
                </div>
              ))
            ) : (
              <Text size="small" className="text-ui-fg-subtle">
                No product-scoped governance events have been recorded yet.
              </Text>
            )}
          </Drawer.Body>
          <Drawer.Footer>
            <Button
              variant="secondary"
              onClick={() => setAuditDrawerOpen(false)}
            >
              Close
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

export default CompoundedProductReadinessPage
