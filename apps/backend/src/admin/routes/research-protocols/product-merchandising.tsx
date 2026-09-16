/**
 * @file    apps/backend/src/admin/routes/research-protocols/product-merchandising.tsx
 * @module  ProductMerchandising
 * @purpose Protocol product upsell and merchandising recommendation drawer and list.
 * @contracts
 *   API:     GET/POST /admin/research-protocols/:id/merchandising
 *   Service: ResearchTrackingModuleService · ProductModuleService
 */

import type { HttpTypes } from "@medusajs/framework/types"
import {
  Badge,
  Button,
  Checkbox,
  Drawer,
  Input,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { SovereignEmptyState } from "../../components/ui/sovereign-empty-state"
import { sdk } from "../../lib/sdk"
import type {
  ResearchProtocolMerchandisingLink,
  ResearchProtocolMerchandisingResponse,
} from "../compounded-products/research-protocol-types"

type Props = { protocolId: string }

const relationshipTypes = [
  ["required", "Required item"],
  ["optional", "Optional add-on"],
  ["frequently_added", "Frequently added"],
  ["bundle", "Bundle"],
  ["refill", "Refill"],
  ["replacement", "Replacement"],
  ["alternative", "Alternative"],
  ["upgrade", "Upgrade"],
  ["cross_sell", "Cross-sell"],
  ["reorder", "Reorder"],
] as const

const placements = [
  ["protocol", "Protocol page"],
  ["my_protocols", "My Protocols"],
  ["start_tracking", "Start tracking"],
  ["dashboard", "Customer dashboard"],
  ["today", "Today dashboard"],
  ["calendar", "Calendar activity"],
  ["replenishment", "Replenishment card"],
  ["after_activity", "After activity completion"],
  ["order_confirmation", "Order confirmation"],
  ["order_details", "Order details"],
  ["cart", "Cart"],
  ["product_page", "Product page"],
] as const

const emptyForm = {
  relationship_type: "optional",
  placements: ["protocol", "my_protocols"],
  priority: "100",
  status: "active",
  heading: "",
  reason: "",
  quick_add_enabled: true,
  hide_after_purchase: false,
  bundle_reference: "",
  promotion_reference: "",
  starts_at: "",
  ends_at: "",
}

const messageFromError = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

export const ProductMerchandising = ({ protocolId }: Props) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<HttpTypes.AdminProduct | null>(null)
  const [variantIds, setVariantIds] = useState<string[]>([])
  const [editing, setEditing] = useState<ResearchProtocolMerchandisingLink | null>(null)
  const [form, setForm] = useState(emptyForm)
  const linksQuery = useQuery({
    queryKey: ["research-protocol-merchandising", protocolId],
    queryFn: () =>
      sdk.client.fetch<ResearchProtocolMerchandisingResponse>(
        `/admin/research-protocols/${protocolId}/merchandising`,
      ),
  })
  const productsQuery = useQuery({
    queryKey: ["research-protocol-merchandising-products", search],
    enabled: open && !selected,
    queryFn: () =>
      sdk.admin.product.list({
        limit: 20,
        q: search || undefined,
        fields: "id,title,status,thumbnail,variants.id,variants.title",
      }),
    placeholderData: keepPreviousData,
  })
  const selectedIds = useMemo(
    () =>
      new Set(
        (linksQuery.data?.merchandising_links || []).map(
          (link) => `${link.product_id}:${link.relationship_type}`,
        ),
      ),
    [linksQuery.data?.merchandising_links],
  )
  const body = () => ({
    product_variant_ids: variantIds,
    relationship_type: form.relationship_type,
    placements: form.placements,
    priority: Number(form.priority || 100),
    status: form.status,
    heading: form.heading.trim() || null,
    reason: form.reason.trim(),
    quick_add_enabled: form.quick_add_enabled,
    hide_after_purchase: form.hide_after_purchase,
    bundle_reference: form.bundle_reference.trim() || null,
    promotion_reference: form.promotion_reference.trim() || null,
    starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
    ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
  })
  const saveMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("Choose a product")
      if (form.reason.trim().length < 3) {
        throw new Error("Explain why this product is relevant")
      }
      if (!form.placements.length) throw new Error("Choose at least one placement")
      return editing
        ? sdk.client.fetch(
            `/admin/research-protocols/${protocolId}/merchandising/${editing.id}`,
            { method: "POST", body: body() },
          )
        : sdk.client.fetch(
            `/admin/research-protocols/${protocolId}/merchandising`,
            {
              method: "POST",
              body: { ...body(), product_id: selected.id },
            },
          )
    },
    onSuccess: async () => {
      toast.success(editing ? "Recommendation updated" : "Recommendation added")
      await queryClient.invalidateQueries({
        queryKey: ["research-protocol-merchandising", protocolId],
      })
      setOpen(false)
    },
    onError: (error) =>
      toast.error(messageFromError(error, "Recommendation could not be saved")),
  })
  const archiveMutation = useMutation({
    mutationFn: (link: ResearchProtocolMerchandisingLink) =>
      sdk.client.fetch(
        `/admin/research-protocols/${protocolId}/merchandising/${link.id}`,
        {
          method: "DELETE",
          body: { reason: "Removed from customer recommendations" },
        },
      ),
    onSuccess: async () => {
      toast.success("Recommendation removed")
      await queryClient.invalidateQueries({
        queryKey: ["research-protocol-merchandising", protocolId],
      })
    },
    onError: (error) =>
      toast.error(messageFromError(error, "Recommendation could not be removed")),
  })
  const startAdd = () => {
    setEditing(null)
    setSelected(null)
    setVariantIds([])
    setForm(emptyForm)
    setSearch("")
    setOpen(true)
  }
  const startEdit = (link: ResearchProtocolMerchandisingLink) => {
    setEditing(link)
    setSelected(link.product as HttpTypes.AdminProduct)
    setVariantIds(link.product_variant_ids || [])
    setForm({
      relationship_type: link.relationship_type,
      placements: link.placements,
      priority: String(link.priority),
      status: link.status,
      heading: link.heading || "",
      reason: link.reason,
      quick_add_enabled: link.quick_add_enabled,
      hide_after_purchase: link.hide_after_purchase,
      bundle_reference: link.bundle_reference || "",
      promotion_reference: link.promotion_reference || "",
      starts_at: link.starts_at?.slice(0, 16) || "",
      ends_at: link.ends_at?.slice(0, 16) || "",
    })
    setOpen(true)
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-1">
          <Text size="small" leading="compact" weight="plus">
            Product merchandising
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Choose products customers may see with this guide. This does not
            change protocol compatibility or inventory.
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={startAdd}>
          Add recommendation
        </Button>
      </div>
      {linksQuery.data?.merchandising_links.length ? (
        linksQuery.data.merchandising_links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between gap-x-3 rounded-lg border border-ui-border-base p-3"
          >
            <div className="flex min-w-0 flex-col gap-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Text size="small" weight="plus">
                  {link.product?.title || "Recommended product"}
                </Text>
                <Badge color={link.status === "active" ? "green" : "grey"}>
                  {link.status}
                </Badge>
              </div>
              <Text size="small" className="text-ui-fg-subtle">
                {relationshipTypes.find(([key]) => key === link.relationship_type)?.[1] || link.relationship_type}
                {` · ${link.placements.length} placement${link.placements.length === 1 ? "" : "s"} · Priority ${link.priority}`}
              </Text>
              <Text size="small" leading="compact">
                {link.reason}
              </Text>
            </div>
            <div className="flex gap-x-2">
              <Button size="small" variant="secondary" onClick={() => startEdit(link)}>
                Edit
              </Button>
              <Button
                size="small"
                variant="danger"
                isLoading={archiveMutation.isPending}
                onClick={() => archiveMutation.mutate(link)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))
      ) : (
        <SovereignEmptyState
          heading="No recommendations configured"
          description="Customers will not see an upsell from this guide until one is added."
        />
      )}

      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content className="w-full sm:max-w-[620px] h-dvh sm:h-full flex flex-col justify-between">
          <Drawer.Header>
            <Drawer.Title>
              {editing ? "Edit product recommendation" : "Add product recommendation"}
            </Drawer.Title>
            <Drawer.Description>
              Configure one customer-facing recommendation without changing the
              research guide’s product applicability.
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex flex-1 flex-col gap-y-4 overflow-y-auto p-4 sm:p-6">
            {!selected ? (
              <>
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products"
                />
                {productsQuery.data?.products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelected(product)}
                    className="flex items-center justify-between rounded-lg border border-ui-border-base p-3 text-left"
                  >
                    <div>
                      <Text size="small" weight="plus">{product.title}</Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        {product.status} · {product.variants?.length || 0} variants
                      </Text>
                    </div>
                    <Text size="small" className="text-ui-fg-interactive">
                      Select
                    </Text>
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="rounded-lg border border-ui-border-base p-3">
                  <Text size="small" weight="plus">{selected.title}</Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {selected.status} · {selected.variants?.length || 0} variants
                  </Text>
                </div>
                <label className="flex flex-col gap-y-2">
                  <Text size="small" weight="plus">Recommendation type</Text>
                  <Select
                    value={form.relationship_type}
                    onValueChange={(value) => setForm({ ...form, relationship_type: value })}
                  >
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      {relationshipTypes.map(([value, label]) => (
                        <Select.Item
                          key={value}
                          value={value}
                          disabled={
                            !editing && selectedIds.has(`${selected.id}:${value}`)
                          }
                        >
                          {label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </label>
                <label className="flex flex-col gap-y-2">
                  <Text size="small" weight="plus">Customer-facing reason</Text>
                  <Textarea
                    value={form.reason}
                    onChange={(event) => setForm({ ...form, reason: event.target.value })}
                    placeholder="Why this item may be useful with the protocol"
                  />
                </label>
                <label className="flex flex-col gap-y-2">
                  <Text size="small" weight="plus">Optional section heading</Text>
                  <Input
                    value={form.heading}
                    onChange={(event) => setForm({ ...form, heading: event.target.value })}
                    placeholder="You may also need"
                  />
                </label>
                <div className="flex flex-col gap-y-2">
                  <Text size="small" weight="plus">Show in</Text>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {placements.map(([value, label]) => (
                      <label
                        key={value}
                        className="flex items-center gap-x-2 rounded-lg border border-ui-border-base p-3"
                      >
                        <Checkbox
                          checked={form.placements.includes(value)}
                          onCheckedChange={(checked) =>
                            setForm({
                              ...form,
                              placements:
                                checked === true
                                  ? [...form.placements, value]
                                  : form.placements.filter((item) => item !== value),
                            })
                          }
                        />
                        <Text size="small">{label}</Text>
                      </label>
                    ))}
                  </div>
                </div>
                {(selected.variants || []).length > 1 ? (
                  <div className="flex flex-col gap-y-2">
                    <Text size="small" weight="plus">
                      Limit quick-add to variants (optional)
                    </Text>
                    {(selected.variants || []).map((variant) => (
                      <label key={variant.id} className="flex items-center gap-x-2">
                        <Checkbox
                          checked={variantIds.includes(variant.id)}
                          onCheckedChange={(checked) =>
                            setVariantIds(
                              checked === true
                                ? [...variantIds, variant.id]
                                : variantIds.filter((id) => id !== variant.id),
                            )
                          }
                        />
                        <Text size="small">{variant.title}</Text>
                      </label>
                    ))}
                  </div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-y-2">
                    <Text size="small" weight="plus">Priority</Text>
                    <Input
                      type="number"
                      value={form.priority}
                      onChange={(event) => setForm({ ...form, priority: event.target.value })}
                    />
                  </label>
                  <label className="flex flex-col gap-y-2">
                    <Text size="small" weight="plus">Status</Text>
                    <Select
                      value={form.status}
                      onValueChange={(value) => setForm({ ...form, status: value })}
                    >
                      <Select.Trigger><Select.Value /></Select.Trigger>
                      <Select.Content>
                        <Select.Item value="active">Active</Select.Item>
                        <Select.Item value="paused">Paused</Select.Item>
                      </Select.Content>
                    </Select>
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-x-2 rounded-lg border border-ui-border-base p-3">
                    <Checkbox
                      checked={form.quick_add_enabled}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, quick_add_enabled: checked === true })
                      }
                    />
                    <Text size="small">Allow quick add</Text>
                  </label>
                  <label className="flex items-center gap-x-2 rounded-lg border border-ui-border-base p-3">
                    <Checkbox
                      checked={form.hide_after_purchase}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, hide_after_purchase: checked === true })
                      }
                    />
                    <Text size="small">Hide after purchase</Text>
                  </label>
                </div>
                <details className="rounded-lg border border-ui-border-base p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Timing and campaign references
                  </summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Input
                      type="datetime-local"
                      value={form.starts_at}
                      onChange={(event) => setForm({ ...form, starts_at: event.target.value })}
                    />
                    <Input
                      type="datetime-local"
                      value={form.ends_at}
                      onChange={(event) => setForm({ ...form, ends_at: event.target.value })}
                    />
                    <Input
                      value={form.bundle_reference}
                      onChange={(event) => setForm({ ...form, bundle_reference: event.target.value })}
                      placeholder="Bundle reference"
                    />
                    <Input
                      value={form.promotion_reference}
                      onChange={(event) => setForm({ ...form, promotion_reference: event.target.value })}
                      placeholder="Promotion reference"
                    />
                  </div>
                </details>
              </>
            )}
          </Drawer.Body>
          <Drawer.Footer className="px-4 sm:px-6 py-3 sm:py-4 pb-[env(safe-area-inset-bottom,1rem)] border-t border-ui-border-base">
            <div className="flex justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button size="small" variant="secondary">Cancel</Button>
              </Drawer.Close>
              {selected ? (
                <Button
                  size="small"
                  isLoading={saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                >
                  Save recommendation
                </Button>
              ) : null}
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}
