import type { HttpTypes } from "@medusajs/framework/types"
import { Button, Checkbox, Drawer, Input, Select, Text, toast } from "@medusajs/ui"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"
import type {
  ResearchProtocolApplicability,
  ResearchProtocolProductLink,
  ResearchProtocolProductsResponse,
} from "../compounded-products/research-protocol-types"

type Props = { protocolId: string }

const messageFromError = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

export const CompatibleProducts = ({ protocolId }: Props) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<HttpTypes.AdminProduct | null>(null)
  const [editingLink, setEditingLink] = useState<ResearchProtocolProductLink | null>(null)
  const [scope, setScope] = useState<ResearchProtocolApplicability>("entire_product")
  const [variantIds, setVariantIds] = useState<string[]>([])
  const [isPrimary, setIsPrimary] = useState(false)
  const linksQuery = useQuery({
    queryKey: ["research-protocol-products", protocolId],
    queryFn: () => sdk.client.fetch<ResearchProtocolProductsResponse>(`/admin/research-protocols/${protocolId}/products`),
  })
  const productsQuery = useQuery({
    queryKey: ["research-protocol-product-search", search],
    enabled: open && !selected,
    queryFn: () => sdk.admin.product.list({ limit: 20, q: search || undefined, fields: "id,title,status,variants.id,variants.title" }),
    placeholderData: keepPreviousData,
  })
  const linkedProductIds = useMemo(() => new Set((linksQuery.data?.product_links || []).map((link) => link.product_id)), [linksQuery.data?.product_links])
  const saveMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("Choose a product")
      const body = { applicability_scope: scope, variant_ids: scope === "entire_product" ? [] : variantIds, is_primary: isPrimary }
      return editingLink
        ? sdk.client.fetch(`/admin/research-protocols/${protocolId}/products/${editingLink.id}`, { method: "POST", body })
        : sdk.client.fetch(`/admin/research-protocols/${protocolId}/products`, { method: "POST", body: { ...body, product_id: selected.id } })
    },
    onSuccess: async () => {
      toast.success(editingLink ? "Compatible product updated" : "Compatible product linked")
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["research-protocol-products", protocolId] }),
        queryClient.invalidateQueries({ queryKey: ["research-protocol", protocolId] }),
        queryClient.invalidateQueries({ queryKey: ["research-protocols"] }),
      ])
      setOpen(false)
      setSelected(null)
      setEditingLink(null)
    },
    onError: (error) => toast.error(messageFromError(error, "Compatible product could not be saved")),
  })
  const unlinkMutation = useMutation({
    mutationFn: (link: ResearchProtocolProductLink) => sdk.client.fetch(`/admin/research-protocols/${protocolId}/products/${link.id}`, {
      method: "DELETE",
      body: { reason: "Removed from compatible products", confirm_primary: link.is_primary },
    }),
    onSuccess: async () => {
      toast.success("Product unlinked. The research guide and its revisions were preserved.")
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["research-protocol-products", protocolId] }),
        queryClient.invalidateQueries({ queryKey: ["research-protocol", protocolId] }),
        queryClient.invalidateQueries({ queryKey: ["research-protocols"] }),
      ])
    },
    onError: (error) => toast.error(messageFromError(error, "Product could not be unlinked")),
  })
  const startAdd = () => {
    setSelected(null)
    setEditingLink(null)
    setScope("entire_product")
    setVariantIds([])
    setIsPrimary(false)
    setOpen(true)
  }
  const startEdit = (link: ResearchProtocolProductLink) => {
    setEditingLink(link)
    setSelected(link.product as HttpTypes.AdminProduct)
    setScope(link.applicability_scope)
    setVariantIds(link.variant_targets.map((target) => target.product_variant_id))
    setIsPrimary(link.is_primary)
    setOpen(true)
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-1">
          <Text size="small" leading="compact" weight="plus">Compatible products</Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">Link products only when this guide should be available from their product pages.</Text>
        </div>
        <Button size="small" variant="secondary" onClick={startAdd}>Link product</Button>
      </div>
      {linksQuery.data?.product_links.length ? linksQuery.data.product_links.map((link) => (
        <div key={link.id} className="flex items-center justify-between gap-x-4 rounded-lg border border-ui-border-base p-3">
          <div className="flex min-w-0 flex-col gap-y-1">
            <Text size="small" leading="compact" weight="plus">{link.product?.title || "Linked product"}</Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              {link.product?.product_format || "Product format not assigned"} · {link.applicability_scope === "entire_product" ? "All variants" : `${link.variant_targets.length} selected variants`}{link.is_primary ? " · Primary guide" : ""}
            </Text>
          </div>
          <div className="flex gap-x-2">
            <Button size="small" variant="secondary" onClick={() => startEdit(link)}>Edit</Button>
            <Button size="small" variant="danger" isLoading={unlinkMutation.isPending} onClick={() => {
              if (!link.is_primary || window.confirm("This is the product's primary research guide. Unlink it and preserve the guide?")) unlinkMutation.mutate(link)
            }}>Unlink</Button>
          </div>
        </div>
      )) : (
        <div className="rounded-lg border border-dashed border-ui-border-base p-4">
          <Text size="small" leading="compact" weight="plus">No products are linked yet.</Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">This guide can be completed and published independently.</Text>
        </div>
      )}

      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content className="w-full max-w-[600px]">
          <Drawer.Header>
            <Drawer.Title>{editingLink ? "Edit compatible product" : "Link compatible product"}</Drawer.Title>
            <Drawer.Description>Choose where this laboratory research guide applies.</Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto p-6">
            {!selected ? (
              <>
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" />
                {productsQuery.isLoading ? <Text size="small" className="text-ui-fg-subtle">Loading products…</Text> : productsQuery.data?.products.map((product) => (
                  <button key={product.id} type="button" disabled={linkedProductIds.has(product.id)} onClick={() => setSelected(product)} className="flex items-center justify-between rounded-lg border border-ui-border-base p-3 text-left disabled:opacity-50">
                    <div className="flex flex-col gap-y-1"><Text size="small" leading="compact" weight="plus">{product.title}</Text><Text size="small" leading="compact" className="text-ui-fg-subtle">{product.status} · {product.variants?.length || 0} variants</Text></div>
                    <Text size="small" className="text-ui-fg-interactive">{linkedProductIds.has(product.id) ? "Already linked" : "Select"}</Text>
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="rounded-lg border border-ui-border-base p-3"><Text size="small" leading="compact" weight="plus">{selected.title}</Text><Text size="small" leading="compact" className="text-ui-fg-subtle">{selected.status} · {selected.variants?.length || 0} variants</Text></div>
                <div className="flex flex-col gap-y-2"><Text size="small" leading="compact" weight="plus">Applies to</Text><Select value={scope} onValueChange={(value) => { setScope(value as ResearchProtocolApplicability); if (value === "entire_product") setVariantIds([]) }}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="entire_product">Entire product</Select.Item><Select.Item value="selected_variants">Selected variants</Select.Item></Select.Content></Select></div>
                {scope === "selected_variants" ? <div className="flex flex-col gap-y-2">{(selected.variants || []).map((variant) => <label key={variant.id} className="flex items-center gap-x-3 rounded-lg border border-ui-border-base p-3"><Checkbox checked={variantIds.includes(variant.id)} onCheckedChange={(checked) => setVariantIds(checked === true ? [...variantIds, variant.id] : variantIds.filter((id) => id !== variant.id))} /><Text size="small">{variant.title}</Text></label>)}</div> : null}
                <label className="flex items-center gap-x-3 rounded-lg border border-ui-border-base p-3"><Checkbox checked={isPrimary} onCheckedChange={(checked) => setIsPrimary(checked === true)} /><div><Text size="small" leading="compact" weight="plus">Primary guide for this product</Text><Text size="small" leading="compact" className="text-ui-fg-subtle">Only one active primary guide is allowed per product.</Text></div></label>
                <Text size="small" leading="compact" className="text-ui-fg-subtle">Affects {scope === "entire_product" ? selected.variants?.length || 0 : variantIds.length} product variant{(scope === "entire_product" ? selected.variants?.length || 0 : variantIds.length) === 1 ? "" : "s"}.</Text>
              </>
            )}
          </Drawer.Body>
          <Drawer.Footer><div className="flex items-center justify-end gap-x-2"><Drawer.Close asChild><Button size="small" variant="secondary">Cancel</Button></Drawer.Close>{selected ? <Button size="small" isLoading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Save link</Button> : null}</div></Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}
