import type { MedusaContainer } from "@medusajs/framework"
import type { IRbacModuleService } from "@medusajs/framework/types"
import {
  createRbacRolesWorkflow,
  deleteRbacRolePoliciesWorkflow,
  updateRbacRolesWorkflow,
} from "@medusajs/core-flows"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"

import {
  SUPPORT_AGENT_RESOURCES,
  SUPPORT_MANAGER_RESOURCES,
  planSupportRolePolicySync,
} from "../modules/customer-support/role-configuration"

export default async function configureSupportRoles({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const rbac = container.resolve<IRbacModuleService>(Modules.RBAC)
  const policies = await rbac.listRbacPolicies({}, { take: 500 })
  const roles = await rbac.listRbacRoles({}, { take: 250 })
  const definitions = [
    {
      name: "Support Agent",
      description: "Handles private customer support conversations without management access.",
      resources: new Set<string>(SUPPORT_AGENT_RESOURCES),
    },
    {
      name: "Support Manager",
      description: "Manages the complete private customer support operation.",
      resources: new Set<string>(SUPPORT_MANAGER_RESOURCES),
    },
  ]

  for (const definition of definitions) {
    const policyIds = policies
      .filter((policy: any) => definition.resources.has(policy.resource))
      .map((policy: any) => policy.id)
    if (!policyIds.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Support policies were not discovered before configuring ${definition.name}`,
      )
    }
    const existing = roles.find((role: any) => role.name === definition.name)
    if (existing) {
      const currentRolePolicies = await rbac.listRbacRolePolicies(
        { role_id: existing.id },
        { take: 500 },
      )
      const policySync = planSupportRolePolicySync(
        currentRolePolicies as Array<{ id: string; policy_id: string }>,
        policyIds,
      )
      if (policySync.deleteRolePolicyIds.length) {
        await deleteRbacRolePoliciesWorkflow(container).run({
          input: { role_policy_ids: policySync.deleteRolePolicyIds },
        })
      }
      await updateRbacRolesWorkflow(container).run({
        input: {
          selector: { id: existing.id },
          update: {
            description: definition.description,
            ...(policySync.createPolicyIds.length
              ? { policy_ids: policySync.createPolicyIds }
              : {}),
          },
        },
      })
    } else {
      await createRbacRolesWorkflow(container).run({
        input: {
          roles: [
            {
              name: definition.name,
              description: definition.description,
              policy_ids: policyIds,
            },
          ],
        },
      })
    }
  }
  logger.info("Configured Support Agent and Support Manager roles. Assign users in Admin Settings.")
}
