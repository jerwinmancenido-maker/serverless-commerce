import { ArrowUpTray, CheckCircle, Trash } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import { Button, Drawer, Text, toast } from "@medusajs/ui"
import { useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { sdk } from "../../../lib/sdk"

type VariantPhotoDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: HttpTypes.AdminProductVariant | null
  product: HttpTypes.AdminProduct
}

export const VariantPhotoDrawer = ({
  open,
  onOpenChange,
  variant,
  product,
}: VariantPhotoDrawerProps) => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(
    variant?.thumbnail || null,
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Sync selected photo when variant changes
  const currentThumbnail = variant?.thumbnail || null

  const handleSave = async () => {
    if (!variant) return
    setIsSaving(true)
    try {
      await sdk.admin.product.updateVariant(product.id, variant.id, {
        thumbnail: selectedPhotoUrl || null,
      })

      toast.success(
        selectedPhotoUrl
          ? `Photo assigned to "${variant.title}"`
          : `Photo removed from "${variant.title}"`,
      )

      queryClient.invalidateQueries({
        queryKey: ["compounded-product-native-product", product.id],
      })
      queryClient.invalidateQueries({
        queryKey: ["compounded-product-readiness", product.id],
      })

      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update variant photo")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return
    const file = files[0]
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10 MB")
      return
    }

    setIsUploading(true)
    try {
      const uploadRes = await sdk.admin.upload.create({ files: [file] })
      const newUrl = uploadRes.files[0]?.url

      if (newUrl) {
        // Also associate image with the parent product if not already there
        const existingUrls = (product.images || []).map((img) => img.url)
        if (!existingUrls.includes(newUrl)) {
          await sdk.admin.product.update(product.id, {
            images: [...(product.images || []).map((img) => ({ url: img.url })), { url: newUrl }],
          })
          queryClient.invalidateQueries({
            queryKey: ["compounded-product-native-product", product.id],
          })
        }

        setSelectedPhotoUrl(newUrl)
        toast.success("Photo uploaded successfully")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo")
    } finally {
      setIsUploading(false)
    }
  }

  if (!variant) return null

  const availableImages = product.images || []

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Variation Photo</Drawer.Title>
          <Drawer.Description>
            Select or upload a photo specific to <strong>{variant.title}</strong>. This photo is displayed when customers select this variation on your store.
          </Drawer.Description>
        </Drawer.Header>

        <Drawer.Body className="flex flex-1 flex-col gap-y-5 overflow-y-auto p-6">
          {/* Active Photo Preview */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl border border-ui-border-base bg-ui-bg-subtle/50">
            <div className="size-20 shrink-0 rounded-lg border border-ui-border-base bg-ui-bg-base overflow-hidden flex items-center justify-center shadow-xs">
              {selectedPhotoUrl ? (
                <img
                  src={selectedPhotoUrl}
                  alt={variant.title || "Variant"}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-2xl text-ui-fg-muted">📷</span>
              )}
            </div>

            <div className="flex flex-col gap-y-1 min-w-0">
              <Text size="small" weight="plus" className="text-ui-fg-base truncate">
                {variant.title}
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {selectedPhotoUrl
                  ? "Custom photo selected for this variation."
                  : "No photo assigned. The main product photo is currently used."}
              </Text>

              {selectedPhotoUrl && (
                <Button
                  size="small"
                  variant="transparent"
                  onClick={() => setSelectedPhotoUrl(null)}
                  className="self-start h-6 text-xs text-rose-600 hover:text-rose-700 px-0 mt-1 inline-flex items-center gap-1"
                >
                  <Trash className="size-3" />
                  Remove variation photo
                </Button>
              )}
            </div>
          </div>

          {/* Option A: Choose from Product Gallery */}
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
              <Text size="xsmall" weight="plus" className="text-ui-fg-base uppercase tracking-wider">
                Choose from Product Photos ({availableImages.length})
              </Text>
            </div>

            {availableImages.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {availableImages.map((img) => {
                  const isSelected = selectedPhotoUrl === img.url
                  return (
                    <button
                      key={img.id || img.url}
                      type="button"
                      onClick={() => setSelectedPhotoUrl(img.url)}
                      className={`relative aspect-square rounded-lg border overflow-hidden transition-all group ${
                        isSelected
                          ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                          : "border-ui-border-base hover:border-ui-border-strong"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt="Product option"
                        className="size-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow">
                          <CheckCircle className="size-3.5" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              <Text size="xsmall" className="text-ui-fg-subtle italic py-2">
                No product images have been uploaded yet. Upload one below.
              </Text>
            )}
          </div>

          {/* Option B: Upload New Photo */}
          <div className="flex flex-col gap-y-2 pt-2 border-t border-ui-border-base">
            <Text size="xsmall" weight="plus" className="text-ui-fg-base uppercase tracking-wider">
              Upload New Photo
            </Text>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                if (files.length) handleFileUpload(files)
                e.target.value = ""
              }}
            />

            <Button
              size="small"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              className="w-full justify-center h-9 text-xs inline-flex items-center gap-2 border-dashed"
            >
              <ArrowUpTray className="size-3.5 text-ui-fg-subtle" />
              <span>Upload photo for {variant.title}…</span>
            </Button>
          </div>
        </Drawer.Body>

        <Drawer.Footer className="flex items-center justify-end gap-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSaving || isUploading}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={selectedPhotoUrl === currentThumbnail}
          >
            Save Photo
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
