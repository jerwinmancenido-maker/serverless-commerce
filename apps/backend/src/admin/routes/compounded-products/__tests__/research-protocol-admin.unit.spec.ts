import { readFileSync } from "node:fs"
import { join } from "node:path"

const routesRoot = join(__dirname, "..", "..")
const srcRoot = join(__dirname, "..", "..", "..", "..")

describe("research protocol Admin", () => {
  it("enters protocol management through the peptide product detail page", () => {
    const source = readFileSync(
      join(routesRoot, "compounded-products/[id]/page.tsx"),
      "utf8",
    )

    expect(source).toContain("Research protocols")
    expect(source).toContain("Add protocol")
    expect(source).toContain("Manage protocols")
    expect(source).toContain("Link existing protocol")
    expect(source).toContain("/research-protocols")
  })

  it("provides a dedicated central Research Protocols navigation page", () => {
    const source = readFileSync(
      join(routesRoot, "research-protocols/page.tsx"),
      "utf8",
    )
    const route = readFileSync(
      join(srcRoot, "api/admin/research-protocols/route.ts"),
      "utf8",
    )

    expect(source).toContain('label: "Research Protocols"')
    expect(source).toContain("Add protocol")
    expect(source).toContain("No research protocols yet")
    expect(source).toContain('/research-protocols/new')
    expect(source).toContain("Latest revision")
    expect(source).toContain("Compatible products")
    expect(source).toContain("Preview")
    expect(source).not.toContain("FocusModal")
    expect(source).not.toContain("CustomerPreviewDrawer")
    expect(source).toContain("/preview")
    expect(route).toContain("listAndCountResearchProtocolSeries")
    expect(route).toContain('entity: "product"')

    const creationPage = readFileSync(
      join(routesRoot, "research-protocols/new/page.tsx"),
      "utf8",
    )
    expect(creationPage).toContain("Create research guide")
    expect(creationPage).toContain("link compatible products later")
  })

  it("provides structured versioned customer protocol editing", () => {
    const fields = readFileSync(
      join(routesRoot, "compounded-products/protocol-editor-fields.tsx"),
      "utf8",
    )
    const editor = readFileSync(
      join(routesRoot, "research-protocols/[protocolId]/page.tsx"),
      "utf8",
    )

    expect(fields).toContain("Materials and equipment")
    expect(fields).toContain("Concentration context")
    expect(fields).toContain("Conversion basis")
    expect(fields).toContain("Evidence and references")
    expect(fields).toContain("Reference quantities")
    const customerFields = readFileSync(
      join(routesRoot, "compounded-products/protocol-customer-content-fields.tsx"),
      "utf8",
    )
    expect(customerFields).toContain("Quick-reference cards")
    expect(customerFields).toContain("Protocol levels")
    expect(customerFields).toContain("Calculator")
    expect(customerFields).toContain("Detailed sections")
    expect(editor).toContain("Published revisions are immutable")
    expect(editor).toContain("Create new draft revision")
    expect(editor).toContain("Withdraw published revision")
    expect(editor).toContain("Preview customer view")
    expect(editor).toContain("Activity history")
    expect(editor).toContain("Archive guide")

    const productDrawer = readFileSync(join(routesRoot, "research-protocols/compatible-products.tsx"), "utf8")
    const previewPage = readFileSync(join(routesRoot, "research-protocols/[protocolId]/preview/page.tsx"), "utf8")
    expect(productDrawer).toContain("<Drawer")
    expect(productDrawer).not.toContain("FocusModal")
    expect(previewPage).toContain("Customer preview")
    expect(previewPage).not.toContain("<Drawer")
  })

  it("aligns the Quick overview field with its publication requirement", () => {
    const fields = readFileSync(
      join(routesRoot, "compounded-products/protocol-editor-fields.tsx"),
      "utf8",
    )
    const workflowSteps = readFileSync(
      join(srcRoot, "workflows/steps/manage-research-protocol.ts"),
      "utf8",
    )

    expect(fields).toContain("<Label>Short summary</Label>")
    expect(fields).toContain('value={value.summary || ""}')
    expect(fields).toContain("<Label>Quick overview</Label>")
    expect(fields).toContain(
      'value={value.content.intended_application || ""}',
    )
    expect(fields).not.toContain("<Label>Research scope details</Label>")
    expect(workflowSteps).toContain(
      "content.intended_application?.trim()",
    )
    expect(workflowSteps).toContain('"Add a quick overview"')
  })

  it("registers permission policies and mutation workflows", () => {
    const middleware = readFileSync(
      join(srcRoot, "api/admin/research-protocols/middlewares.ts"),
      "utf8",
    )
    const workflows = readFileSync(
      join(srcRoot, "workflows/manage-research-protocol.ts"),
      "utf8",
    )
    const workflowSteps = readFileSync(
      join(srcRoot, "workflows/steps/manage-research-protocol.ts"),
      "utf8",
    )

    expect(middleware).toContain("resource: \"research_protocol\"")
    expect(middleware).toContain("PolicyOperation.read")
    expect(middleware).toContain("PolicyOperation.create")
    expect(middleware).toContain("PolicyOperation.update")
    expect(workflows).toContain("createResearchProtocolWorkflow")
    expect(workflows).toContain("publishResearchProtocolWorkflow")
    expect(workflows).toContain("withdrawResearchProtocolWorkflow")
    expect(workflows).toContain("linkResearchProtocolProductWorkflow")
    expect(workflows).toContain("unlinkResearchProtocolProductWorkflow")
    expect(workflows).toContain("archiveResearchProtocolWorkflow")
    expect(workflows).toContain("publication_readiness_evaluated")
    expect(middleware).toContain("AdminArchiveResearchProtocol")
    expect(workflowSteps).toContain("function parseRequest")
    expect(workflowSteps).toContain('["actorId", "series_id", "product_link_id"]')
  })

  it("binds an opaque historical protocol revision to each eligible order line", () => {
    const subscriber = readFileSync(
      join(srcRoot, "subscribers/bind-order-research-protocols.ts"),
      "utf8",
    )
    const bindingStep = readFileSync(
      join(srcRoot, "workflows/steps/bind-order-research-protocols.ts"),
      "utf8",
    )
    const tokenRoute = readFileSync(
      join(srcRoot, "api/store/research-protocol-access/[token]/route.ts"),
      "utf8",
    )
    const customerRoute = readFileSync(
      join(
        srcRoot,
        "api/store/customers/me/orders/[id]/research-protocols/route.ts",
      ),
      "utf8",
    )

    expect(subscriber).toContain('event: "order.placed"')
    expect(bindingStep).toContain("randomBytes(32)")
    expect(bindingStep).toContain('status: "published"')
    expect(bindingStep).toContain("revision_number_snapshot")
    expect(bindingStep).toContain("for (const link of eligible)")
    expect(bindingStep).not.toContain("const link = eligible[0]")
    expect(tokenRoute).toContain("access_token: req.params.token")
    expect(tokenRoute).not.toContain("customer_id")
    expect(tokenRoute).not.toContain("email")
    expect(customerRoute).toContain("customer_id: req.auth_context.actor_id")
  })

  it("keeps customer ideas separate from Admin protocol publication", () => {
    const adminComments = readFileSync(
      join(routesRoot, "research-protocols/community-comments.tsx"),
      "utf8",
    )
    const commentWorkflow = readFileSync(
      join(srcRoot, "workflows/steps/manage-research-protocol-comment.ts"),
      "utf8",
    )
    const storeRoute = readFileSync(
      join(
        srcRoot,
        "api/store/customers/me/research-protocol-comments/route.ts",
      ),
      "utf8",
    )

    expect(adminComments).toContain("Approve")
    expect(adminComments).toContain("Reject")
    expect(adminComments).toContain("Hide")
    expect(adminComments).toContain("never modify or publish protocol content")
    expect(commentWorkflow).toContain('status: "pending"')
    expect(commentWorkflow).toContain("moderated_by_actor_id")
    expect(storeRoute).toContain("req.auth_context.actor_id")
    expect(storeRoute).not.toContain("publishResearchProtocolWorkflow")
  })
})
