/**
 * patch-ghk-cu-description.ts
 *
 * One-shot admin API script to update the GHK-Cu product description.
 * Replaces the incorrect CUV100 peptide blend content with correct
 * GHK-Cu specific technical description in HTML format.
 *
 * Run: medusa exec ./src/scripts/patch-ghk-cu-description.ts
 */

import { ExecArgs, IProductModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const GHK_CU_HANDLE = "ghk-cu"

const GHK_CU_DESCRIPTION = `<h2>GHK-Cu — Copper(II) Glycyl-L-Histidyl-L-Lysine</h2>

<p><strong>Product Title</strong><br>
GHK-Cu | Copper Peptide | Lyophilized Laboratory Reference Material | Research Use Only</p>

<p><strong>Category</strong><br>
Skin, Hair &amp; Cosmetic Peptides — Laboratory Reference Compound</p>

<p><strong>Product Overview</strong><br>
GHK-Cu (Glycyl-L-Histidyl-L-Lysine Copper Complex) is a naturally occurring copper peptide first isolated from human plasma. It is a tripeptide-copper(II) complex prepared as a lyophilized solid for laboratory reconstitution and in vitro research applications. PubChem CID: 133697840.</p>

<p><strong>Description</strong><br>
GHK-Cu is the copper complex of the tripeptide glycyl-L-histidyl-L-lysine. It is commonly investigated in laboratory models involving copper-peptide coordination, wound healing mechanisms, gene-expression patterns, and peptide-associated signaling processes. Experimental studies have examined its interactions with collagen synthesis, anti-inflammatory pathways, and tissue remodeling markers in controlled cellular and animal models.</p>

<p><strong>Physical &amp; Chemical Properties</strong></p>
<ul>
  <li>Designation: Copper(II) Complex of Glycyl-L-Histidyl-L-Lysine</li>
  <li>Peptide Sequence: GHK (Gly-His-Lys)</li>
  <li>Peptide Length: 3 amino acid residues (tripeptide)</li>
  <li>Metal Center: Copper(II)</li>
  <li>Physical Form: White to off-white lyophilized powder</li>
  <li>PubChem CID: 133697840</li>
  <li>Purity: &ge;95% (batch CoA available)</li>
</ul>

<p><strong>Storage &amp; Handling</strong><br>
Store lyophilized vials at &minus;20&deg;C in a dry, sealed environment. Protect from light and moisture. After reconstitution with Bacteriostatic Water, store at 2&ndash;8&deg;C and use within 28 days.</p>

<p><strong>Reconstitution Reference</strong><br>
Standard laboratory protocol: Add 1 mL Bacteriostatic Water to a 50 mg vial to yield a nominal concentration of 50 mg/mL. Confirm concentration by validated analytical method appropriate to the research application.</p>

<blockquote>Research Use Only. Not for Human or Veterinary Use. This material is intended strictly for in vitro laboratory research. It is not approved for diagnostic, therapeutic, or clinical applications. Product identity, purity, and analytical specifications should be evaluated using the CoA supplied for the applicable batch.</blockquote>`

export default async function patchGhkCuDescription({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)

  logger.info(`[patch-ghk-cu-description] Fetching product by handle: ${GHK_CU_HANDLE}`)

  const products = await productModule.listProducts({
    handle: GHK_CU_HANDLE,
  })

  if (!products.length) {
    logger.error(`[patch-ghk-cu-description] No product found with handle "${GHK_CU_HANDLE}". Aborting.`)
    return
  }

  const product = products[0]
  logger.info(`[patch-ghk-cu-description] Found: ${product.id} — "${product.title}"`)
  logger.info(`[patch-ghk-cu-description] Current preview: ${String(product.description).slice(0, 80)}...`)

  await productModule.updateProducts(product.id, {
    description: GHK_CU_DESCRIPTION,
  })

  logger.info(`[patch-ghk-cu-description] Done. Description updated for ${product.id}`)
}
