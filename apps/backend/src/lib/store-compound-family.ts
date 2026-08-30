import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

type FamilyRecord = {
  id: string
  key: string
  name: string
  description: string | null
  status: "active" | "archived"
}

type RegistrationRecord = {
  product_id: string
  compound_format: {
    id: string
    key: string
    name: string
    description: string | null
    status: "active" | "archived"
  } | null
  compound_family?: FamilyRecord | null
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
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const registrations: RegistrationRecord[] = []
  const pageSize = 100
  let skip = 0

  while (true) {
    const { data } = await query.graph({
      entity: "compounded_product_registration",
      fields: [
        "product_id",
        "compound_format.id",
        "compound_format.key",
        "compound_format.name",
        "compound_format.description",
        "compound_format.status",
      ],
      filters: {
        state: "published",
        compound_family: { id: family.id },
        compound_format: { status: "active" },
      },
      pagination: {
        take: pageSize,
        skip,
        order: { product_id: "ASC" },
      },
    })
    const page = data as RegistrationRecord[]

    registrations.push(...page)

    if (page.length < pageSize) {
      break
    }

    skip += page.length
  }
  const members = registrations.map((registration) => ({
    product_id: registration.product_id,
    presentation: {
      id: registration.compound_format!.id,
      key: registration.compound_format!.key,
      name: registration.compound_format!.name,
      description: registration.compound_format!.description,
    },
  }))

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
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "compounded_product_family",
    fields: ["id", "key", "name", "description", "status"],
    filters: { key, status: "active" },
    pagination: { take: 1, skip: 0 },
  })
  const family = (data as FamilyRecord[])[0]

  if (!family) {
    throw familyNotFound()
  }

  return loadFamilyMembers(scope, family)
}

export async function retrieveStoreCompoundFamilyByProductId(
  scope: MedusaContainer,
  productId: string,
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "compounded_product_registration",
    fields: [
      "product_id",
      "compound_family.id",
      "compound_family.key",
      "compound_family.name",
      "compound_family.description",
      "compound_family.status",
    ],
    filters: {
      product_id: productId,
      state: "published",
      compound_family: { status: "active" },
    },
    pagination: { take: 1, skip: 0 },
  })
  const registration = (data as RegistrationRecord[])[0]

  if (!registration?.compound_family) {
    throw familyNotFound()
  }

  return loadFamilyMembers(scope, registration.compound_family)
}
