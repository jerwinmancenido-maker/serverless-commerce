/**
 * Builder utilities for generating mathematically verified protocols and commercial catalog products.
 */

export function createGraduation(doseDisplay, doseMcg, concMgMl) {
  const volumeMl = Number((doseMcg / (concMgMl * 1000)).toFixed(4))
  const syringeIU = Number((volumeMl * 100).toFixed(1))
  return {
    doseDisplay,
    doseMcg,
    volumeMl,
    syringeIU,
    tickLabel: `${syringeIU.toFixed(1)} units (${volumeMl.toFixed(2)} mL) on U-100 syringe`
  }
}

export function createProtocol({
  id,
  compoundName,
  handles,
  subtitle,
  longDescription,
  category,
  defaultVialNetMg,
  defaultDiluentMl,
  solvent = "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
  dissolutionMethod,
  handlingRule = "Clear, colorless aqueous solution. Inspect against dark backdrop for optical clarity.",
  standardDoseDisplay,
  standardDoseMcg,
  cadence,
  halfLife,
  typicalProtocolDuration,
  washoutPeriod = "4 Weeks between research cohorts",
  titrationSteps,
  syringeGuideOverrides = {},
  storageOverrides = {},
  molecularDetails = {},
  citations = [],
  investigatedBenefits = [],
  adverseObservations = [],
  evidenceTier = "Preclinical & Clinical Literature Monograph",
  isBlend = false,
  blendConstituents = undefined,
  bundleVials = undefined,
  isSupply = false,
  supplyGuide = undefined,
  primaryDeliveryRoute = "subq",
  deliveryRoutes = ["subq"],
  vialStrengthOptions = undefined,
  reconstitutionOptions = undefined
}) {
  const resultingConcentrationMgPerMl = isSupply ? 0 : Number((defaultVialNetMg / defaultDiluentMl).toFixed(4))

  const graduations = isSupply
    ? []
    : (titrationSteps || []).map(step =>
        createGraduation(step.doseDisplay, step.doseMcg, resultingConcentrationMgPerMl)
      )

  const defaultGraduations = graduations.length >= 3
    ? graduations
    : [
        createGraduation("Low Initial Dose", Math.round(standardDoseMcg * 0.5), resultingConcentrationMgPerMl),
        createGraduation("Standard Assay Dose", standardDoseMcg, resultingConcentrationMgPerMl),
        createGraduation("Target Peak Dose", Math.round(standardDoseMcg * 1.5), resultingConcentrationMgPerMl)
      ]

  const protocol = {
    id,
    compoundName,
    handles: handles || [id],
    subtitle,
    longDescription,
    category,
    catalogStatus: "in_catalog",
    storeProductHandle: id,
    evidenceTier,
    reconstitution: isSupply
      ? {
          defaultVialNetMg: 0,
          defaultDiluentMl: 0,
          solvent: "N/A - Laboratory Hardware",
          dissolutionMethod: "N/A - Direct Laboratory Equipment",
          resultingConcentrationMgPerMl: 0,
          handlingRule: "Aseptic handling strictly recommended."
        }
      : {
          defaultVialNetMg,
          defaultDiluentMl,
          solvent,
          dissolutionMethod: dissolutionMethod || "Direct diluent stream gently against inner glass vial wall. Swirl in slow circular motions. Do not shake.",
          resultingConcentrationMgPerMl,
          handlingRule
        },
    dosing: isSupply
      ? {
          standardDoseDisplay: "N/A (Laboratory Consumable)",
          standardDoseMcg: 0,
          cadence: "As required per experimental assay",
          halfLife: "N/A",
          typicalProtocolDuration: "Single-use or consumable lifecycle",
          washoutPeriod: "N/A",
          titrationSteps: [
            { stage: "Stage 1: Aseptic Preparation", timeframe: "Pre-Trial", doseDisplay: "N/A", doseMcg: 0, cadence: "Pre-assay", focus: "Sterile inspection", notes: "Verify seal integrity" },
            { stage: "Stage 2: Experimental Utilization", timeframe: "Active Assay", doseDisplay: "N/A", doseMcg: 0, cadence: "Assay run", focus: "Laboratory handling", notes: "Use aseptic technique" },
            { stage: "Stage 3: Disposal & Waste Stream", timeframe: "Post-Trial", doseDisplay: "N/A", doseMcg: 0, cadence: "Post-assay", focus: "Biohazard containment", notes: "Sharps or chemical disposal" }
          ]
        }
      : {
          standardDoseDisplay,
          standardDoseMcg,
          cadence,
          halfLife,
          typicalProtocolDuration,
          washoutPeriod,
          titrationSteps: titrationSteps || [
            { stage: "Stage 1: Initial Calibration", timeframe: "Weeks 1–2", doseDisplay: `${Math.round(standardDoseMcg * 0.5)} mcg`, doseMcg: Math.round(standardDoseMcg * 0.5), cadence, focus: "Receptor tolerance", notes: "Initial micro-dose" },
            { stage: "Stage 2: Target Maintenance", timeframe: "Weeks 3–6", doseDisplay: `${standardDoseMcg} mcg`, doseMcg: standardDoseMcg, cadence, focus: "Primary therapeutic endpoint", notes: "Standard assay window" },
            { stage: "Stage 3: Peak Cohort", timeframe: "Weeks 7+", doseDisplay: `${Math.round(standardDoseMcg * 1.5)} mcg`, doseMcg: Math.round(standardDoseMcg * 1.5), cadence, focus: "Maximum receptor response", notes: "Escalation cohort" }
          ],
          deliveryRoute: primaryDeliveryRoute,
          routeLabel: primaryDeliveryRoute === "subq" ? "Subcutaneous (SubQ) Protocol" : primaryDeliveryRoute === "oral" ? "Oral Solution / Pipette Standard" : "Intranasal Metered Atomizer"
        },
    syringeGuide: isSupply
      ? {
          syringeType: "Laboratory Instrument / Hardware",
          standardIUDisplay: "N/A",
          needleGauge: "N/A",
          needleLength: "N/A",
          hubType: "N/A",
          deadSpaceCorrection: "N/A",
          recommendedBarrel: "N/A",
          transferNeedle: "N/A",
          graduations: []
        }
      : {
          syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
          standardIUDisplay: `${(standardDoseMcg / (resultingConcentrationMgPerMl * 10)).toFixed(1)} units (${(standardDoseMcg / (resultingConcentrationMgPerMl * 1000)).toFixed(2)} mL)`,
          needleGauge: syringeGuideOverrides.needleGauge || "31G Ultra-Fine (0.25 mm)",
          needleLength: syringeGuideOverrides.needleLength || "5/16\" (8 mm) True SubQ Short Needle",
          hubType: syringeGuideOverrides.hubType || "Fixed Integrated Needle (Ultra-Low Dead Space <0.005 mL)",
          deadSpaceCorrection: syringeGuideOverrides.deadSpaceCorrection || "Fixed Integrated Needle (Ultra-Low Dead Space <0.005 mL)",
          recommendedBarrel: syringeGuideOverrides.recommendedBarrel || (defaultVialNetMg >= 20 ? "1.0 mL Precision Syringe" : "0.3 mL or 0.5 mL U-100 Micro-Barrel"),
          transferNeedle: syringeGuideOverrides.transferNeedle || "21G–23G x 1.5\" sterile needle for diluent transfer",
          graduations: defaultGraduations
        },
    storage: {
      lyophilized: storageOverrides.lyophilized || "-20°C in dry desiccated container (24 months)",
      reconstituted: storageOverrides.reconstituted || "2°C–8°C refrigerated; use within 28 days",
      lightProtection: true
    },
    citations: citations.length > 0 ? citations : isSupply ? [
      { sourceReference: "USP <797> & ISO 13485 Laboratory Sterilization and Consumables Guidelines", notes: "Standard protocols for sterility assurance, particulate control, and aseptic laboratory consumables handling." }
    ] : [
      { sourceReference: "Peer-Reviewed Scientific Literature", notes: "Documented in pharmacological assays and peptide reference compendia." }
    ],
    disclaimer: "All materials are synthesized strictly for controlled in-vitro and laboratory research use only. Not for human, veterinary, therapeutic, or clinical administration.",
    investigatedBenefits: investigatedBenefits.length > 0 ? investigatedBenefits : [
      "Target receptor binding affinity",
      "Biological pathway modulation in analytical models",
      "Cellular metabolism and signaling evaluation"
    ],
    adverseObservations: adverseObservations.length > 0 ? adverseObservations : [
      "Dose-dependent cellular receptor saturation",
      "Requires strict aseptic handling to avoid contamination"
    ],
    protocolCategoryType: (bundleVials && bundleVials.length > 0)
      ? "bundle"
      : isBlend
        ? "blend"
        : isSupply
          ? null
          : "single_peptide",
    isBlend,
    ...(blendConstituents ? { blendConstituents } : {}),
    ...(bundleVials ? { bundleVials } : {}),
    isSupply,
    ...(supplyGuide ? { supplyGuide } : {}),
    primaryDeliveryRoute,
    deliveryRoutes,
    ...(vialStrengthOptions ? { vialStrengthOptions } : {}),
    ...(reconstitutionOptions ? { reconstitutionOptions } : {}),
    molecularDetails
  }

  return protocol
}

export function createCatalogProduct({
  id,
  title,
  category,
  netContentDisplay,
  priceVialOnly,
  priceVialBac,
  priceSubqKit,
  lazadaBenchmarkVialOnly,
  lazadaBenchmarkVialBac,
  lazadaBenchmarkSubqKit,
  descriptionSummary,
  isHardware = false,
  customVariants = null,
  customOptions = null
}) {
  const code = id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5).toUpperCase()
  const timestamp = 1773302090241

  // Map category to category_handle
  const categoryHandleMap = {
    "Metabolic Signaling & Incretins": "metabolic-weight-management-peptides",
    "Tissue Repair & Healing": "healing-tissue-repair-peptides",
    "Cognitive & Neuroprotective": "cognitive-neuroprotective-peptides",
    "Growth Hormone Axis": "growth-hormone-recovery-peptides",
    "Mitochondrial & Cellular Longevity": "longevity-cellular-health-peptides",
    "Skin, Hair & Cellular Matrix": "skin-hair-cosmetic-peptides",
    "Antimicrobial & Immune": "immune-inflammation-research-peptides",
    "Multi-Peptide Blends": "multi-compound-research-bundles",
    "Laboratory Supplies": "research-supplies-accessories"
  }

  const category_handle = categoryHandleMap[category] || "research-supplies-accessories"

  const options = customOptions || (isHardware ? [
    { title: "Packaging", values: ["Standard Pack"] },
    { title: "Inclusion", values: ["Standard Pack"] }
  ] : [
    { title: "Net Content", values: [netContentDisplay] },
    { title: "Inclusion", values: ["Vial Only", "Vial + BAC Water", "Complete SubQ Set"] }
  ])

  const variants = customVariants || [
    {
      title: `${netContentDisplay} / Vial Only`,
      sku: `${code}-${timestamp}-0`,
      pepstack_code: code,
      price_php: priceVialOnly,
      lazada_benchmark_price: lazadaBenchmarkVialOnly || Math.round(priceVialOnly * 1.15),
      options: {
        "Net Content": netContentDisplay,
        "Inclusion": "Vial Only"
      },
      allow_backorder: true,
      manage_inventory: false,
      inventory_quantity: 1000
    },
    {
      title: `${netContentDisplay} / Vial + BAC Water`,
      sku: `${code}-${timestamp}-BAC`,
      pepstack_code: code,
      price_php: priceVialBac,
      lazada_benchmark_price: lazadaBenchmarkVialBac || Math.round(priceVialBac * 1.15),
      options: {
        "Net Content": netContentDisplay,
        "Inclusion": "Vial + BAC Water"
      },
      allow_backorder: true,
      manage_inventory: false,
      inventory_quantity: 1000
    },
    {
      title: `${netContentDisplay} / Complete SubQ Set`,
      sku: `${code}-${timestamp}-SUBQ`,
      pepstack_code: code,
      price_php: priceSubqKit,
      lazada_benchmark_price: lazadaBenchmarkSubqKit || Math.round(priceSubqKit * 1.15),
      options: {
        "Net Content": netContentDisplay,
        "Inclusion": "Complete SubQ Set"
      },
      allow_backorder: true,
      manage_inventory: false,
      inventory_quantity: 1000
    }
  ]

  return {
    title,
    handle: id,
    description: `<p><strong>${title}</strong> is an analytical research standard provisioned for laboratory research and scientific evaluation.</p><p>${descriptionSummary}</p><p><strong>Physical Specification:</strong> Certified lyophilized solid cake in sterile crimped Type 1 borosilicate glass vial.</p>`,
    category_handle,
    type_id: null,
    thumbnail: `http://localhost:9000/static/catalog/${id}/slide1_hero.webp`,
    images: [
      `http://localhost:9000/static/catalog/${id}/slide1_hero.webp`,
      `http://localhost:9000/static/catalog/${id}/slide2_molecular.webp`,
      `http://localhost:9000/static/catalog/${id}/slide3_reconstitution.webp`,
      `http://localhost:9000/static/catalog/${id}/slide4_benefits.webp`,
      `http://localhost:9000/static/catalog/${id}/slide5_kit.webp`,
      `http://localhost:9000/static/catalog/${id}/slide6_superapp.webp`
    ],
    options,
    variants,
    metadata: {
      canonical_protocol_handle: id,
      compound_handle: id
    },
    contraindications: `<p>𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗖𝗢𝗡𝗙𝗜𝗚𝗨𝗥𝗔𝗧𝗜𝗢𝗡𝗦</p><p><br></p><p>VIAL ONLY • 1 × ${title} research vial • Nominal content: ${netContentDisplay}</p><p><br></p><p>VIAL + BAC • 1 × ${title} research vial • 1 × 10 mL multi-dose bacteriostatic water</p><p><br></p><p>SUBQ SET • 1 × ${title} research vial • 1 × 10 mL bacteriostatic water • 10 × sterile U-100 syringes • 10 × 70% IPA prep pads • 1 × sterile transfer pin</p>`,
    compliance: {
      storage_and_handling: "<p>𝗦𝗧𝗢𝗥𝗔𝗚𝗘 𝗖𝗢𝗡𝗗𝗜𝗧𝗜𝗢𝗡𝗦</p><p>Keep sealed at -20°C in a dry desiccated container. Upon aqueous reconstitution, store at 2°C–8°C refrigerated and protect from light.</p>",
      intended_use: "Synthesized strictly for in-vitro laboratory research, analytical calibration, and scientific evaluation. Not for human, clinical, veterinary, therapeutic, or household administration.",
      terms_of_sale: "Purchaser must be an authorized investigator or institutional buyer aged 18+. Purchase constitutes agreement to handle all materials strictly according to standard biosafety protocols.",
      disclaimer: "All materials are synthesized strictly for controlled in-vitro and laboratory research use only. Not for human, veterinary, therapeutic, or clinical administration.",
      packaging_options: "Dispatched in sterile crimped vials with tamper-evident security caps."
    },
    coas: [],
    dosing_monograph: {
      delivery_method: isHardware ? "Labware" : "Inj",
      short_description: `${title} analytical laboratory reference standard.`
    }
  }
}
