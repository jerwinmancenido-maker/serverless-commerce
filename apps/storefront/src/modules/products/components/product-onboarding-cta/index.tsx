/**
 * @file    apps/storefront/src/modules/products/components/product-onboarding-cta/index.tsx
 * @module  ProductOnboardingCta (Storefront Products Module)
 * @purpose Renders administrator onboarding banner linking to Medusa 2.x admin dashboard.
 * @contracts
 *   Component: ProductOnboardingCta
 */

import { Button, Container, Text } from "@modules/common/components/ui"
import { cookies as nextCookies } from "next/headers"

async function ProductOnboardingCta() {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  if (!isOnboarding) {
    return null
  }

  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

  return (
    <Container className="max-w-4xl h-full bg-ui-bg-subtle w-full p-8">
      <div className="flex flex-col gap-y-4 center">
        <Text className="text-ui-fg-base text-xl">
          Your demo product was successfully created!
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          You can now continue setting up your store in the admin.
        </Text>
        <a href={`${backendUrl}/app/orders?onboarding_step=create_order_nextjs`}>
          <Button className="w-full">Continue setup in admin</Button>
        </a>
      </div>
    </Container>
  )
}

export default ProductOnboardingCta
