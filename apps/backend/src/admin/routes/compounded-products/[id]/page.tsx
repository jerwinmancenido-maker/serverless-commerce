import { Spinner } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
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
} from "../types"

type RecipeRow = {
  inventoryItemId: string
  requiredDisplayAmount: string
}

const blockerLabels: Record<ProductReadinessResponse["blockers"][number], string> = {
  registration_missing: "Governed registration is missing",
  configuration_revision_inactive: "Pinned configuration is no longer active",
  variant_matrix_empty: "The product has no variants",
  price_missing: "One or more variants have no price",
  sales_channel_missing: "No sales channel is assigned",
  bom_recipe_missing: "One or more managed-inventory variants need a BOM recipe",
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
  const [publicationReason, setPublicationReason] = useState("")
  const [classificationAction, setClassificationAction] = useState<
    "reclassify" | "remove_governance"
  >("reclassify")
  const [targetProductTypeId, setTargetProductTypeId] = useState("")
  const [classificationReason, setClassificationReason] = useState("")
  const [classificationImpact, setClassificationImpact] =
    useState<ClassificationImpact | null>(null)
  const publicationReasonValid = publicationReason.trim().length >= 3

  const productQuery = useQuery({
    queryKey: ["compounded-product-native-product", id],
    enabled: Boolean(id),
    queryFn: () =>
      sdk.admin.product.retrieve(id, {
        fields: "+variants.id,+variants.sku,+variants.title,+variants.manage_inventory",
      }),
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
    enabled: Boolean(id),
    queryFn: () =>
      sdk.client.fetch<GovernanceAuditEventsResponse>(
        `/admin/compounded-product/products/${id}/audit-events`,
      ),
  })
  const inventoryById = useMemo(
    () =>
      new Map(
        (inventoryQuery.data || []).map((item) => [item.id, item]),
      ),
    [inventoryQuery.data],
  )
  const profiles = profilesQuery.data?.component_profiles || []
  const profileByInventoryId = useMemo(
    () => new Map(profiles.map((profile) => [profile.inventory_item_id, profile])),
    [profiles],
  )

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
          throw new Error("Every component requires an inventory item and amount")
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
    auditQuery.isLoading
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
    auditQuery.isError ||
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
          ? String(component.required_quantity / profile.base_units_per_display_unit)
          : String(component.required_quantity),
      }
    })
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="flex items-start justify-between gap-x-4 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Heading>{product.title}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Configure native inventory-kit recipes and review publication
            blockers before using the governed publish or withdrawal controls.
          </Text>
        </div>
        <Button asChild size="small" variant="secondary">
          <Link to={`/products/${product.id}`}>Open native product</Link>
        </Button>
      </Container>

      <Container className="flex flex-col gap-y-5 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Text size="small" weight="plus">
            5. BOM recipes
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            Components are inventory items with an approved BOM profile. Enter
            quantities in each profile&apos;s display unit; the server converts
            them to integer ledger units.
          </Text>
        </div>

        {!profiles.length ? (
          <Text size="small" className="text-ui-fg-warning">
            No component profiles are configured. Add them in BOM Inventory
            before defining recipes.
          </Text>
        ) : null}

        {readiness.variants.map((variant) => {
          const rows = recipes[variant.id]
          const editing = Boolean(rows)

          return (
            <div
              key={variant.id}
              className="flex flex-col gap-y-4 rounded-lg border border-ui-border-base p-4"
            >
              <div className="flex items-start justify-between gap-x-4">
                <div className="flex flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    {variant.title}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {variant.sku || "No SKU"} · {variant.manage_inventory ? "Managed inventory" : "Inventory not managed"}
                  </Text>
                </div>
                <Badge color={variant.recipe_ready ? "green" : "orange"}>
                  {variant.recipe_ready ? "Recipe ready" : "Recipe required"}
                </Badge>
              </div>

              {!editing ? (
                <div className="flex flex-col gap-y-3">
                  {variant.recipe_components.length ? (
                    variant.recipe_components.map((component) => {
                      const profile = profileByInventoryId.get(
                        component.inventory_item_id,
                      )
                      const item = inventoryById.get(component.inventory_item_id)
                      const displayAmount = profile
                        ? component.required_quantity /
                          profile.base_units_per_display_unit
                        : component.required_quantity

                      return (
                        <Text key={component.inventory_item_id} size="small">
                          {item?.title || component.inventory_item_id}: {displayAmount}{" "}
                          {profile?.display_unit || profile?.base_unit || "base units"}
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
                    onClick={() =>
                      setRecipes((current) => ({
                        ...current,
                        [variant.id]: seedRecipeRows(variant.id),
                      }))
                    }
                  >
                    {variant.recipe_components.length ? "Edit recipe" : "Add recipe"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-y-4">
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
                                  {inventoryById.get(profile.inventory_item_id)?.title ||
                                    profile.inventory_item_id}
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
              )}
            </div>
          )
        })}
      </Container>

      <Container className="flex flex-col gap-y-4 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Text size="small" weight="plus">
            6. Governed classification
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            Preview the irreversible-boundary checks before changing the native
            product type. Published or ordered products cannot be reclassified
            and cannot have governance removed.
          </Text>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
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
              <Badge color={classificationImpact.allowed ? "green" : "orange"}>
                {classificationImpact.allowed ? "Allowed" : "Blocked"}
              </Badge>
            </div>
            <Text size="small">
              {classificationImpact.variant_count} variant
              {classificationImpact.variant_count === 1 ? "" : "s"} ·{" "}
              {classificationImpact.order_line_item_count} historical order line
              {classificationImpact.order_line_item_count === 1 ? "" : "s"}
            </Text>
            {classificationImpact.blockers.map((blocker) => (
              <Text key={blocker} size="small" className="text-ui-fg-warning">
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
      </Container>

      <Container className="flex flex-col gap-y-4 px-6 py-4">
        <div className="flex items-start justify-between gap-x-4">
          <div className="flex flex-col gap-y-1">
            <Text size="small" weight="plus">
              7. Publication readiness
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              Policy revision: {readiness.registration.readiness_policy_revision}
            </Text>
          </div>
          <Badge color={readiness.ready ? "green" : "orange"}>
            {readiness.ready ? "Ready" : `${readiness.blockers.length} blocker${readiness.blockers.length === 1 ? "" : "s"}`}
          </Badge>
        </div>
        {readiness.blockers.length ? (
          <div className="flex flex-col gap-y-2">
            {readiness.blockers.map((blocker) => (
              <Text key={blocker} size="small">
                • {blockerLabels[blocker]}
              </Text>
            ))}
          </div>
        ) : (
          <Text size="small">
            All configured readiness checks currently pass. Publication remains
            a separate permissioned mutation.
          </Text>
        )}
        <div className="flex flex-col gap-y-2 border-t border-ui-border-base pt-4">
          <Label>Publication decision reason</Label>
          <Input
            value={publicationReason}
            onChange={(event) => setPublicationReason(event.target.value)}
            placeholder="Record why this product is being published or withdrawn"
          />
          <div className="flex flex-wrap gap-2">
            {readiness.registration.state === "published" ? (
              <Button
                size="small"
                variant="secondary"
                disabled={!publicationReasonValid}
                isLoading={publicationMutation.isPending}
                onClick={() => publicationMutation.mutate("withdraw")}
              >
                Withdraw product
              </Button>
            ) : (
              <Button
                size="small"
                disabled={!readiness.ready || !publicationReasonValid}
                isLoading={publicationMutation.isPending}
                onClick={() => publicationMutation.mutate("publish")}
              >
                Publish governed product
              </Button>
            )}
          </div>
          {!readiness.ready && readiness.registration.state !== "published" ? (
            <Text size="small" className="text-ui-fg-subtle">
              Publication stays disabled until every readiness blocker is
              resolved. Rejected API attempts are still recorded in the audit
              ledger.
            </Text>
          ) : null}
          {!publicationReasonValid ? (
            <Text size="small" className="text-ui-fg-subtle">
              Enter a reason of at least 3 characters to enable this action.
            </Text>
          ) : null}
        </div>
      </Container>

      <Container className="flex flex-col gap-y-4 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Text size="small" weight="plus">
            8. Governance audit history
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            Immutable decisions recorded for this governed product.
          </Text>
        </div>
        {auditQuery.data?.audit_events.length ? (
          <div className="flex flex-col gap-y-2">
            {auditQuery.data.audit_events.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-x-4 rounded-lg border border-ui-border-base p-3"
              >
                <div className="flex flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    {event.event_type.replaceAll("_", " ")}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {new Date(event.created_at).toLocaleString()} · actor {event.actor_id}
                  </Text>
                </div>
                <Badge color={event.outcome === "succeeded" ? "green" : "red"}>
                  {event.outcome}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <Text size="small" className="text-ui-fg-subtle">
            No product-scoped governance events have been recorded yet.
          </Text>
        )}
      </Container>
    </div>
  )
}

export default CompoundedProductReadinessPage
