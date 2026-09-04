import type { HttpTypes } from "@medusajs/types"
import {
  Button,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { sdk } from "../../../lib/sdk"
import { loadAllAdminPages } from "../../../lib/load-all-pages"
import ProductDescriptionEditor from "../product-description-editor"

export type CompoundFormat = {
  id: string
  key: string
  name: string
  status: "active" | "archived"
}

type CompoundedProductEditDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: HttpTypes.AdminProduct
  compoundFormatId: string | null
  compoundFormats: CompoundFormat[]
  onSuccess: () => void
}

const messageFromError = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

export const CompoundedProductEditDrawer = ({
  open,
  onOpenChange,
  product,
  compoundFormatId,
  compoundFormats,
  onSuccess,
}: CompoundedProductEditDrawerProps) => {
  const [title, setTitle] = useState(product.title || "")
  const [subtitle, setSubtitle] = useState(product.subtitle || "")
  const [formatId, setFormatId] = useState(compoundFormatId || "")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    (product.categories || []).map((c) => c.id),
  )
  const [description, setDescription] = useState(product.description || "")
  const [isSaving, setIsSaving] = useState(false)

  // Sync initial values when product or drawer opens
  useEffect(() => {
    if (open) {
      setTitle(product.title || "")
      setSubtitle(product.subtitle || "")
      setFormatId(compoundFormatId || "")
      setSelectedCategoryIds((product.categories || []).map((c) => c.id))
      setDescription(product.description || "")
    }
  }, [open, product, compoundFormatId])

  const categoriesQuery = useQuery({
    queryKey: ["product-categories", "compounded-product-edit"],
    queryFn: () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.admin.productCategory.list({ limit, offset })
          return { items: page.product_categories, count: page.count }
        },
      }),
  })

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(catId)
        ? current.filter((id) => id !== catId)
        : [...current, catId],
    )
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Product name is required")
      return
    }

    setIsSaving(true)
    try {
      // 1. Update Core Product attributes
      await sdk.admin.product.update(product.id, {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || undefined,
        categories: selectedCategoryIds.map((id) => ({ id })),
      })

      // 2. Update Compounded Format if changed
      if (formatId && formatId !== compoundFormatId) {
        await sdk.client.fetch(
          `/admin/compounded-product/products/${product.id}/format`,
          {
            method: "POST",
            body: { format_id: formatId },
          },
        )
      }

      toast.success("Product updated successfully")
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast.error(messageFromError(err, "Failed to update product"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="max-w-4xl overflow-y-auto">
        <Drawer.Header>
          <Heading level="h2">Edit Compounded Product</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Update storefront identity, physical format, categories, and research monograph.
          </Text>
        </Drawer.Header>

        <Drawer.Body className="flex flex-col gap-y-5 px-6 py-4">
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="edit-product-title">Product name *</Label>
            <Input
              id="edit-product-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. BPC-157 Research Peptide"
            />
          </div>

          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="edit-product-subtitle">Subtitle</Label>
            <Textarea
              id="edit-product-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Analytical grade pentadecapeptide"
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="edit-product-format">Product format</Label>
            <Select
              value={formatId || "none"}
              onValueChange={(val) => setFormatId(val === "none" ? "" : val)}
            >
              <Select.Trigger id="edit-product-format">
                <Select.Value placeholder="Select physical format..." />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="none">Not assigned</Select.Item>
                {compoundFormats.map((fmt) => (
                  <Select.Item key={fmt.id} value={fmt.id}>
                    {fmt.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Physical format such as Vial, Nasal Spray, Oral, or Topical.
            </Text>
          </div>

          <div className="flex flex-col gap-y-1.5">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-ui-border-base p-2.5 bg-ui-bg-subtle max-h-36 overflow-y-auto">
              {(categoriesQuery.data || []).map((category) => {
                const selected = selectedCategoryIds.includes(category.id)
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleToggleCategory(category.id)}
                    className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                      selected
                        ? "bg-zinc-900 text-white font-medium shadow-xs"
                        : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    {category.name} {selected ? "✓" : "+"}
                  </button>
                )
              })}
              {!categoriesQuery.isLoading && !(categoriesQuery.data || []).length ? (
                <Text size="xsmall" className="text-ui-fg-subtle">
                  No categories found.
                </Text>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-y-1.5">
            <Label>Customer-facing Description & Monograph</Label>
            <ProductDescriptionEditor
              value={description}
              onChange={setDescription}
            />
          </div>
        </Drawer.Body>

        <Drawer.Footer className="flex items-center justify-end gap-2 border-t border-ui-border-base px-6 py-4">
          <Button
            size="small"
            variant="secondary"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="small"
            disabled={isSaving}
            isLoading={isSaving}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
