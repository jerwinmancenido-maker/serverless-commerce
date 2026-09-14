import { Metadata } from "next"

import CatalogCTA from "@modules/home/components/catalog-cta"
import FeaturedProducts from "@modules/home/components/featured-products"
import FlagshipShowcase from "@modules/home/components/flagship-showcase"
import Hero from "@modules/home/components/hero"
import ResearchSuiteFeatures from "@modules/home/components/research-suite-features"
import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { storeConfig } from "@lib/store-config"

export const metadata: Metadata = {
  title: storeConfig.name,
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const categories = (await listCategories()).filter(
    (category) => !category.parent_category
  )

  if (!region) {
    return null
  }

  return (
    <>
      <Hero />
      <FlagshipShowcase />
      <ResearchSuiteFeatures />
      <FeaturedProducts categories={categories} region={region} />
      <CatalogCTA />
    </>
  )
}
