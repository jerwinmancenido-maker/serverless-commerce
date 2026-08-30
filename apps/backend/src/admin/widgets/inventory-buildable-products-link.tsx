import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ArrowUpRightOnBox } from "@medusajs/icons"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"

const InventoryBuildableProductsLink = () => (
  <Container className="flex items-center justify-between gap-4 px-6 py-4">
    <div>
      <Heading level="h2">Buildable products</Heading>
      <Text size="small" className="text-ui-fg-subtle">
        Review recipe completeness, calculated stock, and limiting components.
      </Text>
    </div>
    <Button asChild size="small" variant="secondary">
      <Link to="/buildable-products">
        Open report
        <ArrowUpRightOnBox />
      </Link>
    </Button>
  </Container>
)

export const config = defineWidgetConfig({
  zone: "inventory_item.list",
})

export default InventoryBuildableProductsLink
