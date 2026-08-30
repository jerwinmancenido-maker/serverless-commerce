import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  hydrateCompoundFamily,
  retrieveCompoundFamilyByKey,
} from "@lib/data/compound-families"
import { getRegion } from "@lib/data/regions"
import { Heading, Text } from "@modules/common/components/ui"
import ProductPreview from "@modules/products/components/product-preview"

type Props = {
  params: Promise<{ countryCode: string; familyKey: string }>
}

async function loadFamily(params: Awaited<Props["params"]>) {
  const family = await retrieveCompoundFamilyByKey(params.familyKey)
  if (!family) {
    notFound()
  }
  return hydrateCompoundFamily(family, params.countryCode)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params
  const family = await retrieveCompoundFamilyByKey(resolved.familyKey)

  if (!family) {
    return {}
  }

  return {
    title: family.name,
    description: family.description || `Explore ${family.name} presentations.`,
  }
}

export default async function CompoundFamilyPage({ params }: Props) {
  const resolved = await params
  const [family, region] = await Promise.all([
    loadFamily(resolved),
    getRegion(resolved.countryCode),
  ])

  if (!region || !family.members.length) {
    notFound()
  }

  return (
    <div className="content-container py-12 small:py-16">
      <header className="mb-10 max-w-2xl">
        <Text className="text-small-regular text-ui-fg-subtle">
          Compound family
        </Text>
        <Heading level="h1" className="mt-2 text-3xl leading-10">
          {family.name}
        </Heading>
        {family.description ? (
          <Text className="mt-3 text-ui-fg-subtle">
            {family.description}
          </Text>
        ) : null}
      </header>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-8 small:grid-cols-3 medium:grid-cols-4">
        {family.members.map((member) => (
          <li key={member.product.id}>
            <Text className="mb-2 text-small-regular text-ui-fg-subtle">
              {member.presentation.name}
            </Text>
            <ProductPreview product={member.product} region={region} />
          </li>
        ))}
      </ul>
    </div>
  )
}
