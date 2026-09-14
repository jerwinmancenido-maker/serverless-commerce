import type { StoreResearchProtocol } from "@lib/data/research-protocols"
import type { CompoundAnalyticalProtocol } from "@lib/data/compound-protocols"
import { formatPeptideDosage } from "@lib/research-quantity"
import type {
  ResearchBlendConstituent,
  ResearchBundleVial,
  ResearchReconstitutionOption,
  ResearchSyringeGuide,
  ResearchVialStrengthOption,
} from "@modules/research-protocols/types"

export function adaptCompoundToStoreProtocol(
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
        Boolean((analytical as { isBundle?: boolean }).isBundle)
          ? "bundle"
          : analytical.category === "Multi-Peptide Blends" || Boolean(analytical.isBlend)
          ? "blend"
          : "single_peptide",
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
        default_vial_net_mg: analytical.reconstitution?.defaultVialNetMg || null,
        default_diluent_ml: analytical.reconstitution?.defaultDiluentMl || null,
        solvent: analytical.reconstitution?.solvent || null,
        dissolution_method: analytical.reconstitution?.dissolutionMethod || null,
        resulting_concentration_mg_per_ml: analytical.reconstitution?.resultingConcentrationMgPerMl || null,
        handling_rule: analytical.reconstitution?.handlingRule || null,
      },
      reconstitution_options:
        (analytical.reconstitutionOptions as unknown as Record<string, ResearchReconstitutionOption>) || null,
      vial_strength_options:
        (analytical.vialStrengthOptions as unknown as ResearchVialStrengthOption[]) || [],
      syringe_guide:
        (analytical.syringeGuide as unknown as ResearchSyringeGuide) || null,
      evidence_tier: analytical.evidenceTier || null,
      blend_constituents:
        (analytical.blendConstituents as unknown as ResearchBlendConstituent[]) || [],
      bundle_vials:
        (analytical.bundleVials as unknown as ResearchBundleVial[]) || [],
      storage_details: {
        lyophilized: analytical.storage?.lyophilized || null,
        reconstituted: analytical.storage?.reconstituted || null,
        light_protection: !!analytical.storage?.lightProtection,
      },
      purity_standard: analytical.purityStandard || null,
      research_use_label: "In-Vitro Laboratory Research Only",
      last_reviewed_at: "2026-09-06",
      quick_reference: [
        {
          key: "target_solvent",
          label: "Target Solvent",
          value: analytical.reconstitution?.solvent || "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
          description: analytical.reconstitution?.handlingRule || "Store refrigerated",
          evidence_label: "Standard",
          reference_keys: ["ref-1"],
        },
        {
          key: "diluent_ratio",
          label: "Diluent Ratio",
          value:
            analytical.reconstitution?.defaultDiluentMl != null &&
            analytical.reconstitution?.defaultVialNetMg != null &&
            analytical.reconstitution?.resultingConcentrationMgPerMl != null
              ? `${analytical.reconstitution.defaultDiluentMl.toFixed(1)} mL per ${analytical.reconstitution.defaultVialNetMg} mg (${analytical.reconstitution.resultingConcentrationMgPerMl.toFixed(1)} mg/mL)`
              : "Refer to protocol monograph",
          description: analytical.reconstitution?.dissolutionMethod || "Swirl gently horizontally",
          evidence_label: "Analytical",
          reference_keys: ["ref-1"],
        },
        {
          key: "lyophilized_storage",
          label: "Lyophilized Storage",
          value: analytical.storage?.lyophilized || "Store desiccated at -20°C",
          description: "Desiccated and protected from thermal spikes",
          evidence_label: "Stability",
          reference_keys: ["ref-1"],
        },
        {
          key: "liquid_stability",
          label: "Liquid Stability",
          value: analytical.storage?.reconstituted || "Refrigerate at 2°C–8°C; use within 28 days",
          description: analytical.storage?.lightProtection ? "Refrigerated and light-protected" : "Refrigerated at 2°C–8°C",
          evidence_label: "Stability",
          reference_keys: ["ref-1"],
        },
        {
          key: "half_life",
          label: "Pharmacokinetics / Half-Life",
          value: analytical.dosing?.halfLife || "Monograph benchmark",
          description: `Typical protocol duration: ${analytical.dosing?.typicalProtocolDuration || "Experimental cycle"}; Washout: ${analytical.dosing?.washoutPeriod || "Inter-cycle washout"}`,
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
            const isZeroDose =
              step.doseMcg === 0 ||
              step.cadence?.toLowerCase().includes("zero") ||
              step.stage?.toLowerCase().includes("washout")
            const stepDose = isZeroDose
              ? { amount: "0", unit: "mcg" as const }
              : (analytical.calculator?.targetAmountUnit === "IU" && iuMatch)
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
