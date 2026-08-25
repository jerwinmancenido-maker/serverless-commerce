import assert from "node:assert/strict"
import test from "node:test"

import {
  getPhilippineAddressAreas,
  getPhilippineBarangays,
  getPhilippineCitiesMunicipalities,
} from "./philippine-address-source.ts"

test("includes provinces and NCR as selectable address areas", () => {
  const areas = getPhilippineAddressAreas()

  assert.ok(areas.some((area) => area.name === "Camarines Norte"))
  assert.ok(
    areas.some((area) => area.name === "NCR" && area.kind === "region")
  )
})

test("includes independent cities with their delivery province", () => {
  const cebu = getPhilippineAddressAreas().find(
    (area) => area.name === "Cebu"
  )

  assert.ok(cebu)
  assert.ok(
    getPhilippineCitiesMunicipalities(cebu).some(
      (municipality) => municipality.name === "Cebu City"
    )
  )
})

test("flattens Manila districts into distinct barangay choices", () => {
  const ncr = getPhilippineAddressAreas().find((area) => area.name === "NCR")

  assert.ok(ncr)
  const manila = getPhilippineCitiesMunicipalities(ncr).find(
    (municipality) => municipality.name === "Manila City"
  )

  assert.ok(manila)
  const barangays = getPhilippineBarangays(manila.code)

  assert.ok(barangays.length > 800)
  assert.ok(barangays.some((barangay) => barangay.name.includes("(Binondo)")))
})
