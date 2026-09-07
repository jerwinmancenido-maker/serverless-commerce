export type BundleComponentSpec = {
  handle: string
  title: string
  strength: string
  quantity: number
  individualPrice: number
}

export type BundleSpec = {
  components: BundleComponentSpec[]
  sumPrice: number
  bundlePrice: number
  savingsAmount: number
}

export type ConstituentInventoryData = {
  stocked: number
  reserved: number
  manageInventory?: boolean
}

export type ConstituentStockInfo = {
  handle: string
  title: string
  strength: string
  requiredQuantity: number
  stockedQuantity: number
  reservedQuantity: number
  availableStock: number
  capacity: number
  isBottleneck: boolean
  status: "in_stock" | "low_stock" | "out_of_stock" | "untracked"
}

export type BundleBuildableStatus = {
  bundleHandle: string
  sku: string
  buildableQuantity: number
  isAvailable: boolean
  limitingComponent: ConstituentStockInfo | null
  constituents: ConstituentStockInfo[]
  hasUntrackedComponents: boolean
}

export function calculateConstituentCapacity(
  availableQuantity: number,
  requiredQuantity: number,
): number {
  if (requiredQuantity <= 0) return 0
  if (availableQuantity <= 0) return 0
  return Math.floor(availableQuantity / requiredQuantity)
}

export function determineConstituentStockStatus(
  availableQuantity: number,
  isManaged = true,
): "in_stock" | "low_stock" | "out_of_stock" | "untracked" {
  if (!isManaged) return "untracked"
  if (availableQuantity <= 0) return "out_of_stock"
  if (availableQuantity <= 5) return "low_stock"
  return "in_stock"
}

export function resolveBundleBuildableStatus(
  bundleSku: string,
  bundleHandle: string,
  components: BundleComponentSpec[],
  stockData: Record<string, ConstituentInventoryData>,
): BundleBuildableStatus {
  if (!components || components.length === 0) {
    return {
      bundleHandle,
      sku: bundleSku,
      buildableQuantity: 0,
      isAvailable: false,
      limitingComponent: null,
      constituents: [],
      hasUntrackedComponents: false,
    }
  }

  let hasUntracked = false
  const constituentInfos: ConstituentStockInfo[] = []

  for (const comp of components) {
    const data = stockData[comp.handle] || stockData[comp.title.toLowerCase()]
    const isManaged = data?.manageInventory ?? (data !== undefined)

    if (!data || data.manageInventory === false) {
      hasUntracked = true
    }

    const stocked = data?.stocked ?? 0
    const reserved = data?.reserved ?? 0
    const available = Math.max(0, stocked - reserved)
    const required = comp.quantity > 0 ? comp.quantity : 1
    const capacity = isManaged
      ? calculateConstituentCapacity(available, required)
      : 999

    const status = determineConstituentStockStatus(available, isManaged)

    constituentInfos.push({
      handle: comp.handle,
      title: comp.title,
      strength: comp.strength,
      requiredQuantity: required,
      stockedQuantity: stocked,
      reservedQuantity: reserved,
      availableStock: available,
      capacity,
      isBottleneck: false,
      status,
    })
  }

  // Identify minimum capacity across all managed components
  const managedConstituents = constituentInfos.filter(
    (c) => c.status !== "untracked",
  )

  let buildableQuantity = 0
  let limitingComponent: ConstituentStockInfo | null = null

  if (managedConstituents.length > 0) {
    const minCapacity = Math.min(...managedConstituents.map((c) => c.capacity))
    buildableQuantity = minCapacity

    // Find the first constituent that hit this minimum capacity
    const bottleneck = managedConstituents.find((c) => c.capacity === minCapacity)
    if (bottleneck) {
      bottleneck.isBottleneck = true
      limitingComponent = bottleneck
    }
  } else {
    // If all components are untracked (backorder allowed in dev mode), treat as available
    buildableQuantity = 999
  }

  const isAvailable = buildableQuantity > 0

  return {
    bundleHandle,
    sku: bundleSku,
    buildableQuantity,
    isAvailable,
    limitingComponent,
    constituents: constituentInfos,
    hasUntrackedComponents: hasUntracked,
  }
}

export function getBundleSavingsBreakdown(
  sumPrice: number,
  bundlePrice: number,
): {
  savingsAmount: number
  savingsPercent: number
} {
  const savingsAmount = Math.max(0, sumPrice - bundlePrice)
  const savingsPercent =
    sumPrice > 0 ? Math.round((savingsAmount / sumPrice) * 100) : 0

  return {
    savingsAmount,
    savingsPercent,
  }
}
