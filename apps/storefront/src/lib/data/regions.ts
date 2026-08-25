"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

const REGION_CACHE_REVALIDATE_SECONDS = 5 * 60

type ListRegionsOptions = {
  bypassCache?: boolean
}

export const listRegions = async (
  options: ListRegionsOptions = {}
) => {
  if (options.bypassCache) {
    return await sdk.client
      .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
        method: "GET",
        cache: "no-store",
      })
      .then(({ regions }) => regions)
  }

  const next = {
    ...(await getCacheOptions("regions")),
    revalidate: REGION_CACHE_REVALIDATE_SECONDS,
  }

  return await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
}

const findRegionByCountryCode = (
  regions: HttpTypes.StoreRegion[],
  countryCode: string
) =>
  regions.find((region) =>
    region.countries?.some((country) => country.iso_2 === countryCode)
  )

export const getRegion = async (countryCode: string) => {
  const normalizedCountryCode = countryCode?.trim().toLowerCase() || "us"

  let regions = await listRegions()

  if (!regions) {
    return null
  }

  const cachedRegion = findRegionByCountryCode(
    regions,
    normalizedCountryCode
  )

  if (cachedRegion) {
    return cachedRegion
  }

  regions = await listRegions({ bypassCache: true })

  return findRegionByCountryCode(regions, normalizedCountryCode)
}
