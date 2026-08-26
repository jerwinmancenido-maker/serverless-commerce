import { readFileSync } from "node:fs"
import { join } from "node:path"

import { activatePurchasedResearchSupplyWorkflow } from "../../../workflows/activate-purchased-research-supply"

const backendRoot = process.cwd()
const apiRoot = join(
  backendRoot,
  "src/api/store/customers/me/research-tracking",
)

const routePaths = [
  "purchased-items/route.ts",
  "purchased-items/activate/route.ts",
  "materials/route.ts",
] as const

describe("RT-4 purchased supplies source boundary", () => {
  it("composes a runnable activation workflow", () => {
    expect(activatePurchasedResearchSupplyWorkflow.run).toEqual(
      expect.any(Function),
    )
    expect(activatePurchasedResearchSupplyWorkflow.runAsStep).toEqual(
      expect.any(Function),
    )
  })

  it.each(routePaths)("keeps %s authenticated and private", (path) => {
    const source = readFileSync(join(apiRoot, path), "utf8")

    expect(source).toContain("AuthenticatedMedusaRequest")
    expect(source).toContain("setResearchPrivateNoStore(res)")
  })

  it("keeps the activation route thin and workflow-owned", () => {
    const source = readFileSync(
      join(apiRoot, "purchased-items/activate/route.ts"),
      "utf8",
    )

    expect(source).toContain("activatePurchasedResearchSupplyWorkflow")
    expect(source).toContain("req.auth_context.actor_id")
    expect(source).not.toMatch(/validatedBody\.(customer|profile|variant)_id/)
    expect(source).not.toMatch(/service\.(create|update|delete)/)
    expect(source).toContain("purchasedActivationConflictReason")
    expect(source).toContain("res.status(409).json")
    expect(source).toContain("reason,")
  })

  it("uses workflow locks and compensating mutation steps", () => {
    const workflow = readFileSync(
      join(backendRoot, "src/workflows/activate-purchased-research-supply.ts"),
      "utf8",
    )
    const steps = readFileSync(
      join(
        backendRoot,
        "src/workflows/steps/activate-purchased-research-supply.ts",
      ),
      "utf8",
    )

    expect(workflow).toContain("acquireLockStep")
    expect(workflow).toContain("releaseLockStep")
    expect(workflow).toContain("research-supply-request:")
    expect(steps).toContain("deleteTrackedMaterials")
    expect(steps).toContain("deletePurchasedSupplyActivation")
    expect(steps).toContain("deleteResearchSupplyActivationRequests")
  })

  it("persists supply, activation, and first request in one module transaction", () => {
    const service = readFileSync(
      join(backendRoot, "src/modules/research-tracking/service.ts"),
      "utf8",
    )

    expect(service).toContain("@InjectTransactionManager()")
    expect(service).toContain("createPurchasedSupplyActivation")
    expect(service).toContain("createResearchSupplies")
    expect(service).toContain("createResearchSupplyActivations")
    expect(service).toContain("createResearchSupplyActivationRequests")
  })

  it("registers PostgreSQL locking without changing migration files", () => {
    const config = readFileSync(join(backendRoot, "medusa-config.ts"), "utf8")

    expect(config).toContain("@medusajs/medusa/locking-postgres")
    expect(config).toContain("is_default: true")
  })

  it("defines immutable activation evidence uniqueness", () => {
    const model = readFileSync(
      join(
        backendRoot,
        "src/modules/research-tracking/models/research-supply-activation.ts",
      ),
      "utf8",
    )

    expect(model).toContain('["source_order_line_item_id"], unique: true')
    expect(model).toContain(
      '["profile_id", "idempotency_key"], unique: true',
    )
    expect(model).toContain('["supply_id"], unique: true')

    const requestModel = readFileSync(
      join(
        backendRoot,
        "src/modules/research-tracking/models/research-supply-activation-request.ts",
      ),
      "utf8",
    )

    expect(requestModel).toContain(
      '["profile_id", "idempotency_key"], unique: true',
    )
    expect(requestModel).toContain("request_fingerprint_sha256")
  })

  it("paginates the owned order-item projection rather than parent orders", () => {
    const query = readFileSync(
      join(
        backendRoot,
        "src/modules/research-tracking/queries/purchased-supplies.ts",
      ),
      "utf8",
    )

    expect(query).toContain('entity: "order_item"')
    expect(query).toContain("filters: { id: ownedOrderItemIds }")
    expect(query).toContain("count: metadata?.count ?? records.length")
  })
})
