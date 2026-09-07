import fs from "fs"
import path from "path"
import { MedusaError } from "@medusajs/framework/utils"
import {
  compileMonographHtml,
  diffPeptidesAndMonograph,
  type MonographDiffResult,
  type PeptidesSkuData,
} from "./monograph-compiler"

const COMMERCE_ROOT = path.resolve(__dirname, "../..")
const UNIFIED_CATALOG_PATH = path.join(
  COMMERCE_ROOT,
  "data",
  "unified-catalog.json",
)
const PEPTIDES_DATA_DIR =
  "/Users/m5/Projects/Peptides/scripts/template_engine/data"

// Canonical Handle to Peptides Deck JSON Mapping
export const HANDLE_TO_DECK_JSON: Record<string, string> = {
  "5-amino-1mq": "amino_1mq_50mg.json",
  "aod-9604": "aod_9604_5mg.json",
  "cagrilintide": "cagrilintide_5mg.json",
  "lemon-bottle": "lemon_bottle_10ml.json",
  "lipo-c-b12": "lipo_c_b12_10ml.json",
  "mots-c": "mots_c_10mg.json",
  "retatrutide": "retatrutide_10mg.json",
  "rtt60": "retatrutide_60mg.json",
  "semaglutide": "semaglutide_5mg.json",
  "tirzepatide": "tirzepatide_10mg.json",
  "ara-290": "ara_290_16mg.json",
  "bpc-157-vial": "bpc_157_10mg.json",
  "adamax-1032": "adamax_10mg.json",
  "dihexa": "dihexa_10mg.json",
  "pe-22-28": "pe_22_28_5mg.json",
  "pinealon": "pinealon_10mg.json",
  "selank": "selank_10mg.json",
  "semax": "semax_10mg.json",
  "selank-semax-combo": "selank_semax_combo_20mg.json",
  "cjc-1295-ipamorelin": "cjc1295_ipamorelin_10mg.json",
  "ghrp-2": "ghrp_2_10mg.json",
  "ghrp-6": "ghrp_6_10mg.json",
  "hgh-somatropin": "hgh_24iu.json",
  "igf-1-lr3": "igf_1_lr3_1mg.json",
  "igf-des": "igf_des_2mg.json",
  "ipamorelin": "ipamorelin_10mg.json",
  "tesamorelin": "tesamorelin_10mg.json",
  "ti15": "ti15_15mg.json",
  "aicar": "aicar_100mg.json",
  "epithalon": "epithalon_10mg.json",
  "glutathione-1500mg": "glutathione_1500mg.json",
  "nad-plus-500mg": "nad_500mg.json",
  "ss-31": "ss_31_10mg.json",
  "cuv100-ghk-cu-kpv": "cuv100_100mg.json",
  "ghk-cu": "ghk_cu_50mg.json",
  "ghk-cu-anti-aging-serum": "ghk_cu_50mg.json",
  "glow70": "glow70_70mg.json",
  "snap-8": "snap_8_10mg.json",
  "klow80": "klow80_80mg.json",
  "kpv": "kpv_10mg.json",
  "thymosin-alpha-1": "thymosin_alpha_1_10mg.json",
  "hcg": "hcg_10000iu.json",
  "hmg-75iu": "hmg_75iu.json",
  "kisspeptin-10": "kisspeptin_10_10mg.json",
  "pt-141": "pt_141_10mg.json",
  "dsip": "dsip_5mg.json",
  "bacteriostatic-water": "bac_water_10ml.json",
  "peptide-reconstitution-set": "peptide_reconstitution_set.json",
  "reusable-metal-insulin-pen": "reusable_metal_insulin_pen.json",
  "50-slot-vial-organizer-box": "vial_organizer_box_50.json",
  "custom-mixed-vial-organizer-box": "custom_mixed_vial_box.json",
  "clear-nasal-spray-bottles": "nasal_spray_bottles.json",
  "tb-500": "tb_500_10mg.json",
  "ghk-basic": "ghk_basic_50mg.json",
  "pentosan-polysulfate": "pentosan_polysulfate_250mg.json",
  "mazdutide": "mazdutide_10mg.json",
  "survodutide": "survodutide_10mg.json",
  "tesofensine": "tesofensine_100mg.json",
  "liraglutide": "liraglutide_18mg.json",
  "cjc-1295-no-dac": "cjc_1295_no_dac_5mg.json",
  "cjc-1295-with-dac": "cjc_1295_with_dac_2mg.json",
  "sermorelin": "sermorelin_5mg.json",
  "hexarelin": "hexarelin_5mg.json",
  "mk-677": "mk_677_750mg.json",
  "foxo4-dri": "foxo4_dri_10mg.json",
  "humanin": "humanin_10mg.json",
  "na-semax-amidate": "na_semax_amidate_10mg.json",
  "na-selank-amidate": "na_selank_amidate_10mg.json",
  "cerebrolysin": "cerebrolysin_10ml.json",
  "p21": "p21_10mg.json",
  "noopept": "noopept_500mg.json",
  "ll-37": "ll_37_5mg.json",
  "melanotan-1": "melanotan_1_10mg.json",
  "melanotan-2": "melanotan_2_10mg.json",
  "oxytocin": "oxytocin_5mg.json",
  "wolverine-blend": "wolverine_blend_10mg.json",
  "tri-heal-blend": "tri_heal_matrix_15mg.json",
  "ghk-cu-glutathione-bundle": "ghk_cu_50mg.json",
  "epithalon-glutathione-bundle": "epithalon_10mg.json",
  "epithalon-glutathione-nad-bundle": "epithalon_10mg.json",
  "glutathione-nad-ghk-cu-bundle": "glutathione_1500mg.json",
  "nad-ghk-cu-bundle": "nad_500mg.json",
}

type CatalogItem = {
  title: string
  handle: string
  description: string
  metadata?: Record<string, unknown>
}

export function runProtocolSync(options: {
  isDryRun: boolean
  direction: "from-peptides" | "to-peptides"
}): {
  scannedCount: number
  diffs: MonographDiffResult[]
} {
  if (!fs.existsSync(UNIFIED_CATALOG_PATH)) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Unified catalog not found at: ${UNIFIED_CATALOG_PATH}`,
    )
  }

  const catalogRaw = fs.readFileSync(UNIFIED_CATALOG_PATH, "utf-8")
  const catalog: CatalogItem[] = JSON.parse(catalogRaw)

  const diffs: MonographDiffResult[] = []
  let updatedCount = 0

  for (const item of catalog) {
    const deckFileName = HANDLE_TO_DECK_JSON[item.handle]
    if (!deckFileName) continue

    const deckFilePath = path.join(PEPTIDES_DATA_DIR, deckFileName)
    if (!fs.existsSync(deckFilePath)) continue

    const peptidesDataRaw = fs.readFileSync(deckFilePath, "utf-8")
    const peptidesData: PeptidesSkuData = JSON.parse(peptidesDataRaw)

    const diff = diffPeptidesAndMonograph(
      item.handle,
      peptidesData,
      item.description,
    )
    if (diff.hasChanges) {
      diffs.push(diff)
    }

    if (options.direction === "from-peptides" && !options.isDryRun) {
      const compiledHtml = compileMonographHtml(peptidesData)
      item.description = compiledHtml
      updatedCount++
    }
  }

  if (options.direction === "from-peptides" && !options.isDryRun && updatedCount > 0) {
    const backupPath = UNIFIED_CATALOG_PATH.replace(".json", ".backup.json")
    fs.writeFileSync(backupPath, catalogRaw, "utf-8")
    fs.writeFileSync(UNIFIED_CATALOG_PATH, JSON.stringify(catalog, null, 2), "utf-8")
  }

  return {
    scannedCount: catalog.length,
    diffs,
  }
}

// CLI Entrypoint
if (require.main === module) {
  const args = process.argv.slice(2)
  const isDryRun = args.includes("--dry-run") || !args.includes("--apply")
  const direction = args.includes("--to-peptides") ? "to-peptides" : "from-peptides"

  console.log("\n=======================================================")
  console.log("Scientific Protocol Sync & Smart Monograph Compiler")
  console.log(`Mode: ${isDryRun ? "DRY-RUN (No file changes)" : "LIVE APPLY"}`)
  console.log(`Direction: ${direction}`)
  console.log("=======================================================\n")

  const result = runProtocolSync({ isDryRun, direction })

  console.log(`Scanned ${result.scannedCount} catalog products.`)
  console.log(`Found ${result.diffs.length} compounds with field differences:\n`)

  for (const diff of result.diffs) {
    console.log(`Compound: [${diff.handle}]`)
    for (const d of diff.differences) {
      console.log(`  - ${d.field}: "${d.currentValue}" -> "${d.newValue}"`)
    }
    console.log("")
  }

  if (isDryRun) {
    console.log("Dry run complete. Use --apply to execute updates.")
  } else {
    console.log("Live apply complete. Backups created and catalog updated.")
  }
}
