import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface ProtocolEntry {
  id: string
  compoundName: string
  primaryTarget?: string
  category?: string
  handles?: string[]
}

interface SearchIndexItem {
  id: string
  title: string
  subtitle: string
  href: string
  badge: string
  aliases: string[]
}

const protocolsPath = path.resolve(
  __dirname,
  "../src/lib/data/compound-protocols/all-protocols.json"
)

const raw = fs.readFileSync(protocolsPath, "utf-8")
const allProtocols: ProtocolEntry[] = JSON.parse(raw)

const searchIndex: SearchIndexItem[] = allProtocols.map((p) => {
  const subtitle = (p.primaryTarget || p.category || "Analytical").slice(0, 16)
  const nonIdAlias = (p.handles || []).find((h) => h !== p.id && h.length < 15)

  return {
    id: p.id,
    title: p.compoundName,
    subtitle,
    href: `/research-protocols/${p.id}`,
    badge: (p.category || "Peptide").slice(0, 10),
    aliases: nonIdAlias ? [nonIdAlias] : [],
  }
})

const outputPath = path.resolve(__dirname, "../src/lib/data/search-index.json")
const outputJson = JSON.stringify(searchIndex)
fs.writeFileSync(outputPath, outputJson, "utf-8")

const stats = fs.statSync(outputPath)
const sizeKb = stats.size / 1024
console.log(`Successfully generated search-index.json: ${sizeKb.toFixed(2)} KB (${searchIndex.length} items)`)

if (stats.size > 30 * 1024) {
  throw new Error(`Search index size exceeds 30 KB budget: ${sizeKb.toFixed(2)} KB`)
}
