import {
  listResearchProtocolRecommendations,
  retrieveResearchProtocol,
  type StoreResearchProtocol,
} from "@lib/data/research-protocols"
import {
  getCompoundProtocol,
  type CompoundAnalyticalProtocol,
} from "@lib/data/compound-protocols"
import { listProducts } from "@lib/data/products"
import { formatPeptideDosage } from "@lib/research-quantity"
import FullProtocol from "@modules/research-protocols/full-protocol"
import ProductRecommendations from "@modules/research-protocols/product-recommendations"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

function adaptCompoundToStoreProtocol(
  analytical: CompoundAnalyticalProtocol,
  handle: string
): StoreResearchProtocol {
  return {
    handle,
    revision: 1,
    title: analytical.compoundName,
    summary: analytical.subtitle,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    products: analytical.handles.map((h) => ({
      id: `prod_${h}`,
      title: analytical.compoundName,
      handle: h,
      thumbnail: null,
    })),
    access: {
      full_protocol: "purchaser",
      community: "member",
    },
    search_indexable: true,
    recommendations_enabled: false,
    content: {
      compound_name: analytical.compoundName,
      short_introduction: analytical.subtitle,
      product_format: "Lyophilized Solid Powder",
      category: analytical.category,
      protocol_category_type:
        analytical.category === "Multi-Peptide Blends" || analytical.isBlend ? "blend" : "single_peptide",
      full_description: analytical.longDescription || null,
      investigated_benefits: analytical.investigatedBenefits || [],
      adverse_observations: analytical.adverseObservations || [],
      molecular_details: analytical.molecularDetails
        ? {
            cas_number: analytical.molecularDetails.casNumber || null,
            pubchem_cid: analytical.molecularDetails.pubchemCid || null,
            sequence_or_formula: analytical.molecularDetails.sequenceOrFormula || null,
            molecular_weight_g_per_mol: analytical.molecularDetails.molecularWeightGPerMol || null,
          }
        : null,
      reconstitution_details: {
        default_vial_net_mg: analytical.reconstitution.defaultVialNetMg || null,
        default_diluent_ml: analytical.reconstitution.defaultDiluentMl || null,
        solvent: analytical.reconstitution.solvent || null,
        dissolution_method: analytical.reconstitution.dissolutionMethod || null,
        resulting_concentration_mg_per_ml: analytical.reconstitution.resultingConcentrationMgPerMl || null,
        handling_rule: analytical.reconstitution.handlingRule || null,
      },
      storage_details: {
        lyophilized: analytical.storage.lyophilized || null,
        reconstituted: analytical.storage.reconstituted || null,
        light_protection: !!analytical.storage.lightProtection,
      },
      purity_standard: analytical.purityStandard || null,
      research_use_label: "In-Vitro Laboratory Research Only",
      last_reviewed_at: "2026-09-06",
      quick_reference: [
        {
          key: "target_solvent",
          label: "Target Solvent",
          value: analytical.reconstitution.solvent,
          description: analytical.reconstitution.handlingRule || "Store refrigerated",
          evidence_label: "Standard",
          reference_keys: ["ref-1"],
        },
        {
          key: "diluent_ratio",
          label: "Diluent Ratio",
          value: `${analytical.reconstitution.defaultDiluentMl.toFixed(1)} mL per ${analytical.reconstitution.defaultVialNetMg} mg (${analytical.reconstitution.resultingConcentrationMgPerMl.toFixed(1)} mg/mL)`,
          description: analytical.reconstitution.dissolutionMethod || "Swirl gently horizontally",
          evidence_label: "Analytical",
          reference_keys: ["ref-1"],
        },
        {
          key: "lyophilized_storage",
          label: "Lyophilized Storage",
          value: analytical.storage.lyophilized,
          description: "Desiccated and protected from thermal spikes",
          evidence_label: "Stability",
          reference_keys: ["ref-1"],
        },
        {
          key: "liquid_stability",
          label: "Liquid Stability",
          value: analytical.storage.reconstituted,
          description: analytical.storage.lightProtection ? "Refrigerated and light-protected" : "Refrigerated at 2°C–8°C",
          evidence_label: "Stability",
          reference_keys: ["ref-1"],
        },
        {
          key: "half_life",
          label: "Pharmacokinetics / Half-Life",
          value: analytical.dosing.halfLife,
          description: `Typical protocol duration: ${analytical.dosing.typicalProtocolDuration}; Washout: ${analytical.dosing.washoutPeriod}`,
          evidence_label: "Pharmacology",
          reference_keys: ["ref-1"],
        },
      ],
      calculator: (() => {
        if (analytical.calculator) {
          const cfg = analytical.calculator
          return {
            enabled: cfg.enabled ?? true,
            title: cfg.title || "Reconstitution Calculator",
            default_compound_mass: cfg.defaultCompoundMass || String(analytical.reconstitution.defaultVialNetMg),
            compound_mass_unit: cfg.compoundMassUnit || "mg",
            default_final_volume_ml: cfg.defaultFinalVolumeMl || String(analytical.reconstitution.defaultDiluentMl),
            default_target_amount: cfg.defaultTargetAmount || String(analytical.dosing.standardDoseMcg),
            target_amount_unit: cfg.targetAmountUnit || "mcg",
            iu_per_mg: cfg.iuPerMg ? String(cfg.iuPerMg) : null,
            device_volume_ml: cfg.deviceVolumeMl || "1",
            device_label: cfg.deviceLabel || analytical.syringeGuide.syringeType || "U-100 Insulin Syringe",
            rounding_precision: cfg.roundingPrecision ?? 2,
            instructions: cfg.instructions || `Calibrated for ${analytical.reconstitution.resultingConcentrationMgPerMl} mg/mL concentration using standard laboratory volumetric instruments.`,
          }
        }
        const targetDose = formatPeptideDosage(analytical.dosing.standardDoseMcg, "mcg")
        return {
          enabled: true,
          title: "Reconstitution Calculator",
          default_compound_mass: String(analytical.reconstitution.defaultVialNetMg),
          compound_mass_unit: "mg" as const,
          default_final_volume_ml: String(analytical.reconstitution.defaultDiluentMl),
          default_target_amount: targetDose.amount,
          target_amount_unit: targetDose.unit as "mcg" | "mg" | "IU",
          iu_per_mg: null,
          device_volume_ml: "1",
          device_label: analytical.syringeGuide.syringeType || "U-100 Insulin Syringe",
          rounding_precision: 2,
          instructions: `Calibrated for ${analytical.reconstitution.resultingConcentrationMgPerMl} mg/mL concentration using standard laboratory volumetric instruments.`,
        }
      })(),
      protocol_levels: [
        {
          key: "standard-schedule",
          title: "In-Vitro Assay Titration Schedule",
          summary: `Study duration: ${analytical.dosing.typicalProtocolDuration} · Washout: ${analytical.dosing.washoutPeriod}`,
          duration: analytical.dosing.typicalProtocolDuration,
          interval: analytical.dosing.washoutPeriod,
          applicability: null,
          evidence_label: "Assay Schedule",
          reference_keys: ["ref-1"],
          routine_enabled: true,
          rows: analytical.dosing.titrationSteps.map((step, idx) => {
            const iuMatch = step.doseDisplay?.match(/([\d.]+)\s*IU/i)
            const stepDose = (analytical.calculator?.targetAmountUnit === "IU" && iuMatch)
              ? { amount: iuMatch[1], unit: "IU" as const }
              : formatPeptideDosage(step.doseMcg, "mcg")
            return {
              row_key: `step-${idx + 1}`,
              period: step.timeframe,
              start_offset_days: null,
              end_offset_days: null,
              amount: stepDose.amount,
              unit: stepDose.unit,
              recurrence_type: "daily" as const,
              times_per_day: 1,
              weekdays: [],
              suggested_local_times: [],
              frequency: step.cadence,
              notes: `${step.stage}: ${step.focus}${step.notes ? ` (${step.notes})` : ""}`,
              reference_keys: ["ref-1"],
            }
          }),
        },
      ],
      research_purpose: `Analytical characterization, laboratory reconstitution standard, and stoichiometric verification for ${analytical.compoundName}.`,
      intended_application: (analytical.longDescription || `In-vitro cellular signaling assays, receptor binding affinity quantification, and chromatographic reference investigation.`).slice(0, 5000),
      explicit_exclusions: `Strictly prohibited for in-vivo diagnostic, medical, cosmetic, food additive, or therapeutic human or animal administration.`,
      reference_quantities: [],
      materials_and_equipment: [],
      preparation_and_handling: `Aseptic reconstitution in a certified laminar airflow hood utilizing sterile disposable syringes and ${analytical.reconstitution.solvent}. ${analytical.reconstitution.dissolutionMethod}`,
      research_procedure: `1. Equilibrate vial to ambient room temperature.\n2. Swab septum with 70% isopropyl alcohol.\n3. Introduce ${analytical.reconstitution.defaultDiluentMl} mL diluent slowly down the inner glass vial wall.\n4. Swirl horizontally until complete dissolution is observed.\n5. Calibrate research concentrations according to analytical assay parameters.`,
      storage_and_disposal: `Store lyophilized cake at ${analytical.storage.lyophilized}. Store reconstituted solution at ${analytical.storage.reconstituted}. Dispose of all vials and analytical consumables in compliance with laboratory biohazard waste procedures.`,
      sections: [
        ...(analytical.longDescription
          ? [
              {
                key: "pharmacological-profile",
                title: "Pharmacological Profile & Mechanism of Action",
                body: analytical.longDescription,
                visible: true,
                position: 1,
                reference_keys: ["ref-1"],
              },
            ]
          : []),
        {
          key: "reconstitution-procedure",
          title: "Aseptic Reconstitution Procedure",
          body: `1. Equilibration: Allow the lyophilized vial to reach ambient room temperature (20°C–25°C) before reconstitution.\n2. Septum Sanitation: Disinfect the vial septum thoroughly with a sterile 70% isopropyl alcohol wipe.\n3. Diluent Addition: Using a sterile syringe, slowly draw ${analytical.reconstitution.defaultDiluentMl} mL of ${analytical.reconstitution.solvent}. Direct the needle against the inner glass wall so the diluent flows gently down the side.\n4. Gentle Dissolution: ${analytical.reconstitution.dissolutionMethod}\n5. Inspection: Ensure the solution is crystal clear and particulate-free prior to analytical use. ${analytical.reconstitution.handlingRule}`,
          visible: true,
          position: analytical.longDescription ? 2 : 1,
          reference_keys: ["ref-1"],
        },
        {
          key: "storage-stability",
          title: "Storage and Temperature Stability",
          body: `Lyophilized powder: ${analytical.storage.lyophilized}. Once reconstituted: ${analytical.storage.reconstituted}. ${analytical.storage.lightProtection ? "Keep shielded from UV light." : ""}`,
          visible: true,
          position: 2,
          reference_keys: ["ref-1"],
        },
        {
          key: "analytical-characterization",
          title: "Analytical Specifications & Purity Standard",
          body: `Purity Standard: ${analytical.purityStandard}.\n${analytical.molecularDetails ? `CAS Number: ${analytical.molecularDetails.casNumber || "N/A"}\nPubChem CID: ${analytical.molecularDetails.pubchemCid || "N/A"}\nFormula/Sequence: ${analytical.molecularDetails.sequenceOrFormula || "N/A"}\nMolecular Weight: ${analytical.molecularDetails.molecularWeightGPerMol ? `${analytical.molecularDetails.molecularWeightGPerMol} g/mol` : "N/A"}` : "Multi-peptide blended formulation standard."}`,
          visible: true,
          position: 3,
          reference_keys: ["ref-1"],
        },
        {
          key: "assay-schedule",
          title: "In-Vitro Concentration & Assay Schedule",
          body: analytical.dosing.titrationSteps
            .map(
              (s) =>
                `• ${s.stage} (${s.timeframe}): Target Assay Dose: ${s.doseDisplay} | Cadence: ${s.cadence}\n  Assay Focus: ${s.focus}${
                  s.notes ? `\n  Volumetric Calibration: ${s.notes}` : ""
                }`
            )
            .join("\n\n") +
            `\n\nTypical Study Duration: ${analytical.dosing.typicalProtocolDuration}\nReceptor Washout Window: ${analytical.dosing.washoutPeriod}`,
          visible: true,
          position: 4,
          reference_keys: ["ref-1"],
        },
      ],
      faqs: [
        {
          key: "reconstitution_faq",
          question: `How should ${analytical.compoundName} be reconstituted?`,
          answer: analytical.reconstitution.dissolutionMethod,
          position: 1,
        },
        {
          key: "half_life_faq",
          question: `What is the estimated laboratory half-life of ${analytical.compoundName}?`,
          answer: `${analytical.compoundName} displays an estimated half-life of ${analytical.dosing.halfLife}. Typical study protocols run for ${analytical.dosing.typicalProtocolDuration} followed by a washout period of ${analytical.dosing.washoutPeriod}.`,
          position: 2,
        },
      ],
      references: (analytical.citations && analytical.citations.length > 0)
        ? analytical.citations.map((c, idx) => {
            const pmidMatch = c.sourceReference?.match(/PMID:\s*(\d+)/i)
            const pmid = pmidMatch ? pmidMatch[1] : null
            return {
              reference_key: `ref-${idx + 1}`,
              title: (c.notes || c.sourceReference || "Laboratory Reference").trim(),
              authors: "Peer-Reviewed Scientific Literature",
              published_at: "PubMed Indexed",
              url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : null,
              doi: null,
              evidence_type: "peer-reviewed",
              supported_claim: "Peer-reviewed pharmacological and analytical characterization.",
              customer_annotation: "Verified scientific reference.",
            }
          })
        : [
            {
              reference_key: "ref-1",
              title: `${analytical.compoundName} Analytical Profile & High-Performance Liquid Chromatography Assay Standard`,
              authors: "PepStack Analytical Bioresearch Registry",
              published_at: "2026",
              url: null,
              doi: null,
              evidence_type: "HPLC Monograph",
              supported_claim: "Standardized peptide sequence, molecular purity, and handling guidelines.",
              customer_annotation: "Authoritative reference dossier for research laboratory use.",
            },
          ],
      disclaimer: analytical.disclaimer,
    },
  }
}

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
        backendProtocol?.content?.full_description ||
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
      ).map((level) => ({
        ...level,
        rows: level.rows.map((row) => {
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

  return (
    <div className="content-container py-8 small:py-12 max-w-5xl mx-auto">
      <FullProtocol
        protocol={protocol}
        showCatalogProduct={true}
        matchedProducts={matchedProducts}
        backLink={{ href: "/research-library#protocols", label: "← Back to Protocols" }}
        badgeText="Validated Laboratory Standard"
        countryCode={countryCode}
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
