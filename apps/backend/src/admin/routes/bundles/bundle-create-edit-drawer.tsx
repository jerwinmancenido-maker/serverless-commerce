/**
 * @file    apps/backend/src/admin/routes/bundles/bundle-create-edit-drawer.tsx
 * @module  BundleCreateEditDrawer
 * @purpose Slide-over drawer for creating and editing research bundle stacks with constituent vial specifications and discount math.
 * @contracts
 *   Drawer:  BundleCreateEditDrawer
 *   API:     POST /admin/products · POST /admin/products/:id
 */

import React, { useState, useEffect } from "react"
import {
  Drawer,
  Button,
  Input,
  Label,
  Textarea,
  toast,
} from "@medusajs/ui"
import { ArchiveBox, Plus, Trash, Sparkles } from "@medusajs/icons"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"

export type BundleComponentItem = {
  handle: string
  title: string
  strength: string
  quantity: number
  individualPrice: number
}

export type BundleFormState = {
  id?: string
  title: string
  handle: string
  sku: string
  description: string
  components: BundleComponentItem[]
  bundlePrice: number
}

interface BundleCreateEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bundle?: any | null
  onSuccess: () => void
}

const BLANK_STATE: BundleFormState = {
  title: "",
  handle: "",
  sku: "",
  description: "Synergistic research compound combination with verified beyond-use date protocol.",
  components: [
    { handle: "bpc-157", title: "BPC-157 5mg Vial", strength: "5MG", quantity: 1, individualPrice: 1200 },
    { handle: "tb-500", title: "TB-500 10mg Vial", strength: "10MG", quantity: 1, individualPrice: 1500 },
  ],
  bundlePrice: 2400,
}

export const BundleCreateEditDrawer: React.FC<BundleCreateEditDrawerProps> = ({
  open,
  onOpenChange,
  bundle,
  onSuccess,
}) => {
  const [form, setForm] = useState<BundleFormState>(BLANK_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch available products for adding components
  const productsQuery = useQuery({
    queryKey: ["admin-products-picker"],
    queryFn: () => sdk.admin.product.list({ limit: 100 }),
    enabled: open,
  })

  const availableProducts = productsQuery.data?.products || []
  const isEdit = Boolean(bundle && bundle.id)

  useEffect(() => {
    if (bundle) {
      const spec = bundle.metadata?.bundle_spec || {}
      setForm({
        id: bundle.id,
        title: bundle.title || "",
        handle: bundle.handle || "",
        sku: bundle.variants?.[0]?.sku || `BNDL-${(bundle.handle || "").toUpperCase()}`,
        description: bundle.description || "",
        components: Array.isArray(spec.components) ? spec.components : BLANK_STATE.components,
        bundlePrice: spec.bundlePrice || 2500,
      })
    } else {
      setForm(BLANK_STATE)
    }
  }, [bundle, open])

  const sumPrice = form.components.reduce(
    (acc, c) => acc + (Number(c.individualPrice) || 0) * (Number(c.quantity) || 1),
    0
  )
  const savings = Math.max(0, sumPrice - (Number(form.bundlePrice) || 0))
  const savingsPercent = sumPrice > 0 ? Math.round((savings / sumPrice) * 100) : 0

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setForm((prev) => ({
      ...prev,
      title: val,
      handle: prev.id ? prev.handle : val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      sku: prev.id ? prev.sku : `BNDL-${val.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 16)}`,
    }))
  }

  const addComponent = () => {
    setForm((prev) => ({
      ...prev,
      components: [
        ...prev.components,
        { handle: "new-compound", title: "New Vial", strength: "5MG", quantity: 1, individualPrice: 1000 },
      ],
    }))
  }

  const removeComponent = (index: number) => {
    setForm((prev) => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }))
  }

  const updateComponent = (index: number, field: keyof BundleComponentItem, value: any) => {
    setForm((prev) => ({
      ...prev,
      components: prev.components.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.handle.trim()) {
      toast.error("Bundle title and handle are required")
      return
    }

    setIsSubmitting(true)
    try {
      const bundleSpec = {
        components: form.components,
        sumPrice,
        bundlePrice: Number(form.bundlePrice) || sumPrice,
        savingsAmount: savings,
        savingsPercent,
      }

      if (isEdit && form.id) {
        await sdk.admin.product.update(form.id, {
          title: form.title,
          description: form.description,
          metadata: {
            is_bundle: true,
            bundle_spec: bundleSpec,
          },
        })
        toast.success("Research bundle stack updated successfully")
      } else {
        await sdk.admin.product.create({
          title: form.title,
          handle: form.handle,
          description: form.description,
          status: "published",
          variants: [
            {
              title: "Standard Research Kit",
              sku: form.sku || `BNDL-${form.handle.toUpperCase()}`,
              manage_inventory: false,
              prices: [
                {
                  amount: (Number(form.bundlePrice) || sumPrice) * 100, // In cents for Medusa
                  currency_code: "php",
                },
              ],
            },
          ],
          metadata: {
            is_bundle: true,
            bundle_spec: bundleSpec,
          },
        })
        toast.success("New research bundle stack created")
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Failed to save bundle:", err)
      toast.error(err.message || "Failed to save bundle stack")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="right-0 top-0 bottom-0 h-full w-full sm:max-w-xl bg-white border-l border-slate-200 p-0 flex flex-col justify-between shadow-2xl">
        <Drawer.Header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs shadow-2xs">
              <ArchiveBox className="size-4" />
            </span>
            <div>
              <Drawer.Title className="text-sm font-bold text-slate-900 tracking-tight">
                {isEdit ? "Edit Research Stack" : "Create New Research Bundle Stack"}
              </Drawer.Title>
              <Drawer.Description className="text-xs text-slate-500 mt-0.5">
                Multi-vial synergy kit with automated BOM breakdown &amp; package savings.
              </Drawer.Description>
            </div>
          </div>
        </Drawer.Header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Drawer.Body className="p-6 overflow-y-auto space-y-5 flex-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Bundle Stack Title</Label>
              <Input
                placeholder="e.g. BPC-157 + TB-500 Wolverine Recovery Stack"
                value={form.title}
                onChange={handleTitleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">URL Handle</Label>
                <Input
                  placeholder="e.g. wolverine-recovery-stack"
                  value={form.handle}
                  onChange={(e) => setForm({ ...form, handle: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">SKU Code</Label>
                <Input
                  placeholder="e.g. BNDL-WOLV-01"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Clinical Protocol Description</Label>
              <Textarea
                rows={2}
                placeholder="Explain the synergistic mechanism of constituent vials..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Constituent Vials Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Constituent Vials ({form.components.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">Components disaggregated upon warehouse fulfillment.</p>
                </div>
                <Button
                  type="button"
                  size="small"
                  variant="secondary"
                  onClick={addComponent}
                  className="h-7 text-xs inline-flex items-center gap-1"
                >
                  <Plus className="size-3" /> Add Vial
                </Button>
              </div>

              <div className="space-y-2">
                {form.components.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 w-full">
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] text-slate-500 font-mono">Product Title</Label>
                        <Input
                          value={comp.title}
                          onChange={(e) => updateComponent(idx, "title", e.target.value)}
                          className="h-7 text-xs bg-white"
                          placeholder="Compound Name"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] text-slate-500 font-mono">Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={comp.quantity}
                          onChange={(e) => updateComponent(idx, "quantity", Number(e.target.value))}
                          className="h-7 text-xs bg-white"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] text-slate-500 font-mono">Unit ₱</Label>
                        <Input
                          type="number"
                          min="0"
                          value={comp.individualPrice}
                          onChange={(e) => updateComponent(idx, "individualPrice", Number(e.target.value))}
                          className="h-7 text-xs bg-white"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeComponent(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer shrink-0 mt-2 sm:mt-0"
                      title="Remove Component"
                    >
                      <Trash className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing & Discount Math Card */}
            <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/40 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Total Sum of Individual Vials:</span>
                <span className="font-mono font-bold text-slate-900">₱{sumPrice.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs font-bold text-blue-900">Bundle Package Price (₱):</Label>
                <div className="w-36">
                  <Input
                    type="number"
                    min="0"
                    value={form.bundlePrice}
                    onChange={(e) => setForm({ ...form, bundlePrice: Number(e.target.value) })}
                    className="h-8 font-mono font-bold text-right bg-white text-blue-900 border-blue-300"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-600">Researcher Discount:</span>
                <span className="font-mono font-bold text-emerald-700">
                  Save ₱{savings.toLocaleString()} ({savingsPercent}%)
                </span>
              </div>
            </div>
          </Drawer.Body>

          <Drawer.Footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="small"
              isLoading={isSubmitting}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {isEdit ? "Save Stack Changes" : "Create Research Stack"}
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}

export default BundleCreateEditDrawer
