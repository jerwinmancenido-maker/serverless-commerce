import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const protocolsPath = path.resolve(__dirname, "../src/lib/data/compound-protocols/all-protocols.json")
const outputPath = path.resolve(__dirname, "../src/lib/data/search-index.json")

const protocols = JSON.parse(fs.readFileSync(protocolsPath, "utf-8"))

const searchIndex = protocols.map((p) => {
  const handle = p.storeProductHandle || p.id || p.slug || ""
  const title = p.compoundName || p.title || ""
  const sub = p.subtitle || p.short_introduction || p.category || ""
  const subtitle = sub.length > 36 ? sub.slice(0, 33) + "..." : sub
  const badge = p.category ? p.category.replace(/ Peptides| Protocols/gi, "").trim() : "Protocol"

  return {
    title,
    subtitle,
    href: `/research-protocols/${handle}`,
    badge,
  }
})

// Top category shortcuts
const categoryItems = [
  {
    title: "Metabolic & Weight Management",
    subtitle: "Incretin mimetics & GLP-1/GIP co-agonists",
    href: "/categories/metabolic-weight-management-peptides",
    badge: "Category",
  },
  {
    title: "Healing & Tissue Repair",
    subtitle: "Angiogenic & tissue repair peptides",
    href: "/categories/healing-tissue-repair-peptides",
    badge: "Category",
  },
  {
    title: "Longevity & Cellular Vitality",
    subtitle: "Telomerase activation & bioregulators",
    href: "/categories/longevity-cellular-peptides",
    badge: "Category",
  },
  {
    title: "Laboratory Supplies & Hardware",
    subtitle: "BAC water, sterile vials & syringes",
    href: "/categories/laboratory-supplies",
    badge: "Supplies",
  },
]

const finalItems = [...categoryItems, ...searchIndex]
fs.writeFileSync(outputPath, JSON.stringify(finalItems), "utf-8")

const stats = fs.statSync(outputPath)
console.log(`Generated ${outputPath}: ${finalItems.length} items, ${(stats.size / 1024).toFixed(2)} KB (Target: <30 KB)`)
