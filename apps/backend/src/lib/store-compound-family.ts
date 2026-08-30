import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"

import { COMPOUNDED_PRODUCT_MODULE } from "../modules/compounded-product"
import type CompoundedProductModuleService from "../modules/compounded-product/service"

type FamilyRecord = {
  id: string
  key: string
  name: string
  description: string | null
  status: "active" | "archived"
}

type RegistrationRecord = {
  product_id: string
  compound_family_id?: string | null
  compound_format_id?: string | null
}

type FormatRecord = {
  id: string
  key: string
  name: string
  description: string | null
  status: "active" | "archived"
}

export type StoreCompoundFamily = {
  id: string
  key: string
  name: string
  description: string | null
  members: Array<{
    product_id: string
    presentation: {
      id: string
      key: string
      name: string
      description: string | null
    }
  }>
}

const familyNotFound = () =>
  new MedusaError(
    MedusaError.Types.NOT_FOUND,
    "Compound family was not found",
  )

async function loadFamilyMembers(
  scope: MedusaContainer,
  family: FamilyRecord,
): Promise<StoreCompoundFamily> {
  const service = scope.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const registrations: RegistrationRecord[] = []
  const pageSize = 100
  let skip = 0

  while (true) {
    const page = (await service.listGovernedProductRegistrations(
      {
        state: "published",
        compound_family_id: family.id,
      },
      {
        take: pageSize,
        skip,
        order: { product_id: "ASC" },
      },
    )) as RegistrationRecord[]

    registrations.push(...page)

    if (page.length < pageSize) {
      break
    }

    skip += page.length
  }
  const formatIds = Array.from(
    new Set(
      registrations.flatMap((registration) =>
        registration.compound_format_id
          ? [registration.compound_format_id]
          : [],
      ),
    ),
  )
  const formats = formatIds.length
    ? ((await service.listCompoundProductFormats({
        id: formatIds,
        status: "active",
      })) as FormatRecord[])
    : []
  const formatsById = new Map(formats.map((format) => [format.id, format]))
  const members = registrations.flatMap((registration) => {
    const format = registration.compound_format_id
      ? formatsById.get(registration.compound_format_id)
      : undefined

    return format
      ? [
          {
            product_id: registration.product_id,
            presentation: {
              id: format.id,
              key: format.key,
              name: format.name,
              description: format.description,
            },
          },
        ]
      : []
  })

  if (!members.length) {
    throw familyNotFound()
  }

  return {
    id: family.id,
    key: family.key,
    name: family.name,
    description: family.description,
    members,
  }
}

export async function retrieveStoreCompoundFamilyByKey(
  scope: MedusaContainer,
  key: string,
) {
  const service = scope.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const [family] = (await service.listCompoundFamilies(
    { key, status: "active" },
    { take: 1, skip: 0 },
  )) as FamilyRecord[]

  if (!family) {
    throw familyNotFound()
  }

  return loadFamilyMembers(scope, family)
}

export async function retrieveStoreCompoundFamilyByProductId(
  scope: MedusaContainer,
  productId: string,
) {
  const service = scope.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const [registration] = (await service.listGovernedProductRegistrations(
    {
      product_id: productId,
      state: "published",
    },
    { take: 1, skip: 0 },
  )) as RegistrationRecord[]

  if (!registration?.compound_family_id) {
    throw familyNotFound()
  }

  const [family] = (await service.listCompoundFamilies(
    { id: registration.compound_family_id, status: "active" },
    { take: 1, skip: 0 },
  )) as FamilyRecord[]

  if (!family) {
    throw familyNotFound()
  }

  return loadFamilyMembers(scope, family)
}
