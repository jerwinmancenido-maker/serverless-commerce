/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/research-protocols/[handle]/page.tsx
 * @module  ResearchProtocolDetailPage (Storefront)
 * @purpose Detail page for compound analytical protocols and clinical monographs.
 * @contracts
 *   Fetches: retrieveResearchProtocol() · getCompoundProtocol()
 *   API:     GET /store/research-protocols/[id]
 */

import {
  listResearchProtocolRecommendations,
  retrieveResearchProtocol,
  type StoreResearchProtocol,
} from "@lib/data/research-protocols"
import { getCompoundProtocol } from "@lib/data/compound-protocols"
import { listProducts } from "@lib/data/products"
import { listArticlesForCompound } from "@lib/data/research-articles"
import { formatPeptideDosage } from "@lib/research-quantity"
import FullProtocol from "@modules/research-protocols/full-protocol"
import ProductRecommendations from "@modules/research-protocols/product-recommendations"
import type {
  ResearchBlendConstituent,
  ResearchBundleVial,
  ResearchReconstitutionOption,
  ResearchSyringeGuide,
  ResearchVialStrengthOption,
} from "@modules/research-protocols/types"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

export const dynamic = "force-dynamic"

import { adaptCompoundToStoreProtocol } from "@lib/protocol-adapter"
export { adaptCompoundToStoreProtocol }


type Props = { params: Promise<{ handle: string; countryCode: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const staticProtocol = getCompoundProtocol(handle)
  const backendProtocol = await retrieveResearchProtocol(handle)
    .then((r) => r.protocol)
    .catch(() => null)

  const rawTitle =
    backendProtocol?.content?.compound_name ||
    backendProtocol?.title ||
    (staticProtocol.id !== "generic-peptide" ? staticProtocol.compoundName : null)

  const title = rawTitle ? rawTitle.replace(/\s*Product Protocol\s*$/i, "").trim() : null

  const description =
    backendProtocol?.content?.short_introduction ||
    backendProtocol?.summary ||
    (staticProtocol.id !== "generic-peptide" ? staticProtocol.subtitle : null)

  if (!title) {
    return { title: "Protocol Not Found | Product Protocols" }
  }

  return {
    title: `${title} | Product Protocols`,
    description: description || undefined,
  }
}

export default async function ResearchProtocolPage({ params }: Props) {
  const { handle, countryCode } = await params

  const backendProtocol: StoreResearchProtocol | null = await retrieveResearchProtocol(handle)
    .then((response) => response.protocol)
    .catch(() => null)

  const staticProtocol = getCompoundProtocol(handle)

  // Safeguard: 404 Guard for Missing Protocols
  if (!backendProtocol && (!staticProtocol || staticProtocol.id === "generic-peptide")) {
    notFound()
  }

  const cleanHandle = handle.toLowerCase().trim()
  const fallbackStore = adaptCompoundToStoreProtocol(staticProtocol, cleanHandle)

  // Server-side deep merge: database values take precedence, falling back to static registry
  const protocol: StoreResearchProtocol = {
    handle: backendProtocol?.handle || cleanHandle,
    revision: backendProtocol?.revision || 1,
    title: backendProtocol?.title || staticProtocol.compoundName,
    summary: backendProtocol?.summary || staticProtocol.subtitle,
    published_at: backendProtocol?.published_at || new Date().toISOString(),
    updated_at: backendProtocol?.updated_at || new Date().toISOString(),
    products: backendProtocol?.products?.length ? backendProtocol.products : fallbackStore.products,
    access: backendProtocol?.access || fallbackStore.access,
    search_indexable: backendProtocol?.search_indexable ?? true,
    recommendations_enabled: backendProtocol?.recommendations_enabled ?? false,
    content: {
      compound_name: backendProtocol?.content?.compound_name || staticProtocol.compoundName,
      short_introduction: backendProtocol?.content?.short_introduction || staticProtocol.subtitle,
      product_format: backendProtocol?.content?.product_format || "Lyophilized Solid Powder",
      category: backendProtocol?.content?.category || staticProtocol.category,
      protocol_category_type:
        backendProtocol?.content?.protocol_category_type ||
        (staticProtocol.category === "Multi-Peptide Blends" || staticProtocol.isBlend ? "blend" : "single_peptide"),
      full_description:
        staticProtocol.longDescription &&
        staticProtocol.longDescription.length > (backendProtocol?.content?.full_description?.length || 0)
          ? staticProtocol.longDescription
          : backendProtocol?.content?.full_description ||
            staticProtocol.longDescription ||
            null,
      investigated_benefits:
        backendProtocol?.content?.investigated_benefits?.length
          ? backendProtocol.content.investigated_benefits
          : staticProtocol.investigatedBenefits || [],
      adverse_observations:
        backendProtocol?.content?.adverse_observations?.length
          ? backendProtocol.content.adverse_observations
          : staticProtocol.adverseObservations || [],
      molecular_details:
        backendProtocol?.content?.molecular_details ||
        (staticProtocol.molecularDetails
          ? {
              cas_number: staticProtocol.molecularDetails.casNumber || null,
              pubchem_cid: staticProtocol.molecularDetails.pubchemCid || null,
              sequence_or_formula: staticProtocol.molecularDetails.sequenceOrFormula || null,
              molecular_weight_g_per_mol: staticProtocol.molecularDetails.molecularWeightGPerMol || null,
            }
          : null),
      reconstitution_details:
        backendProtocol?.content?.reconstitution_details || fallbackStore.content.reconstitution_details,
      reconstitution_options:
        backendProtocol?.content?.reconstitution_options ||
        (staticProtocol?.reconstitutionOptions as unknown as Record<string, ResearchReconstitutionOption>) ||
        null,
      vial_strength_options:
        backendProtocol?.content?.vial_strength_options?.length
          ? backendProtocol.content.vial_strength_options
          : (staticProtocol?.vialStrengthOptions as unknown as ResearchVialStrengthOption[]) ||
            [],
      syringe_guide:
        backendProtocol?.content?.syringe_guide ||
        (staticProtocol?.syringeGuide as unknown as ResearchSyringeGuide) ||
        null,
      evidence_tier:
        backendProtocol?.content?.evidence_tier || staticProtocol?.evidenceTier || null,
      blend_constituents:
        backendProtocol?.content?.blend_constituents?.length
          ? backendProtocol.content.blend_constituents
          : (staticProtocol?.blendConstituents as unknown as ResearchBlendConstituent[]) ||
            [],
      bundle_vials:
        backendProtocol?.content?.bundle_vials?.length
          ? backendProtocol.content.bundle_vials
          : (staticProtocol?.bundleVials as unknown as ResearchBundleVial[]) ||
            [],
      storage_details:
        backendProtocol?.content?.storage_details || fallbackStore.content.storage_details,
      purity_standard:
        backendProtocol?.content?.purity_standard ||
        staticProtocol.purityStandard ||
        null,
      research_use_label: backendProtocol?.content?.research_use_label || "In-Vitro Laboratory Research Only",
      last_reviewed_at: backendProtocol?.content?.last_reviewed_at || "2026-09-06",
      quick_reference: backendProtocol?.content?.quick_reference?.length
        ? backendProtocol.content.quick_reference
        : staticProtocol.quickReference?.length
        ? (staticProtocol.quickReference as NonNullable<StoreResearchProtocol["content"]["quick_reference"]>)
        : fallbackStore.content.quick_reference,
      calculator: (() => {
        const rawCalc = backendProtocol?.content?.calculator || fallbackStore.content.calculator
        if (rawCalc?.default_target_amount && rawCalc?.target_amount_unit) {
          const normalizedTarget = formatPeptideDosage(rawCalc.default_target_amount, rawCalc.target_amount_unit)
          return {
            ...rawCalc,
            default_target_amount: normalizedTarget.amount,
            target_amount_unit: normalizedTarget.unit as "mcg" | "mg" | "IU",
          }
        }
        return rawCalc
      })(),
      protocol_levels: (
        backendProtocol?.content?.protocol_levels?.length
          ? backendProtocol.content.protocol_levels
          : (fallbackStore.content.protocol_levels || [])
      ).map((level: NonNullable<StoreResearchProtocol["content"]["protocol_levels"]>[number]) => ({
        ...level,
        rows: level.rows.map((row: typeof level.rows[number]) => {
          const isZeroDose =
            row.amount === "0" ||
            Number(row.amount) === 0 ||
            row.frequency?.toLowerCase().includes("zero") ||
            row.notes?.toLowerCase().includes("washout")
          if (isZeroDose) {
            return {
              ...row,
              amount: "0",
              unit: "mcg" as typeof row.unit,
            }
          }
          const normalized = formatPeptideDosage(row.amount, row.unit)
          return {
            ...row,
            amount: normalized.amount,
            unit: normalized.unit as typeof row.unit,
          }
        }),
      })),
      research_purpose: backendProtocol?.content?.research_purpose || fallbackStore.content.research_purpose,
      intended_application: backendProtocol?.content?.intended_application || fallbackStore.content.intended_application,
      preparation_and_handling: backendProtocol?.content?.preparation_and_handling || fallbackStore.content.preparation_and_handling,
      research_procedure: backendProtocol?.content?.research_procedure || fallbackStore.content.research_procedure,
      storage_and_disposal: backendProtocol?.content?.storage_and_disposal || fallbackStore.content.storage_and_disposal,
      sections: backendProtocol?.content?.sections?.length
        ? backendProtocol.content.sections
        : fallbackStore.content.sections,
      faqs: backendProtocol?.content?.faqs?.length
        ? backendProtocol.content.faqs
        : fallbackStore.content.faqs,
      references: backendProtocol?.content?.references?.length
        ? backendProtocol.content.references
        : staticProtocol.references?.length
        ? (staticProtocol.references as unknown as NonNullable<StoreResearchProtocol["content"]["references"]>)
        : fallbackStore.content.references,
      disclaimer: backendProtocol?.content?.disclaimer || staticProtocol.disclaimer,
    },
  }

  // Resolve matching store products
  let matchedProducts: HttpTypes.StoreProduct[] = []
  try {
    const handlesToSearch = Array.from(
      new Set([
        ...protocol.products.map((p) => p.handle),
        ...staticProtocol.handles,
        cleanHandle.replace(/-laboratory-handling$/, ""),
      ])
    ).filter(Boolean)

    for (const h of handlesToSearch) {
      const { response } = await listProducts({
        countryCode,
        queryParams: { handle: h, limit: 1 },
      }).catch(() => ({ response: { products: [] } }))

      if (
        response.products.length > 0 &&
        !matchedProducts.some((mp) => mp.id === response.products[0].id)
      ) {
        matchedProducts.push(response.products[0])
      }
    }
  } catch {
    matchedProducts = []
  }

  const recommendationResult = protocol.recommendations_enabled
    ? await listResearchProtocolRecommendations({
        handle,
        placement: "protocol",
        excludeProductIds: protocol.products.map((product) => product.id),
      }).catch(() => ({ recommendations: [] }))
    : { recommendations: [] }

  const recommendedProducts = recommendationResult.recommendations.length
    ? await listProducts({
        countryCode,
        queryParams: {
          id: recommendationResult.recommendations.map(
            (item) => item.product_id
          ),
          limit: recommendationResult.recommendations.length,
        },
      })
        .then(({ response }) => response.products)
        .catch(() => [])
    : []

  const recommendedProductById = new Map(
    recommendedProducts.map((product) => [product.id, product])
  )
  const recommendationItems = recommendationResult.recommendations.flatMap(
    (recommendation) => {
      const product = recommendedProductById.get(recommendation.product_id)
      return product ? [{ recommendation, product }] : []
    }
  )

  // Resolve matching peer-reviewed scientific articles for clinical-grade monograph
  const relatedArticles = await listArticlesForCompound(handle).catch(() => [])
  const primaryArticle = relatedArticles.length > 0 ? relatedArticles[0] : null

  return (
    <div className="content-container py-8 small:py-12">
      <FullProtocol
        protocol={protocol}
        showCatalogProduct={true}
        matchedProducts={matchedProducts}
        backLink={{ href: "/research-library#protocols", label: "← Back to Protocols" }}
        badgeText="Validated Laboratory Standard"
        countryCode={countryCode}
        relatedArticle={primaryArticle}
        relatedArticles={relatedArticles}
      />

      {recommendationItems.length > 0 && (
        <div className="mt-12">
          <ProductRecommendations
            handle={handle}
            items={recommendationItems}
            countryCode={countryCode}
          />
        </div>
      )}
    </div>
  )
}
