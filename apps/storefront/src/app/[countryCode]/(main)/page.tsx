import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
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
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts categories={categories} region={region} />
        </ul>
      </div>
    </>
  )
}
