/**
 * @file    apps/backend/src/api/admin/customer-support/staff/route.ts
 * @module  AdminCustomerSupportStaffRoute (Customer Support Module)
 * @purpose Retrieve internal support agents and managers for assignment workflows.
 * @contracts
 *   API: GET /admin/customer-support/staff
 */

import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: users } = await query.graph({
    entity: "user",
    fields: ["id", "email", "first_name", "last_name", "rbac_roles.id", "rbac_roles.name"],
    pagination: { take: 250 },
  })
  res.json({
    staff: (users || [])
      .filter((user: any) =>
        user.rbac_roles?.some((role: any) =>
          ["Support Agent", "Support Manager"].includes(role.name),
        ),
      )
      .map((user: any) => ({
        id: user.id,
        email: user.email,
        name: [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email,
        roles: (user.rbac_roles || []).map((role: any) => role.name),
      })),
  })
}
