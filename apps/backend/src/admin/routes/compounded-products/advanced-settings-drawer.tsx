import {
  Button,
  Checkbox,
  Drawer,
  Input,
  Label,
  Select,
  Text,
} from "@medusajs/ui"

type ReferenceItem = { id: string; label: string }

const ReferenceCheckboxes = ({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string
  items: ReferenceItem[]
  selected: string[]
  onToggle: (id: string) => void
}) => {
  if (!items.length) return null

  return (
    <div className="flex flex-col gap-y-2">
      <Label>{label}</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-x-3 rounded-lg border border-ui-border-base p-3"
          >
            <Checkbox
              checked={selected.includes(item.id)}
              onCheckedChange={() => onToggle(item.id)}
            />
            <Text size="small" leading="compact">
              {item.label}
            </Text>
          </label>
        ))}
      </div>
    </div>
  )
}

export const AdvancedSettingsDrawer = ({
  open,
  onOpenChange,
  handle,
  onHandleChange,
  typeId,
  onTypeChange,
  collectionId,
  onCollectionChange,
  productTypes,
  collections,
  salesChannels,
  selectedSalesChannelIds,
  onToggleSalesChannel,
  categories,
  selectedCategoryIds,
  onToggleCategory,
  tags,
  selectedTagIds,
  onToggleTag,
  currencies,
  currencyCode,
  onCurrencyChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  handle: string
  onHandleChange: (value: string) => void
  typeId: string
  onTypeChange: (value: string) => void
  collectionId: string
  onCollectionChange: (value: string) => void
  productTypes: ReferenceItem[]
  collections: ReferenceItem[]
  salesChannels: ReferenceItem[]
  selectedSalesChannelIds: string[]
  onToggleSalesChannel: (id: string) => void
  categories: ReferenceItem[]
  selectedCategoryIds: string[]
  onToggleCategory: (id: string) => void
  tags: ReferenceItem[]
  selectedTagIds: string[]
  onToggleTag: (id: string) => void
  currencies: string[]
  currencyCode: string
  onCurrencyChange: (value: string) => void
}) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <Drawer.Content>
      <Drawer.Header>
        <Drawer.Title>Advanced product settings</Drawer.Title>
        <Drawer.Description>
          Configure optional catalog routing and merchandising references.
        </Drawer.Description>
      </Drawer.Header>
      <Drawer.Body className="flex flex-col gap-y-5 overflow-y-auto p-6">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="product-handle">Storefront handle</Label>
          <Input
            id="product-handle"
            value={handle}
            onChange={(event) => onHandleChange(event.target.value)}
            placeholder="generated-from-product-title"
          />
        </div>

        {productTypes.length ? (
          <div className="flex flex-col gap-y-2">
            <Label>Product type</Label>
            <Select value={typeId || undefined} onValueChange={onTypeChange}>
              <Select.Trigger>
                <Select.Value placeholder="No product type" />
              </Select.Trigger>
              <Select.Content>
                {productTypes.map((item) => (
                  <Select.Item key={item.id} value={item.id}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        ) : null}

        {collections.length ? (
          <div className="flex flex-col gap-y-2">
            <Label>Collection</Label>
            <Select
              value={collectionId || undefined}
              onValueChange={onCollectionChange}
            >
              <Select.Trigger>
                <Select.Value placeholder="No collection" />
              </Select.Trigger>
              <Select.Content>
                {collections.map((item) => (
                  <Select.Item key={item.id} value={item.id}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        ) : null}

        <ReferenceCheckboxes
          label="Sales channels"
          items={salesChannels}
          selected={selectedSalesChannelIds}
          onToggle={onToggleSalesChannel}
        />
        <ReferenceCheckboxes
          label="Categories"
          items={categories}
          selected={selectedCategoryIds}
          onToggle={onToggleCategory}
        />
        <ReferenceCheckboxes
          label="Tags"
          items={tags}
          selected={selectedTagIds}
          onToggle={onToggleTag}
        />
        {currencies.length > 1 ? (
          <div className="flex flex-col gap-y-2">
            <Label>Pricing currency</Label>
            <Select
              value={currencyCode || undefined}
              onValueChange={onCurrencyChange}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select pricing currency" />
              </Select.Trigger>
              <Select.Content>
                {currencies.map((currency) => (
                  <Select.Item key={currency} value={currency}>
                    {currency}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              This currency applies to every product combination.
            </Text>
          </div>
        ) : null}
      </Drawer.Body>
      <Drawer.Footer>
        <Drawer.Close asChild>
          <Button size="small">Done</Button>
        </Drawer.Close>
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer>
)
