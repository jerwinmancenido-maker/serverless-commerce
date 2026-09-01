export const SUPPORT_AGENT_RESOURCES = [
  "customer_support",
  "customer_support_reply",
  "customer_support_note",
  "customer_support_update",
  "customer_support_saved_responses",
  "customer_support_attachment",
] as const

export const SUPPORT_MANAGER_RESOURCES = [
  ...SUPPORT_AGENT_RESOURCES,
  "customer_support_assign",
  "customer_support_settings",
  "customer_support_reporting",
] as const

export const planSupportRolePolicySync = (
  current: Array<{ id: string; policy_id: string }>,
  desiredPolicyIds: string[],
) => {
  const desired = new Set(desiredPolicyIds)
  const currentPolicyIds = new Set(current.map((link) => link.policy_id))

  return {
    createPolicyIds: desiredPolicyIds.filter(
      (policyId) => !currentPolicyIds.has(policyId),
    ),
    deleteRolePolicyIds: current
      .filter((link) => !desired.has(link.policy_id))
      .map((link) => link.id),
  }
}
