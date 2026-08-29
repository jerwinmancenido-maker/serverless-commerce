import { definePolicies, PolicyOperation } from "@medusajs/framework/utils"

export const compoundedProductPolicies = definePolicies([
  {
    name: "ReadCompoundedProductGovernance",
    resource: "compounded_product_governance",
    operation: PolicyOperation.read,
    description: "View compounded-product configuration, readiness, and audit history",
  },
  {
    name: "CreateCompoundedProductDrafts",
    resource: "compounded_product_governance",
    operation: PolicyOperation.create,
    description: "Create governed compounded-product configurations and drafts",
  },
  {
    name: "ManageCompoundedProductGovernance",
    resource: "compounded_product_governance",
    operation: PolicyOperation.update,
    description: "Revise recipes, configuration, readiness, and publication state",
  },
])
