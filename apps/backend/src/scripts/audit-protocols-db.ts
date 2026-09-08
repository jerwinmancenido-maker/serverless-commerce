import * as fs from "fs"
import * as path from "path"
import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { RESEARCH_CONTENT_MODULE } from "../modules/research-content"
import type ResearchContentModuleService from "../modules/research-content/service"

export default async function auditProtocolsDb({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("\n=======================================================")
  logger.info("COMPREHENSIVE 360-DEGREE AUDIT: RESEARCH PROTOCOLS DATABASE")
  logger.info("=======================================================\n")

  const allSeries = await service.listResearchProtocolSeries(
    {},
    { relations: ["revisions"] },
  )
  const allProductLinks = await service.listResearchProtocolProductLinks(
    { archived_at: null },
  )

  const linksBySeriesId = new Map<string, typeof allProductLinks>()
  for (const l of allProductLinks) {
    const list = linksBySeriesId.get(l.series_id) || []
    list.push(l)
    linksBySeriesId.set(l.series_id, list)
  }

  // Load all 74 protocols from data/all-compound-protocols.json
  const dataFilePath = path.resolve(process.cwd(), "data/all-compound-protocols.json")
  const jsonProtocols: Array<{ id: string; compoundName: string; storeProductHandle?: string; category: string; handles?: string[] }> =
    JSON.parse(fs.readFileSync(dataFilePath, "utf-8"))

  // Query products in Medusa DB
  const { data: dbProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "status"],
  })

  logger.info(`Medusa DB Product Count: ${dbProducts.length}`)
  logger.info(`Database total series count: ${allSeries.length}`)
  logger.info(`Canonical protocols count in JSON: ${jsonProtocols.length}`)

  // 1. Map all series in DB
  const dbSeriesSummary = allSeries.map((s) => {
    const links = linksBySeriesId.get(s.id) || []
    const revs = s.revisions || []
    const latestRev = revs[0]
    return {
      id: s.id,
      protocol_key: s.protocol_key,
      archived_at: s.archived_at,
      revisionsCount: revs.length,
      status: latestRev?.status || "NO_REVISION",
      title: latestRev?.title || "NO_TITLE",
      productLinksCount: links.length,
      productIds: links.map((l) => l.product_id),
    }
  })

  // 2. Identify duplicate/competing series
  const keyMap = new Map<string, typeof dbSeriesSummary>()
  for (const s of dbSeriesSummary) {
    // Normalize key by stripping -laboratory-handling
    const normKey = s.protocol_key.replace(/-laboratory-handling$/, "")
    const list = keyMap.get(normKey) || []
    list.push(s)
    keyMap.set(normKey, list)
  }

  logger.info("\n--- DUPLICATE / COMPETING SERIES DETECTED IN DB ---")
  let dupCount = 0
  for (const [normKey, list] of keyMap.entries()) {
    if (list.length > 1) {
      dupCount++
      logger.info(`\n[Conflict #${dupCount}] Base Key: "${normKey}"`)
      for (const item of list) {
        logger.info(
          `  - Series ID: ${item.id} | Key: "${item.protocol_key}" | Title: "${item.title}" | Status: ${item.status} | Links: ${item.productLinksCount} | Archived: ${item.archived_at !== null}`,
        )
      }
    }
  }

  // 3. Check which canonical JSON protocols exist in DB
  logger.info("\n--- CANONICAL JSON PROTOCOLS COVERAGE AUDIT (74 Total) ---")
  const missingInDb: string[] = []
  const presentInDb: string[] = []

  const dbProductHandles = new Set(dbProducts.map((p) => p.handle))

  for (const jp of jsonProtocols) {
    const candidateKeys = [
      jp.id,
      `${jp.id}-laboratory-handling`,
      jp.storeProductHandle || "",
      `${jp.storeProductHandle}-laboratory-handling`,
      ...(jp.handles || []),
      ...(jp.handles || []).map((h) => `${h}-laboratory-handling`),
    ].filter(Boolean)

    const match = dbSeriesSummary.find(
      (s) =>
        candidateKeys.includes(s.protocol_key) ||
        candidateKeys.includes(s.protocol_key.replace(/-laboratory-handling$/, "")),
    )

    const productInDb = jp.storeProductHandle && dbProductHandles.has(jp.storeProductHandle)

    if (match) {
      presentInDb.push(
        `[FOUND] ${jp.id} -> matched DB series "${match.protocol_key}" (${match.id}) | status: ${match.status} | productInDb: ${productInDb}`,
      )
    } else {
      missingInDb.push(
        `[MISSING] ${jp.id} ("${jp.compoundName}", Category: "${jp.category}", handle: "${jp.storeProductHandle}", productInDb: ${productInDb})`,
      )
    }
  }

  logger.info(`Protocols present in DB: ${presentInDb.length} / ${jsonProtocols.length}`)
  logger.info(`Protocols MISSING from DB: ${missingInDb.length} / ${jsonProtocols.length}`)
  if (missingInDb.length > 0) {
    logger.info("\nMissing protocols:")
    for (const m of missingInDb) {
      logger.info(`  ${m}`)
    }
  }

  // 4. Check active published protocols count as seen by Storefront
  const activeSeries = allSeries.filter((s) => s.archived_at === null)
  const publishedCount = activeSeries.filter((s) =>
    s.revisions?.some((r) => r.status === "published"),
  ).length
  logger.info(`\nActive Series: ${activeSeries.length}`)
  logger.info(`Published Series (Storefront query count): ${publishedCount}`)
}
