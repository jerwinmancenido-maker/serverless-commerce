"use server"

import {
  getPhilippineAddressAreas,
  getPhilippineBarangays,
  getPhilippineCitiesMunicipalities,
} from "../philippine-address-source"
import type {
  PhilippineAddressArea,
  PhilippineAddressOption,
} from "../../types/philippine-address"

export async function listPhilippineAddressAreas(): Promise<
  PhilippineAddressArea[]
> {
  return getPhilippineAddressAreas()
}

export async function listPhilippineCitiesMunicipalities(
  area: PhilippineAddressArea
): Promise<PhilippineAddressOption[]> {
  return getPhilippineCitiesMunicipalities(area)
}

export async function listPhilippineBarangays(
  cityMunicipalityCode: string
): Promise<PhilippineAddressOption[]> {
  return getPhilippineBarangays(cityMunicipalityCode)
}
