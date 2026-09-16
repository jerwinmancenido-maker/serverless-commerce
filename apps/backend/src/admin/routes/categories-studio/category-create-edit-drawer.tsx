/**
 * @file    apps/backend/src/admin/routes/categories-studio/category-create-edit-drawer.tsx
 * @module  CategoryCreateEditDrawer
 * @purpose Slide-over drawer for creating and editing product categories with zero hardcoded static defaults.
 * @contracts
 *   API: POST /admin/product-categories · POST /admin/product-categories/:id
 */

import { Button, Drawer, Heading, Input, Label, Switch, Text, Textarea, toast } from "@medusajs/ui"
import { useQueryClient } from "@tanstack/react-query"
import React, { useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"

export type CategoryItem = {
  id?: string
  name: string
  handle: string
  description?: string | null
  is_active: boolean
  is_internal: boolean
  parent_category_id?: string | null
}

export type CategoryCreateEditDrawerProps = {
  open: boolean
  onClose: () => void
  category?: CategoryItem | null
}

export const CategoryCreateEditDrawer: React.FC<CategoryCreateEditDrawerProps> = ({
  open,
  onClose,
  category,
}) => {
  const queryClient = useQueryClient()
  const isEdit = Boolean(category?.id)

  const [name, setName] = useState("")
  const [handle, setHandle] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isInternal, setIsInternal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name || "")
      setHandle(category.handle || "")
      setDescription(category.description || "")
      setIsActive(category.is_active ?? true)
      setIsInternal(category.is_internal ?? false)
    } else {
      setName("")
      setHandle("")
      setDescription("")
      setIsActive(true)
      setIsInternal(false)
    }
  }, [category, open])

  const handleNameChange = (val: string) => {
    setName(val)
    if (!isEdit) {
      setHandle(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Category name is required")
      return
    }

    setIsSaving(true)
    try {
      if (isEdit && category?.id) {
        await sdk.admin.productCategory.update(category.id, {
          name,
          handle: handle || undefined,
          description: description || undefined,
          is_active: isActive,
          is_internal: isInternal,
        })
        toast.success(`Category "${name}" updated`)
      } else {
        await sdk.admin.productCategory.create({
          name,
          handle: handle || undefined,
          description: description || undefined,
          is_active: isActive,
          is_internal: isInternal,
        })
        toast.success(`Category "${name}" created`)
      }

      queryClient.invalidateQueries({ queryKey: ["product-categories-operations"] })
      onClose()
    } catch (err: any) {
      console.error("Failed to save category:", err)
      toast.error(err.message || "Failed to save category")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <Drawer.Content className="w-full sm:max-w-lg h-dvh sm:h-full flex flex-col justify-between">
        <Drawer.Header>
          <Drawer.Title>
            {isEdit ? "Edit Compound Category" : "Create Compound Category"}
          </Drawer.Title>
          <Drawer.Description>
            Configure category taxonomy, storefront handle, and visibility across customer navigation rails.
          </Drawer.Description>
        </Drawer.Header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto p-4 sm:p-6 gap-y-4">
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="cat-name" className="text-xs font-semibold text-slate-900">
              Category Name *
            </Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Cognitive & Neuroprotective Peptides"
              className="h-8 text-xs bg-white"
              required
            />
          </div>

          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="cat-handle" className="text-xs font-semibold text-slate-900">
              Storefront Handle (URL Slug)
            </Label>
            <Input
              id="cat-handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. cognitive-neuroprotective-peptides"
              className="h-8 text-xs font-mono bg-white"
            />
            <span className="text-[10px] text-slate-500">
              Will be accessible at <code>/ph/categories/{handle || "slug"}</code>
            </span>
          </div>

          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="cat-desc" className="text-xs font-semibold text-slate-900">
              Compound Taxonomy Description
            </Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Authoritative description of compounds belonging to this reference standard class..."
              rows={3}
              className="text-xs bg-white"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Active Status</span>
              <span className="text-[11px] text-slate-500">Enable category visibility in catalog</span>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50">
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Internal Only</span>
              <span className="text-[11px] text-slate-500">Restrict to internal labware/compounding</span>
            </div>
            <Switch checked={isInternal} onCheckedChange={setIsInternal} />
          </div>

          <Drawer.Footer className="px-4 sm:px-6 py-3 sm:py-4 pb-[env(safe-area-inset-bottom,1rem)] border-t border-slate-100 bg-slate-50/50 mt-auto">
            <div className="flex items-center justify-end gap-2 w-full">
              <Button type="button" variant="secondary" size="small" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" size="small" isLoading={isSaving} className="bg-slate-900 text-white hover:bg-slate-800">
                {isEdit ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}
