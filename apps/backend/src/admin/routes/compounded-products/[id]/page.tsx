import {
  ArrowPath,
  ArrowUpRightOnBox,
  CheckCircle,
  ChevronDownMini,
  ChevronUpMini,
  EllipsisHorizontal,
  PencilSquare,
  Spinner,
  Trash,
} from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import {
  Badge,
  Button,
  Container,
  Copy,
  Drawer,
  DropdownMenu,
  Heading,
  IconButton,
  Input,
  Label,
  Prompt,
  Select,
  Tabs,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { sdk } from "../../../lib/sdk"
import { AdminCard } from "../../../components/admin-card"
import { PageHeader } from "../../../components/page-header"
import { ProductOpsSidebar } from "./product-ops-sidebar"
import { VariantBomMatrix } from "./variant-bom-matrix"
import ProductDescriptionEditor from "../product-description-editor"
import { loadAllAdminPages } from "../../../lib/load-all-pages"
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
import type { ResearchProtocolListResponse } from "../research-protocol-types"

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
  prices?: any,
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
          "+metadata,+categories.*,+images.*,+sales_channels.*,+variants.*,+variants.prices.*,+variants.options.*,+options.*",
      }),
  })
  const categoriesQuery = useQuery({
    queryKey: ["product-categories", "compounded-product-page"],
    queryFn: () =>
      loadAllAdminPages({
        loadPage: async (limit, offset) => {
          const page = await sdk.admin.productCategory.list({ limit, offset })
          return { items: page.product_categories, count: page.count }
        },
      }),
  })
  const salesChannelsQuery = useQuery({
    queryKey: ["sales-channels", "compounded-product-page"],
    queryFn: () => sdk.admin.salesChannel.list({ limit: 50 }),
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
  const researchProtocolsQuery = useQuery({
    queryKey: ["research-protocols", id],
    enabled: Boolean(id),
    queryFn: () =>
      sdk.client.fetch<ResearchProtocolListResponse>(
        `/admin/products/${id}/research-protocols`,
        { query: { limit: 100, offset: 0 } },
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

  const bottleneckAnalysis = useMemo(() => {
    if (!availabilityQuery.data?.variants || availabilityQuery.data.variants.length === 0) {
      return null
    }

    let limitingTitle: string | null = null
    let lowestStock = Infinity
    let highestStock = 0

    availabilityQuery.data.variants.forEach((v) => {
      if (v.status === "calculated" && v.calculated_stock !== null) {
        if (v.calculated_stock < lowestStock) {
          lowestStock = v.calculated_stock
          limitingTitle = v.limiting_components?.[0]?.inventory_item_title || null
        }
        if (v.calculated_stock > highestStock) {
          highestStock = v.calculated_stock
        }
      }
    })

    if (limitingTitle && lowestStock <= 20 && highestStock >= lowestStock + 20) {
      return {
        limitingComponent: limitingTitle,
        lowestStock,
        highestStock,
      }
    }
    return null
  }, [availabilityQuery.data?.variants])

  useEffect(() => {
    const locations = stockLocationsQuery.data?.stock_locations || []

    if (
      !locations.some((location) => location.id === selectedStockLocationId)
    ) {
      setSelectedStockLocationId(locations[0]?.id || "")
    }
  }, [selectedStockLocationId, stockLocationsQuery.data?.stock_locations])

  const [editingPriceVariantId, setEditingPriceVariantId] = useState<string | null>(null)
  const [editingPriceAmount, setEditingPriceAmount] = useState("")
  const [isSavingPrice, setIsSavingPrice] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteProduct = async () => {
    if (!product) return
    setIsDeleting(true)
    try {
      await sdk.admin.product.delete(product.id)
      toast.success("Product deleted successfully")
      navigate("/compounded-products")
    } catch (err) {
      toast.error(messageFromError(err, "Failed to delete product"))
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleSavePrice = async (variantId: string) => {
    const numericAmount = parseFloat(editingPriceAmount)
    if (isNaN(numericAmount) || numericAmount < 0) {
      toast.error("Please enter a valid price amount")
      return
    }
    setIsSavingPrice(true)
    try {
      await sdk.admin.product.updateVariant(id, variantId, {
        prices: [
          {
            currency_code: "php",
            amount: numericAmount,
          },
        ],
      })
      toast.success("Price updated successfully")
      setEditingPriceVariantId(null)
      queryClient.invalidateQueries({
        queryKey: ["compounded-product-native-product", id],
      })
    } catch (err) {
      toast.error(messageFromError(err, "Failed to update price"))
    } finally {
      setIsSavingPrice(false)
    }
  }

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState("variants")

  // In-Page Direct Editing: Metadata
  const [isEditingMetadata, setIsEditingMetadata] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editSubtitle, setEditSubtitle] = useState("")
  const [editHandle, setEditHandle] = useState("")
  const [editFormatId, setEditFormatId] = useState("")
  const [editCategoryIds, setEditCategoryIds] = useState<string[]>([])
  const [editSalesChannelIds, setEditSalesChannelIds] = useState<string[]>([])
  const [isSavingMetadata, setIsSavingMetadata] = useState(false)

  // In-Page Direct Editing: Product Description
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [liveDescription, setLiveDescription] = useState("")
  const [isSavingDescription, setIsSavingDescription] = useState(false)

  const startEditingMetadata = () => {
    if (!product) return
    setEditTitle(product.title || "")
    setEditSubtitle(product.subtitle || "")
    setEditHandle(product.handle || "")
    setEditFormatId(readiness?.registration?.compound_format_id || "")
    setEditCategoryIds((product.categories || []).map((c) => c.id))
    setEditSalesChannelIds((product.sales_channels || []).map((sc) => sc.id))
    setIsEditingMetadata(true)
  }

  const handleToggleCategory = (catId: string) => {
    setEditCategoryIds((current) =>
      current.includes(catId)
        ? current.filter((id) => id !== catId)
        : [...current, catId],
    )
  }

  const handleToggleSalesChannel = (channelId: string) => {
    setEditSalesChannelIds((current) =>
      current.includes(channelId)
        ? current.filter((id) => id !== channelId)
        : [...current, channelId],
    )
  }

  const handleSaveMetadata = async () => {
    if (!editTitle.trim()) {
      toast.error("Product name is required")
      return
    }
    setIsSavingMetadata(true)
    try {
      await sdk.admin.product.update(id, {
        title: editTitle.trim(),
        subtitle: editSubtitle.trim() || null,
        handle: editHandle.trim() || undefined,
        categories: editCategoryIds.map((cid) => ({ id: cid })),
        sales_channels: editSalesChannelIds.map((scid) => ({ id: scid })),
      })

      if (
        editFormatId &&
        editFormatId !== readiness?.registration?.compound_format_id
      ) {
        await sdk.client.fetch(
          `/admin/compounded-product/products/${id}/format`,
          {
            method: "POST",
            body: { format_id: editFormatId },
          },
        )
      }

      toast.success("Product details updated successfully")
      setIsEditingMetadata(false)
      queryClient.invalidateQueries({
        queryKey: ["compounded-product-native-product", id],
      })
      queryClient.invalidateQueries({
        queryKey: ["compounded-product-readiness", id],
      })
      queryClient.invalidateQueries({
        queryKey: ["compound-product-formats"],
      })
    } catch (err) {
      toast.error(messageFromError(err, "Failed to update product details"))
    } finally {
      setIsSavingMetadata(false)
    }
  }

  const startEditingDescription = () => {
    if (!product) return
    setLiveDescription(product.description || "")
    setIsEditingDescription(true)
  }

  const handleSaveDescription = async () => {
    setIsSavingDescription(true)
    try {
      await sdk.admin.product.update(id, {
        description: liveDescription.trim() || undefined,
      })
      toast.success("Product description saved successfully")
      setIsEditingDescription(false)
      queryClient.invalidateQueries({
        queryKey: ["compounded-product-native-product", id],
      })
    } catch (err) {
      toast.error(messageFromError(err, "Failed to save description"))
    } finally {
      setIsSavingDescription(false)
    }
  }

  // Compliance & Safety Configuration (Store-wide defaults + product overrides)
  const complianceDefaults = useMemo(
    () => ({
      storage_and_handling:
        "Store lyophilized compound at -20°C in a dry environment protected from light. Once reconstituted with Bacteriostatic Water, keep refrigerated at 2°C–8°C and use within 28 days for maximum stability. Avoid repeated freeze-thaw cycles.",
      intended_use:
        "Synthesized strictly for in-vitro laboratory research, analytical calibration, and scientific evaluation. Not for human, clinical, veterinary, therapeutic, or household administration.",
      terms_of_sale:
        "Purchaser must be an authorized investigator or institutional buyer aged 18+. Purchase constitutes agreement to handle all materials strictly according to standard biosafety and chemical safety protocols.",
      disclaimer:
        "This investigational chemical has not been evaluated or approved by the Philippine Food and Drug Administration (FDA) for the treatment, cure, or diagnosis of any disease or condition.",
      packaging_options:
        "Dispatched in sterile crimped vials with tamper-evident security caps. Available as standalone vials, with USP Bacteriostatic Water, or as Complete SubQ assembly kits with sterile administration supplies.",
    }),
    [],
  )

  const currentCompliance = useMemo(
    () => ((productQuery.data?.product?.metadata?.compliance as Record<string, string>) || {}),
    [productQuery.data?.product?.metadata?.compliance],
  )

  const [isEditingCompliance, setIsEditingCompliance] = useState(false)
  const [isSavingCompliance, setIsSavingCompliance] = useState(false)
  const [editStorageHandling, setEditStorageHandling] = useState("")
  const [editIntendedUse, setEditIntendedUse] = useState("")
  const [editTermsOfSale, setEditTermsOfSale] = useState("")
  const [editDisclaimer, setEditDisclaimer] = useState("")
  const [editPackagingOptions, setEditPackagingOptions] = useState("")

  const startEditingCompliance = () => {
    setEditStorageHandling(currentCompliance.storage_and_handling || "")
    setEditIntendedUse(currentCompliance.intended_use || "")
    setEditTermsOfSale(currentCompliance.terms_of_sale || "")
    setEditDisclaimer(currentCompliance.disclaimer || "")
    setEditPackagingOptions(currentCompliance.packaging_options || "")
    setIsEditingCompliance(true)
  }

  const handleSaveCompliance = async () => {
    setIsSavingCompliance(true)
    try {
      const updatedCompliance: Record<string, string> = {}
      if (editStorageHandling.trim()) updatedCompliance.storage_and_handling = editStorageHandling.trim()
      if (editIntendedUse.trim()) updatedCompliance.intended_use = editIntendedUse.trim()
      if (editTermsOfSale.trim()) updatedCompliance.terms_of_sale = editTermsOfSale.trim()
      if (editDisclaimer.trim()) updatedCompliance.disclaimer = editDisclaimer.trim()
      if (editPackagingOptions.trim()) updatedCompliance.packaging_options = editPackagingOptions.trim()

      await sdk.admin.product.update(id, {
        metadata: {
          ...(productQuery.data?.product?.metadata || {}),
          compliance: Object.keys(updatedCompliance).length > 0 ? updatedCompliance : null,
        },
      })
      toast.success("Compliance & Safety settings saved")
      setIsEditingCompliance(false)
      queryClient.invalidateQueries({
        queryKey: ["compounded-product-native-product", id],
      })
    } catch (err) {
      toast.error(messageFromError(err, "Failed to save compliance settings"))
    } finally {
      setIsSavingCompliance(false)
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMediaMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const oversized = files.find((file) => file.size > 10 * 1024 * 1024)
      if (oversized) {
        throw new Error(`${oversized.name} exceeds the 10 MB upload limit`)
      }
      const response = await sdk.admin.upload.create({ files })
      const existingImages = (product.images || []).map((img) => ({
        url: img.url,
      }))
      const newImages = response.files.map((f) => ({ url: f.url }))
      return sdk.admin.product.update(product.id, {
        images: [...existingImages, ...newImages],
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["compounded-product-native-product", id],
      })
      toast.success("Images uploaded successfully")
    },
    onError: (err) => {
      toast.error(messageFromError(err, "Failed to upload product images"))
    },
  })

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
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-readiness", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["bom-location-availability"],
        }),
      ])
      await queryClient.refetchQueries({
        queryKey: ["bom-location-availability"],
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
    researchProtocolsQuery.isLoading ||
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
  const sellableCapacity = availabilityQuery.data?.variants?.length
    ? `${Math.max(...availabilityQuery.data.variants.map((v) => v.calculated_stock || 0), 0)} Units`
    : "—"
  const basePriceFormatted = formatVariantPrices(product.variants?.[0]?.prices || null)

  return (
    <div className="flex flex-col gap-y-3 pb-8">
      {/* 1. Standard Page Header with Breadcrumbs and Quick Actions */}
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <span className="text-base">🧪</span>
            <span className="truncate">{product.title}</span>
            <Copy content={product.id} className="text-ui-fg-muted hover:text-ui-fg-subtle" />
          </div>
        }
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "Compounded Products", href: "/compounded-products" },
          { label: product.title },
        ]}
        backHref="/compounded-products"
        subtitle="Manage this product's storefront identity, variants, stock capacity, BOM recipes, and publication readiness."
        badge={
          product.status === "published" ? null : readiness.ready ? (
            <Badge
              color="blue"
              size="small"
              className="cursor-pointer hover:opacity-80 transition-opacity font-medium"
              onClick={() => setPublicationDrawerOpen(true)}
              title="Click to review and publish product"
            >
              ● Ready to Publish
            </Badge>
          ) : (
            <Badge
              color="orange"
              size="small"
              className="cursor-pointer hover:opacity-80 transition-opacity font-medium"
              onClick={() => setPublicationDrawerOpen(true)}
              title="Click to review missing publication checks"
            >
              ● Draft ({readiness.blockers.length} check{readiness.blockers.length === 1 ? "" : "s"} pending)
            </Badge>
          )
        }
        actions={
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <IconButton size="small" variant="transparent" className="size-7" title="More Actions">
                <EllipsisHorizontal className="size-4" />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" className="w-56">
              {product.handle && product.status === "published" ? (
                <DropdownMenu.Item asChild className="gap-x-2">
                  <a
                    href={`http://localhost:8000/ph/products/${product.handle}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ArrowUpRightOnBox className="size-4 text-ui-fg-subtle" />
                    <span>View on Storefront</span>
                  </a>
                </DropdownMenu.Item>
              ) : (
                <DropdownMenu.Item disabled className="gap-x-2 opacity-50 cursor-not-allowed">
                  <ArrowUpRightOnBox className="size-4 text-ui-fg-muted" />
                  <span>View on Storefront (Draft)</span>
                </DropdownMenu.Item>
              )}

              <DropdownMenu.Separator />

              {product.status === "published" ? (
                <DropdownMenu.Item
                  className="gap-x-2"
                  onClick={() => setPublicationDrawerOpen(true)}
                >
                  <ArrowPath className="size-4 text-ui-fg-subtle" />
                  <span>Withdraw to Draft</span>
                </DropdownMenu.Item>
              ) : (
                <DropdownMenu.Item
                  className="gap-x-2"
                  onClick={() => setPublicationDrawerOpen(true)}
                >
                  <CheckCircle className="size-4 text-emerald-600" />
                  <span>{readiness.ready ? "Publish Product" : "Review Readiness Checks"}</span>
                </DropdownMenu.Item>
              )}

              <DropdownMenu.Separator />

              <DropdownMenu.Item
                className="gap-x-2 text-ui-fg-error hover:bg-ui-bg-error-hover"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="size-4 text-ui-fg-error" />
                <span>Delete Product</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        }
      />

      {/* 2. Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start mt-1">
        {/* Left Column: Interactive Workspace Tabs */}
        <div className="flex flex-col gap-y-3 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <Tabs.List className="w-full justify-start border-b border-ui-border-base mb-3 gap-2">
              <Tabs.Trigger value="variants" className="gap-2 text-xs py-1.5">
                <span>📦</span> Variants & Inventory
              </Tabs.Trigger>
              <Tabs.Trigger value="catalog" className="gap-2 text-xs py-1.5">
                <span>📝</span> Details & Media
              </Tabs.Trigger>
              <Tabs.Trigger value="protocols" className="gap-2 text-xs py-1.5">
                <span>🔬</span> Research Protocols
                <Badge
                  size="small"
                  color={
                    (researchProtocolsQuery.data?.protocols || []).some((p) =>
                      p.revisions.some((r) => r.status === "published"),
                    )
                      ? "green"
                      : "grey"
                  }
                >
                  {researchProtocolsQuery.data?.count || 0}
                </Badge>
              </Tabs.Trigger>
            </Tabs.List>

            {/* Tab 1: Variants & BOM */}
            <Tabs.Content value="variants">
              <VariantBomMatrix
                product={product}
                readiness={readiness}
                availabilityByVariantId={availabilityByVariantId}
                availabilityQuery={availabilityQuery}
                stockLocations={stockLocationsQuery.data?.stock_locations || []}
                selectedStockLocationId={selectedStockLocationId}
                setSelectedStockLocationId={setSelectedStockLocationId}
                stockLocationsQuery={stockLocationsQuery}
                editingPriceVariantId={editingPriceVariantId}
                setEditingPriceVariantId={setEditingPriceVariantId}
                editingPriceAmount={editingPriceAmount}
                setEditingPriceAmount={setEditingPriceAmount}
                isSavingPrice={isSavingPrice}
                handleSavePrice={handleSavePrice}
                recipes={recipes}
                setRecipes={setRecipes}
                expandedRecipeIds={expandedRecipeIds}
                toggleRecipe={toggleRecipe}
                seedRecipeRows={seedRecipeRows}
                updateRecipe={updateRecipe}
                recipeMutation={recipeMutation}
                profileByInventoryId={profileByInventoryId}
                inventoryById={inventoryById}
                profiles={profiles}
                formatVariantPrices={formatVariantPrices}
              />
            </Tabs.Content>

            {/* Tab 2: Catalog Information & Media */}
            <Tabs.Content value="catalog" className="flex flex-col gap-y-4">
              {/* Top Row: Format & Categories + Media Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Product Details Card (In-Page Direct Editing) */}
                <AdminCard
                  title="Product Details"
                  subtitle="Basic product details, web link, categories, and sales channels."
                  headerAction={
                    isEditingMetadata ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => setIsEditingMetadata(false)}
                          disabled={isSavingMetadata}
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="primary"
                          onClick={handleSaveMetadata}
                          isLoading={isSavingMetadata}
                          className="h-7 text-xs"
                        >
                          Save Details
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={startEditingMetadata}
                        className="h-7 text-xs inline-flex items-center gap-1.5"
                      >
                        <PencilSquare className="size-3" />
                        Edit Details
                      </Button>
                    )
                  }
                  contentClassName="p-4"
                >
                  {isEditingMetadata ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] text-ui-fg-subtle">Product Name *</Label>
                        <Input
                          size="small"
                          className="h-8 text-xs font-medium"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="e.g. Phase 8 GHK-Cu Acceptance"
                          autoFocus
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] text-ui-fg-subtle">Short description</Label>
                        <Textarea
                          className="text-xs resize-none"
                          rows={2}
                          value={editSubtitle}
                          onChange={(e) => setEditSubtitle(e.target.value)}
                          placeholder="e.g. Dual GIP/GLP-1 receptor agonist · Lyophilized peptide"
                        />
                        <span className="text-[10px] text-ui-fg-muted">Shown below the product name on the storefront.</span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                          <Label className="text-[11px] text-ui-fg-subtle">Product Format</Label>
                          <Select value={editFormatId || undefined} onValueChange={setEditFormatId}>
                            <Select.Trigger className="h-8 text-xs">
                              <Select.Value placeholder="Select product format" />
                            </Select.Trigger>
                            <Select.Content>
                              {(compoundFormatsQuery.data?.formats || []).map((f) => (
                                <Select.Item key={f.id} value={f.id} className="text-xs">
                                  {f.name}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-[11px] text-ui-fg-subtle">Storefront Link (URL Slug)</Label>
                          <Input
                            size="small"
                            className="h-8 text-xs font-mono"
                            value={editHandle}
                            onChange={(e) => setEditHandle(e.target.value)}
                            placeholder="e.g. ghk-cu-subq-set"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] text-ui-fg-subtle">Categories (Click to toggle)</Label>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {((categoriesQuery.data as any) || []).map((cat: any) => {
                            const active = editCategoryIds.includes(cat.id)
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleToggleCategory(cat.id)}
                                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                  active
                                    ? "bg-ui-bg-base border-ui-border-strong text-ui-fg-base font-medium shadow-sm ring-1 ring-ui-border-base"
                                    : "bg-ui-bg-subtle/50 border-ui-border-base text-ui-fg-muted hover:text-ui-fg-subtle"
                                }`}
                              >
                                {cat.name} {active ? "✓" : "+"}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] text-ui-fg-subtle">Sales Channels (Click to toggle)</Label>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {(salesChannelsQuery.data?.sales_channels || []).map((sc) => {
                            const active = editSalesChannelIds.includes(sc.id)
                            return (
                              <button
                                key={sc.id}
                                type="button"
                                onClick={() => handleToggleSalesChannel(sc.id)}
                                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                  active
                                    ? "bg-ui-bg-base border-ui-border-strong text-ui-fg-base font-medium shadow-sm ring-1 ring-ui-border-base"
                                    : "bg-ui-bg-subtle/50 border-ui-border-base text-ui-fg-muted hover:text-ui-fg-subtle"
                                }`}
                              >
                                {sc.name} {active ? "✓" : "+"}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {product.subtitle && (
                        <div className="flex flex-col gap-y-0.5 sm:col-span-2">
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            Short description
                          </Text>
                          <Text size="small" className="text-ui-fg-base leading-relaxed">
                            {product.subtitle}
                          </Text>
                        </div>
                      )}
                      <div className="flex flex-col gap-y-0.5">
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          Product format
                        </Text>
                        <Text size="small" weight="plus">
                          {compoundFormat?.name || "Not assigned"}
                        </Text>
                      </div>
                      <div className="flex flex-col gap-y-0.5">
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          Storefront Link (URL Slug)
                        </Text>
                        <Text size="small" weight="plus" className="truncate font-mono text-xs">
                          {product.handle || "Not set"}
                        </Text>
                      </div>
                      <div className="flex flex-col gap-y-0.5 sm:col-span-2">
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          Categories
                        </Text>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {product.categories?.length ? (
                            product.categories.map((c) => (
                              <Badge key={c.id} size="small" color="grey">
                                {c.name}
                              </Badge>
                            ))
                          ) : (
                            <Text size="small" className="text-ui-fg-muted">Not assigned</Text>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-y-0.5 sm:col-span-2">
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          Sales channels
                        </Text>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {product.sales_channels?.length ? (
                            product.sales_channels.map((sc) => (
                              <Badge key={sc.id} size="small" color="blue">
                                {sc.name}
                              </Badge>
                            ))
                          ) : (
                            <Text size="small" className="text-ui-fg-muted">Not assigned</Text>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </AdminCard>

                {/* Product Media Card */}
                <AdminCard
                  title="Product Media"
                  subtitle={`${product.images?.length || 0} image${product.images?.length === 1 ? "" : "s"}`}
                  headerAction={
                    product.images?.length ? (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        isLoading={uploadMediaMutation.isPending}
                        className="h-7 text-xs"
                      >
                        + Add Photo
                      </Button>
                    ) : null
                  }
                  contentClassName="p-4"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length) {
                        uploadMediaMutation.mutate(files)
                      }
                      e.target.value = ""
                    }}
                  />

                  {product.images?.length ? (
                    <div className="grid grid-cols-3 gap-2">
                      {product.images.slice(0, 6).map((image, index) => (
                        <img
                          key={image.id || image.url}
                          src={image.url}
                          alt={`${product.title} image ${index + 1}`}
                          className="aspect-square w-full rounded border border-ui-border-base object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-ui-border-base p-4 text-center">
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        No product images uploaded yet.
                      </Text>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        isLoading={uploadMediaMutation.isPending}
                        className="h-7 text-xs"
                      >
                        + Upload Images
                      </Button>
                    </div>
                  )}
                </AdminCard>
              </div>

              {/* Product Description Card (In-Page Live Editor) */}
              <AdminCard
                title="Product Description"
                subtitle="Product description, usage guide, and details displayed to customers on your online store."
                badge={<Badge color="grey" size="small">Customer-Facing</Badge>}
                headerAction={
                  isEditingDescription ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => setIsEditingDescription(false)}
                        disabled={isSavingDescription}
                        className="h-7 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="primary"
                        onClick={handleSaveDescription}
                        isLoading={isSavingDescription}
                        className="h-7 text-xs"
                      >
                        Save Description
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={startEditingDescription}
                      className="h-7 text-xs inline-flex items-center gap-1.5"
                    >
                      <PencilSquare className="size-3" />
                      Edit Description
                    </Button>
                  )
                }
                contentClassName="p-6"
              >
                {isEditingDescription ? (
                  <div className="flex flex-col gap-3">
                    <ProductDescriptionEditor
                      value={liveDescription}
                      onChange={setLiveDescription}
                    />
                  </div>
                ) : product.description ? (
                  <div
                    className="text-ui-fg-base text-sm leading-relaxed max-w-none [&_p]:mb-3 [&_p]:leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-ui-fg-base [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-ui-fg-base [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_blockquote]:border-l-2 [&_blockquote]:border-ui-border-strong [&_blockquote]:pl-3.5 [&_blockquote]:italic [&_blockquote]:my-3 [&_img]:rounded-md [&_img]:border [&_img]:border-ui-border-base [&_img]:my-3 [&_img]:max-h-96"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ui-border-base p-6 text-center">
                    <Text size="small" className="text-ui-fg-subtle">
                      No description configured yet.
                    </Text>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={startEditingDescription}
                      className="h-7 text-xs inline-flex items-center gap-1.5"
                    >
                      <PencilSquare className="size-3" />
                      Add Description
                    </Button>
                  </div>
                )}
              </AdminCard>

              {/* Compliance & Safety Disclaimers Card */}
              <AdminCard
                title="Compliance & Safety Disclaimers"
                subtitle="Manage product-level overrides for the 5 compliance & safety disclaimers shown on the storefront. Leave fields blank to inherit store-wide research defaults."
                headerAction={
                  isEditingCompliance ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => setIsEditingCompliance(false)}
                        disabled={isSavingCompliance}
                        className="h-7 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="primary"
                        onClick={handleSaveCompliance}
                        isLoading={isSavingCompliance}
                        className="h-7 text-xs"
                      >
                        Save Compliance
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={startEditingCompliance}
                      className="h-7 text-xs inline-flex items-center gap-1.5"
                    >
                      <PencilSquare className="size-3" />
                      Edit Compliance
                    </Button>
                  )
                }
                contentClassName="p-4"
              >
                {isEditingCompliance ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-ui-fg-base flex items-center gap-1.5">
                          <span>📦</span> Storage & Handling
                        </Label>
                        <span className="text-[10px] text-ui-fg-muted">Leave empty to use store default</span>
                      </div>
                      <Textarea
                        value={editStorageHandling}
                        onChange={(e) => setEditStorageHandling(e.target.value)}
                        placeholder={complianceDefaults.storage_and_handling}
                        rows={2}
                        className="text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-ui-fg-base flex items-center gap-1.5">
                          <span>🔬</span> Intended Use
                        </Label>
                        <span className="text-[10px] text-ui-fg-muted">Leave empty to use store default</span>
                      </div>
                      <Textarea
                        value={editIntendedUse}
                        onChange={(e) => setEditIntendedUse(e.target.value)}
                        placeholder={complianceDefaults.intended_use}
                        rows={2}
                        className="text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-ui-fg-base flex items-center gap-1.5">
                          <span>📄</span> Terms of Sale
                        </Label>
                        <span className="text-[10px] text-ui-fg-muted">Leave empty to use store default</span>
                      </div>
                      <Textarea
                        value={editTermsOfSale}
                        onChange={(e) => setEditTermsOfSale(e.target.value)}
                        placeholder={complianceDefaults.terms_of_sale}
                        rows={2}
                        className="text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-ui-fg-base flex items-center gap-1.5">
                          <span>⚠️</span> Disclaimer
                        </Label>
                        <span className="text-[10px] text-ui-fg-muted">Leave empty to use store default</span>
                      </div>
                      <Textarea
                        value={editDisclaimer}
                        onChange={(e) => setEditDisclaimer(e.target.value)}
                        placeholder={complianceDefaults.disclaimer}
                        rows={2}
                        className="text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-ui-fg-base flex items-center gap-1.5">
                          <span>📦</span> Packaging Options
                        </Label>
                        <span className="text-[10px] text-ui-fg-muted">Leave empty to use store default</span>
                      </div>
                      <Textarea
                        value={editPackagingOptions}
                        onChange={(e) => setEditPackagingOptions(e.target.value)}
                        placeholder={complianceDefaults.packaging_options}
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        key: "storage_and_handling",
                        label: "Storage & Handling",
                        icon: "📦",
                        value: currentCompliance.storage_and_handling || complianceDefaults.storage_and_handling,
                        isCustom: !!currentCompliance.storage_and_handling,
                      },
                      {
                        key: "intended_use",
                        label: "Intended Use",
                        icon: "🔬",
                        value: currentCompliance.intended_use || complianceDefaults.intended_use,
                        isCustom: !!currentCompliance.intended_use,
                      },
                      {
                        key: "terms_of_sale",
                        label: "Terms of Sale",
                        icon: "📄",
                        value: currentCompliance.terms_of_sale || complianceDefaults.terms_of_sale,
                        isCustom: !!currentCompliance.terms_of_sale,
                      },
                      {
                        key: "disclaimer",
                        label: "Disclaimer",
                        icon: "⚠️",
                        value: currentCompliance.disclaimer || complianceDefaults.disclaimer,
                        isCustom: !!currentCompliance.disclaimer,
                      },
                      {
                        key: "packaging_options",
                        label: "Packaging Options",
                        icon: "📦",
                        value: currentCompliance.packaging_options || complianceDefaults.packaging_options,
                        isCustom: !!currentCompliance.packaging_options,
                      },
                    ].map((item) => (
                      <div key={item.key} className="rounded-lg border border-ui-border-base p-3 bg-ui-bg-subtle/40 flex flex-col justify-between gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-ui-fg-base flex items-center gap-1.5">
                            <span>{item.icon}</span> {item.label}
                          </span>
                          <Badge size="small" color={item.isCustom ? "purple" : "grey"}>
                            {item.isCustom ? "Custom" : "Store Default"}
                          </Badge>
                        </div>
                        <Text size="small" className="text-ui-fg-subtle text-xs leading-relaxed line-clamp-3">
                          {item.value}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}
              </AdminCard>
            </Tabs.Content>

            {/* Tab 3: Research Protocols */}
            <Tabs.Content value="protocols">
              <AdminCard
                title="Research Protocols & Reference Standards"
                subtitle={
                  researchProtocolsQuery.isError
                    ? "Protocol status could not be loaded."
                    : `${researchProtocolsQuery.data?.count || 0} versioned research reference(s) for this compound.`
                }
                badge={
                  !researchProtocolsQuery.isError ? (
                    <Badge
                      color={
                        (researchProtocolsQuery.data?.protocols || []).some((p) =>
                          p.revisions.some((r) => r.status === "published"),
                        )
                          ? "green"
                          : "orange"
                      }
                      size="small"
                    >
                      {(researchProtocolsQuery.data?.protocols || []).some((p) =>
                        p.revisions.some((r) => r.status === "published"),
                      )
                        ? "Published Reference Available"
                        : "No Published Protocol"}
                    </Badge>
                  ) : null
                }
                headerAction={
                  <div className="flex items-center gap-2">
                    <Button asChild size="small" variant="secondary" className="h-7 text-xs">
                      <Link to="/research-protocols/new">+ Add protocol</Link>
                    </Button>
                    <Button asChild size="small" variant="secondary" className="h-7 text-xs">
                      <Link to="/research-protocols">Link existing protocol</Link>
                    </Button>
                  </div>
                }
              >
                <div className="flex flex-col gap-y-3">
                  <Text size="xsmall" className="text-ui-fg-subtle leading-relaxed">
                    Research protocols define clinical standards, dosing guidance, reconstitution instructions,
                    and verified third-party laboratory Certificates of Analysis (COA) for this peptide.
                  </Text>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle/30 text-xs">
                    <div>
                      <span className="font-semibold text-ui-fg-base">Manage protocols</span>
                      <p className="text-ui-fg-subtle text-[11px] mt-0.5">
                        Configure customer-facing research instructions and disclaimer consent bundles.
                      </p>
                    </div>
                    <Button asChild size="small" variant="secondary" className="h-7 text-xs">
                      <Link to="/research-protocols">Open Protocol Manager →</Link>
                    </Button>
                  </div>
                </div>
              </AdminCard>
            </Tabs.Content>
          </Tabs>
        </div>

        {/* Right Column: Sticky Advanced Operations Sidebar */}
        <div className="sticky top-4 flex flex-col gap-y-3" aria-label="Advanced operations">
          <ProductOpsSidebar
            product={product}
            readiness={readiness}
            bottleneckAnalysis={bottleneckAnalysis}
            sellableCapacity={sellableCapacity}
            basePriceFormatted={basePriceFormatted}
            onOpenPublicationDrawer={() => setPublicationDrawerOpen(true)}
            onOpenClassificationDrawer={() => setClassificationDrawerOpen(true)}
            onOpenAuditDrawer={() => setAuditDrawerOpen(true)}
          />
        </div>
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

      <Prompt open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete Compounded Product</Prompt.Title>
            <Prompt.Description>
              Are you sure you want to delete &ldquo;{product?.title}&rdquo;? This will permanently remove the product, its variants, and associated inventory configurations. This action cannot be undone.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel disabled={isDeleting}>Cancel</Prompt.Cancel>
            <Prompt.Action
              onClick={handleDeleteProduct}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </div>
  )
}

export default CompoundedProductReadinessPage
