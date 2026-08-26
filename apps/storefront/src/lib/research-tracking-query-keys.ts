export const researchTrackingQueryKeys = {
  customer: ["research-tracking", "customer", "me"] as const,
  routines: {
    list: ["research-tracking", "customer", "me", "routines", "list"] as const,
    detail: (routineId: string) =>
      [
        "research-tracking",
        "customer",
        "me",
        "routines",
        "detail",
        routineId,
      ] as const,
  },
  occurrences: {
    list: (from: string, to: string) =>
      [
        "research-tracking",
        "customer",
        "me",
        "occurrences",
        "list",
        from,
        to,
      ] as const,
    detail: (occurrenceId: string) =>
      [
        "research-tracking",
        "customer",
        "me",
        "occurrences",
        "detail",
        occurrenceId,
      ] as const,
  },
  logs: {
    list: ["research-tracking", "customer", "me", "logs", "list"] as const,
    detail: (logId: string) =>
      [
        "research-tracking",
        "customer",
        "me",
        "logs",
        "detail",
        logId,
      ] as const,
  },
  supplies: {
    list: ["research-tracking", "customer", "me", "supplies", "list"] as const,
    detail: (supplyId: string) =>
      [
        "research-tracking",
        "customer",
        "me",
        "supplies",
        "detail",
        supplyId,
      ] as const,
  },
}
