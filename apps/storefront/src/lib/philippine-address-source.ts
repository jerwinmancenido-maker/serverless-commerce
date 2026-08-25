import {
  getAllMunicipalities,
  getAllProvinces,
  getAllRegions,
  getBarangaysByMunicipality,
  getMunicipalitiesByProvince,
  getPostalCodesByMunicipality,
  getProvincesByRegion,
} from "@aivangogh/ph-address"
import type {
  PhilippineAddressArea,
  PhilippineAddressOption,
} from "../types/philippine-address"

const sortByName = <T extends { name: string }>(items: T[]) =>
  items.sort((left, right) => left.name.localeCompare(right.name, "en-PH"))

const normalizeProvinceName = (value: string) =>
  value
    .replace(/^Province of\s+/i, "")
    .toLocaleLowerCase("en-PH")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

const toOption = (item: {
  name: string
  psgcCode: string
}): PhilippineAddressOption => ({
  code: item.psgcCode,
  name: item.name,
})

const getIndependentCitiesForProvince = (provinceName: string) => {
  const normalizedProvinceName = normalizeProvinceName(provinceName)

  return getAllMunicipalities().filter((municipality) => {
    if (municipality.provinceCode !== municipality.psgcCode) {
      return false
    }

    return getPostalCodesByMunicipality(municipality.psgcCode).some(
      (postalCode) =>
        normalizeProvinceName(postalCode.provinceName) ===
        normalizedProvinceName
    )
  })
}

export const getPhilippineAddressAreas = (): PhilippineAddressArea[] => {
  const provinces = getAllProvinces()
  const regionsWithoutProvinces = getAllRegions().filter(
    (region) => getProvincesByRegion(region.psgcCode).length === 0
  )

  return sortByName([
    ...provinces.map((province) => ({
      ...toOption(province),
      kind: "province" as const,
    })),
    ...regionsWithoutProvinces.map((region) => ({
      code: region.psgcCode,
      name: region.designation || region.name,
      kind: "region" as const,
    })),
  ])
}

export const getPhilippineCitiesMunicipalities = (
  area: PhilippineAddressArea
): PhilippineAddressOption[] => {
  const municipalities = getMunicipalitiesByProvince(area.code)
  const independentCities =
    area.kind === "province" ? getIndependentCitiesForProvince(area.name) : []
  const uniqueMunicipalities = new Map(
    [...municipalities, ...independentCities].map((municipality) => [
      municipality.psgcCode,
      municipality,
    ])
  )

  return sortByName(
    Array.from(uniqueMunicipalities.values()).map(toOption)
  )
}

export const getPhilippineBarangays = (
  cityMunicipalityCode: string
): PhilippineAddressOption[] => {
  const directBarangays = getBarangaysByMunicipality(cityMunicipalityCode)

  if (directBarangays.length) {
    return sortByName(directBarangays.map(toOption))
  }

  const districts = getMunicipalitiesByProvince(cityMunicipalityCode)
  const districtBarangays = districts.flatMap((district) =>
    getBarangaysByMunicipality(district.psgcCode).map((barangay) => ({
      code: barangay.psgcCode,
      name: `${barangay.name} (${district.name})`,
    }))
  )

  return sortByName(districtBarangays)
}
