import { createProtocol, createCatalogProduct } from "./builder.mjs"

export const BLENDS_BUNDLES_PROTOCOLS = [
  createProtocol({
    id: "cjc-1295-ghrp-2-blend",
    compoundName: "CJC-1295 + GHRP-2 (10mg Dual Blend)",
    handles: ["cjc-1295-ghrp-2-blend", "cjc-ghrp2", "cjc1295-ghrp2-blend"],
    subtitle: "Coordinated GHRH & Ghrelin-Mimetic Pulsatile GH Amplification Standard",
    longDescription: "**What it is:** CJC-1295 + GHRP-2 is a synergistic combination peptide formulation containing 5 mg of CJC-1295 (without DAC) and 5 mg of Growth Hormone Releasing Peptide-2 (GHRP-2) in a single lyophilized matrix.\n\n**How it works:** CJC-1295 binds pituitary GHRH receptors, priming somatotroph cells for secretion, while GHRP-2 simultaneously activates the growth hormone secretagogue receptor (GHS-R1a), inhibiting somatostatin. When administered together, they produce a supra-additive pulse of endogenous growth hormone and IGF-1 far exceeding either peptide alone.\n\n**Why researchers study it:** Researched in acute pulsatile GH restoration, deep-wave slow-wave sleep promotion, and rapid nitrogen retention models.",
    category: "Multi-Peptide Blends",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "200 mcg Combined Dose (100mcg CJC / 100mcg GHRP-2)",
    standardDoseMcg: 200,
    cadence: "1x–2x Daily (Pre-Bed or Post-Workout SubQ)",
    halfLife: "~30 Minutes (Rapid physiological somatotrophic pulse)",
    typicalProtocolDuration: "8 to 12 Weeks",
    isBlend: true,
    blendConstituents: [
      { name: "CJC-1295 (No DAC)", ratioMg: 5, percentageOfTotal: 50 },
      { name: "GHRP-2", ratioMg: 5, percentageOfTotal: 50 }
    ],
    titrationSteps: [
      { stage: "Stage 1: Pulsatile Calibration", timeframe: "Weeks 1–2", doseDisplay: "100 mcg Combined", doseMcg: 100, cadence: "1x Daily (Pre-Bed)", focus: "Pituitary somatotroph sensitization", notes: "2.0 units (0.02 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Pulse Cohort", timeframe: "Weeks 3–8", doseDisplay: "200 mcg Combined", doseMcg: 200, cadence: "1x–2x Daily", focus: "Dual GHRH/GHS-R saturation", notes: "4.0 units (0.04 mL)" },
      { stage: "Stage 3: Advanced Peak Pulse", timeframe: "Weeks 9+", doseDisplay: "300 mcg Combined", doseMcg: 300, cadence: "2x Daily", focus: "Maximum IGF-1 elevation", notes: "6.0 units (0.06 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 16822826", notes: "Teichman et al. Prolonged stimulation of growth hormone and IGF-I secretion by CJC-1295." },
      { sourceReference: "PubMed PMID: 9467554", notes: "Bowers et al. Growth hormone-releasing peptide-2 (GHRP-2): actions in human models." }
    ],
    molecularDetails: { casNumber: "Blend Standard (CJC 863288-34-0 / GHRP-2 158861-67-7)", molarMass: "Combined Equimolar Formulation (5mg / 5mg)" }
  }),

  createProtocol({
    id: "tesamorelin-ipamorelin-blend",
    compoundName: "Tesamorelin + Ipamorelin (10mg Dual Blend)",
    handles: ["tesamorelin-ipamorelin-blend", "tesa-ipam-blend", "tesamorelin-ipamorelin"],
    subtitle: "Selective GHRH Analogue & High-Specificity Secretagogue Matrix",
    longDescription: "**What it is:** Tesamorelin + Ipamorelin is a research blend combining Tesamorelin (trans-3-hexenoyl GHRH, 5 mg) with Ipamorelin (pentapeptide GHS-R agonist, 5 mg).\n\n**How it works:** Tesamorelin selectively targets visceral adipose reduction and endogenous GH pulsatility, while Ipamorelin provides clean, selective GH release without elevating cortisol, prolactin, or ACTH. The combination drives robust lipolysis and lean tissue recovery.\n\n**Why researchers study it:** Researched in abdominal visceral adiposity models, lipid metabolism optimization, and muscle preservation without appetite stimulation.",
    category: "Multi-Peptide Blends",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "1000 mcg Combined (500mcg Tesa / 500mcg Ipam)",
    standardDoseMcg: 1000,
    cadence: "1x Daily (Q24H SubQ Pre-Bed)",
    halfLife: "~30 to 40 Minutes",
    typicalProtocolDuration: "8 to 16 Weeks",
    isBlend: true,
    blendConstituents: [
      { name: "Tesamorelin", ratioMg: 5, percentageOfTotal: 50 },
      { name: "Ipamorelin", ratioMg: 5, percentageOfTotal: 50 }
    ],
    titrationSteps: [
      { stage: "Stage 1: Basal Initiation", timeframe: "Weeks 1–2", doseDisplay: "500 mcg Combined", doseMcg: 500, cadence: "1x Daily", focus: "Receptor tolerance & visceral priming", notes: "10.0 units (0.10 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Maintenance", timeframe: "Weeks 3–10", doseDisplay: "1000 mcg Combined", doseMcg: 1000, cadence: "1x Daily", focus: "Visceral adipose mobilization", notes: "20.0 units (0.20 mL)" },
      { stage: "Stage 3: Advanced Optimization", timeframe: "Weeks 11+", doseDisplay: "1500 mcg Combined", doseMcg: 1500, cadence: "1x Daily", focus: "Maximum IGF-1 and body composition", notes: "30.0 units (0.30 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 20118201", notes: "Falutz et al. Effects of tesamorelin on visceral fat and metabolic profiles (J Clin Endocrinol Metab)." },
      { sourceReference: "PubMed PMID: 9849822", notes: "Raun et al. Ipamorelin, the first selective growth hormone secretagogue (Eur J Endocrinol)." }
    ],
    molecularDetails: { casNumber: "Blend Standard (Tesamorelin 218949-48-5 / Ipamorelin 170851-70-4)", molarMass: "10 mg Net Peptide Solid" }
  }),

  createProtocol({
    id: "aod-cjc-ipam-blend",
    compoundName: "AOD-9604 + CJC-1295 + Ipamorelin (12mg Triple Blend)",
    handles: ["aod-cjc-ipam-blend", "triple-shred-blend", "aod-cjc-ipamorelin"],
    subtitle: "Tri-Action Lipolytic Fragment, GHRH & Clean Secretagogue Synergistic Matrix",
    longDescription: "**What it is:** AOD + CJC + Ipam is a triple synergistic blend containing AOD-9604 (6 mg), CJC-1295 No DAC (3 mg), and Ipamorelin (3 mg) in a unified 2:1:1 stoichiometric ratio (12 mg total).\n\n**How it works:** AOD-9604 directly stimulates adipocyte beta-3 adrenergic receptors to burn stored triglycerides without affecting blood glucose or IGF-1, while CJC-1295 and Ipamorelin elevate endogenous nocturnal GH pulses to accelerate lean tissue recovery.\n\n**Why researchers study it:** Researched in targeted adipose reduction protocols designed to maximize fat loss while preserving muscle nitrogen balance.",
    category: "Multi-Peptide Blends",
    defaultVialNetMg: 12,
    defaultDiluentMl: 2.4,
    standardDoseDisplay: "600 mcg Combined (300mcg AOD / 150mcg CJC / 150mcg Ipam)",
    standardDoseMcg: 600,
    cadence: "1x Daily (Fasted AM or Pre-Bed SubQ)",
    halfLife: "~30 Minutes to 2 Hours",
    typicalProtocolDuration: "8 to 12 Weeks",
    isBlend: true,
    blendConstituents: [
      { name: "AOD-9604", ratioMg: 6, percentageOfTotal: 50 },
      { name: "CJC-1295 (No DAC)", ratioMg: 3, percentageOfTotal: 25 },
      { name: "Ipamorelin", ratioMg: 3, percentageOfTotal: 25 }
    ],
    titrationSteps: [
      { stage: "Stage 1: Triple Priming", timeframe: "Weeks 1–2", doseDisplay: "300 mcg Combined", doseMcg: 300, cadence: "1x Daily", focus: "Beta-3 adrenergic adaptation", notes: "6.0 units (0.06 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Lipolytic Pulse", timeframe: "Weeks 3–8", doseDisplay: "600 mcg Combined", doseMcg: 600, cadence: "1x Daily", focus: "Concurrent lipolysis and GH pulse", notes: "12.0 units (0.12 mL)" },
      { stage: "Stage 3: Peak Cohort", timeframe: "Weeks 9+", doseDisplay: "900 mcg Combined", doseMcg: 900, cadence: "1x Daily", focus: "Maximum body recomposition", notes: "18.0 units (0.18 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 11713213", notes: "Heffernan et al. The effects of human GH and its lipolytic fragment (AOD9604) on lipid metabolism." }
    ],
    molecularDetails: { casNumber: "Tri-Blend Formulation Standard", molarMass: "12 mg Active Lyophilized Complex" }
  }),

  createProtocol({
    id: "ghk-cu-bpc-157-blend",
    compoundName: "GHK-Cu + BPC-157 (60mg Regeneration Blend)",
    handles: ["ghk-cu-bpc-157-blend", "ghk-bpc-blend", "matrix-repair-blend"],
    subtitle: "Dermal Remodeling Copper Tripeptide + Angiogenic Pentadecapeptide Standard",
    longDescription: "**What it is:** GHK-Cu + BPC-157 is an intense regenerative combination peptide pairing Copper Tripeptide-1 (50 mg) with gastric BPC-157 (10 mg) in a 5:1 ratio (60 mg total).\n\n**How it works:** GHK-Cu upregulates collagen, elastin, and glycosaminoglycan synthesis while remodeling scar tissue, and BPC-157 concurrently stimulates VEGF-mediated capillary angiogenesis and egr-1 expression, accelerating extracellular matrix repair.\n\n**Why researchers study it:** Researched in dermal reconstructive biology, rapid tendon-to-bone integration, and post-surgical tissue restoration models.",
    category: "Multi-Peptide Blends",
    defaultVialNetMg: 60,
    defaultDiluentMl: 3.0,
    standardDoseDisplay: "2400 mcg Combined (2000mcg GHK-Cu / 400mcg BPC-157)",
    standardDoseMcg: 2400,
    cadence: "1x Daily (SubQ or Localized Topical/Dermal)",
    halfLife: "~4 to 6 Hours",
    typicalProtocolDuration: "4 to 8 Weeks",
    isBlend: true,
    blendConstituents: [
      { name: "GHK-Cu", ratioMg: 50, percentageOfTotal: 83.3 },
      { name: "BPC-157", ratioMg: 10, percentageOfTotal: 16.7 }
    ],
    titrationSteps: [
      { stage: "Stage 1: Matrix Priming", timeframe: "Weeks 1–2", doseDisplay: "1200 mcg Combined", doseMcg: 1200, cadence: "1x Daily", focus: "Capillary angiogenesis induction", notes: "6.0 units (0.06 mL) at 20.0 mg/mL" },
      { stage: "Stage 2: Target Tissue Regeneration", timeframe: "Weeks 3–6", doseDisplay: "2400 mcg Combined", doseMcg: 2400, cadence: "1x Daily", focus: "Collagen I/III synthesis & remodeling", notes: "12.0 units (0.12 mL)" },
      { stage: "Stage 3: Advanced Healing", timeframe: "Weeks 7+", doseDisplay: "3600 mcg Combined", doseMcg: 3600, cadence: "1x Daily", focus: "Tensile tissue restoration", notes: "18.0 units (0.18 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 29581702", notes: "Pickart et al. Regenerative and protective actions of the GHK-Cu peptide (Int J Mol Sci)." },
      { sourceReference: "PubMed PMID: 21030672", notes: "Chang et al. The promoting effect of pentadecapeptide BPC 157 on tendon healing." }
    ],
    molecularDetails: { casNumber: "Blend (GHK-Cu 49557-75-7 / BPC-157 137525-51-0)", molarMass: "60 mg Active Blend Matrix" }
  }),

  createProtocol({
    id: "epithalon-ta1-blend",
    compoundName: "Epithalon + Thymosin Alpha-1 (15mg Longevity Blend)",
    handles: ["epithalon-ta1-blend", "epithalon-thymosin-alpha1", "longevity-immune-blend"],
    subtitle: "Pineal Telomerase Activator + Thymic Immune Restorer Synergistic Standard",
    longDescription: "**What it is:** Epithalon + Thymosin Alpha-1 is a longevity and immune research combination peptide pairing synthetic Epithalon (10 mg) with Thymosin Alpha-1 (5 mg) in a 2:1 ratio (15 mg total).\n\n**How it works:** Epithalon induces telomerase elongation in somatic cells and restores pineal melatonin rhythmicity, while Thymosin Alpha-1 activates dendritic cell TLR9 signaling and T-helper 1 cell differentiation, coordinating cellular anti-aging with robust immune surveillance.\n\n**Why researchers study it:** Researched in comprehensive gerontological protocols designed to reverse biomarkers of immunosenescence and cellular replicative aging.",
    category: "Multi-Peptide Blends",
    defaultVialNetMg: 15,
    defaultDiluentMl: 3.0,
    standardDoseDisplay: "1500 mcg Combined (1000mcg Epithalon / 500mcg TA-1)",
    standardDoseMcg: 1500,
    cadence: "1x Daily (10 to 20-Day Analytical Pulse)",
    halfLife: "~2 to 4 Hours",
    typicalProtocolDuration: "10 to 20 Days per Research Cycle",
    washoutPeriod: "3 to 6 Months between cycles",
    isBlend: true,
    blendConstituents: [
      { name: "Epithalon", ratioMg: 10, percentageOfTotal: 66.7 },
      { name: "Thymosin Alpha-1", ratioMg: 5, percentageOfTotal: 33.3 }
    ],
    titrationSteps: [
      { stage: "Stage 1: Cycle Initiation", timeframe: "Days 1–3", doseDisplay: "750 mcg Combined", doseMcg: 750, cadence: "1x Daily", focus: "Thymic and pineal receptor priming", notes: "15.0 units (0.15 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Active Replicative Cohort", timeframe: "Days 4–15", doseDisplay: "1500 mcg Combined", doseMcg: 1500, cadence: "1x Daily", focus: "Telomerase induction and immune enhancement", notes: "30.0 units (0.30 mL)" },
      { stage: "Stage 3: Cycle Conclusion", timeframe: "Days 16–20", doseDisplay: "1500 mcg Combined", doseMcg: 1500, cadence: "1x Daily", focus: "Sustained homeostatic reset", notes: "30.0 units (0.30 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 14501383", notes: "Khavinson et al. Pineal-peptide epithalon extends lifespan and stimulates telomerase activity (Bull Exp Biol Med)." },
      { sourceReference: "PubMed PMID: 22898391", notes: "Romani et al. Thymosin alpha1: an endogenous regulator of immune homeostasis." }
    ],
    molecularDetails: { casNumber: "Blend (Epithalon 307297-39-8 / TA-1 62304-98-7)", molarMass: "15 mg Net Peptidic Matrix" }
  }),

  createProtocol({
    id: "igf1-lr3-peg-mgf-bundle",
    compoundName: "IGF-1 LR3 + PEG-MGF (Multi-Vial Hypertrophy Kit)",
    handles: ["igf1-lr3-peg-mgf-bundle", "igf-mgf-stack", "anabolic-hypertrophy-bundle"],
    subtitle: "Complementary Satellite Cell Proliferation & Myotube Fusion Dual Kit",
    longDescription: "**What it is:** The IGF-1 LR3 + PEG-MGF Bundle is a dual-vial research kit consisting of 1 vial of Long R3 IGF-1 (1 mg) and 1 vial of PEG-MGF (2 mg), supplied for coordinated administration schedules.\n\n**How it works:** PEG-MGF activates dormant muscle satellite stem cells and drives local myoblast proliferation, while IGF-1 LR3 subsequently drives satellite cell differentiation, protein synthesis, and amino acid uptake into mature myotubes.\n\n**Why researchers study it:** Researched in muscle wasting, extreme athletic trauma recovery, and neuromuscular junction regeneration models.",
    category: "Multi-Peptide Blends",
    defaultVialNetMg: 3,
    defaultDiluentMl: 3.0,
    standardDoseDisplay: "Coordinated Schedule (50mcg IGF-1 LR3 / 200mcg PEG-MGF)",
    standardDoseMcg: 250,
    cadence: "Bi-Phasic (IGF-1 LR3 daily AM / PEG-MGF 2x weekly post-assay)",
    halfLife: "~20 Hours (IGF-1 LR3) / ~60 Hours (PEG-MGF)",
    typicalProtocolDuration: "4 to 6 Weeks",
    isBlend: true,
    blendConstituents: [
      { name: "IGF-1 LR3", ratioMg: 1, percentageOfTotal: 33.3 },
      { name: "PEG-MGF", ratioMg: 2, percentageOfTotal: 66.7 }
    ],
    bundleVials: [
      {
        compoundName: "Long R3 IGF-1",
        vialNetMass: "1 mg",
        diluentMl: 1.0,
        concMgMl: 1.0,
        solvent: "0.6% Acetic Acid or Bacteriostatic Water USP",
        reconstitutionInstructions: "Reconstitute with 1.0 mL diluent. Swirl gently.",
        targetDose: "20 mcg – 50 mcg daily",
        cadence: "Daily Pre-Assay SubQ",
        syringeUnits: "2.0 to 5.0 units on U-100 syringe"
      },
      {
        compoundName: "PEG-MGF",
        vialNetMass: "2 mg",
        diluentMl: 2.0,
        concMgMl: 1.0,
        solvent: "Bacteriostatic Water USP",
        reconstitutionInstructions: "Reconstitute with 2.0 mL BAC water.",
        targetDose: "100 mcg – 200 mcg per session",
        cadence: "2x–3x Weekly Post-Assay",
        syringeUnits: "10.0 to 20.0 units on U-100 syringe"
      }
    ],
    titrationSteps: [
      { stage: "Stage 1: Satellite Proliferation", timeframe: "Weeks 1–2", doseDisplay: "20mcg IGF / 100mcg MGF", doseMcg: 120, cadence: "Coordinated", focus: "Satellite stem cell activation", notes: "Dual vial protocol" },
      { stage: "Stage 2: Target Hypertrophy", timeframe: "Weeks 3–4", doseDisplay: "50mcg IGF / 200mcg MGF", doseMcg: 250, cadence: "Coordinated", focus: "Myotube fusion & protein synthesis", notes: "Dual vial target" },
      { stage: "Stage 3: Advanced Remodeling", timeframe: "Weeks 5–6", doseDisplay: "50mcg IGF / 200mcg MGF", doseMcg: 250, cadence: "Coordinated", focus: "Extracellular matrix consolidation", notes: "Cycle completion" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 15741258", notes: "Yang et al. Roles of MGF and mature IGF-I in myoblast proliferation and differentiation." }
    ],
    molecularDetails: { casNumber: "Multi-Vial Kit (IGF-1 LR3 949837-92-9 / PEG-MGF 918663-78-6)", molarMass: "3 mg Total Kit Content" }
  }),

  createProtocol({
    id: "triple-metabolic-bundle",
    compoundName: "Triple Metabolic Incretin Stack (Retatrutide + Cagrilintide + AOD)",
    handles: ["triple-metabolic-bundle", "triple-incretin-stack", "tri-metabolic-kit"],
    subtitle: "Tri-Agonist GIP/GLP-1/Glucagon + Amylin + Lipolytic AOD Multi-Vial Standard",
    longDescription: "**What it is:** The Triple Metabolic Incretin Stack is an analytical multi-vial research kit containing Retatrutide (10 mg), Cagrilintide (5 mg), and AOD-9604 (5 mg) in 3 separate lyophilized vials (20 mg total).\n\n**How it works:** Retatrutide engages GIP, GLP-1, and glucagon receptors for profound energy expenditure and glycemic stability; Cagrilintide engages central amylin receptors to induce durable postprandial satiety; and AOD-9604 acts peripherally on adipocyte beta-3 receptors to accelerate triglyceride breakdown without glycemic disruption.\n\n**Why researchers study it:** Researched as the most comprehensive multi-pathway metabolic standard in contemporary pharmacological research, addressing appetite, insulin sensitivity, thermogenesis, and direct adipocyte lipolysis.",
    category: "Multi-Peptide Blends",
    defaultVialNetMg: 20,
    defaultDiluentMl: 4.0,
    standardDoseDisplay: "Multi-Vial Titration Schedule",
    standardDoseMcg: 2500,
    cadence: "Weekly (Retatrutide/Cagrilintide Q7D) + Daily (AOD-9604 Fasted AM)",
    halfLife: "~140h (Reta) / ~168h (Cagri) / ~30m (AOD)",
    typicalProtocolDuration: "12 to 24 Weeks",
    isBlend: true,
    blendConstituents: [
      { name: "Retatrutide", ratioMg: 10, percentageOfTotal: 50 },
      { name: "Cagrilintide", ratioMg: 5, percentageOfTotal: 25 },
      { name: "AOD-9604", ratioMg: 5, percentageOfTotal: 25 }
    ],
    bundleVials: [
      {
        compoundName: "Retatrutide",
        vialNetMass: "10 mg",
        diluentMl: 2.0,
        concMgMl: 5.0,
        solvent: "Bacteriostatic Water USP",
        reconstitutionInstructions: "Introduce 2.0 mL BAC water. Swirl gently.",
        targetDose: "2 mg – 4 mg weekly",
        cadence: "1x Every 7 Days",
        syringeUnits: "40.0 to 80.0 units on U-100 syringe"
      },
      {
        compoundName: "Cagrilintide",
        vialNetMass: "5 mg",
        diluentMl: 2.0,
        concMgMl: 2.5,
        solvent: "Bacteriostatic Water USP",
        reconstitutionInstructions: "Introduce 2.0 mL BAC water. Swirl gently.",
        targetDose: "0.3 mg – 1.2 mg weekly",
        cadence: "1x Every 7 Days",
        syringeUnits: "12.0 to 48.0 units on U-100 syringe"
      },
      {
        compoundName: "AOD-9604",
        vialNetMass: "5 mg",
        diluentMl: 2.0,
        concMgMl: 2.5,
        solvent: "Bacteriostatic Water USP",
        reconstitutionInstructions: "Introduce 2.0 mL BAC water. Swirl gently.",
        targetDose: "300 mcg daily",
        cadence: "Daily Fasted Morning",
        syringeUnits: "12.0 units on U-100 syringe"
      }
    ],
    titrationSteps: [
      { stage: "Stage 1: Multi-Pathway Induction", timeframe: "Weeks 1–4", doseDisplay: "Reta 2mg / Cagri 0.3mg / AOD 300mcg", doseMcg: 1500, cadence: "Protocol schedule", focus: "GI tolerability & lipolytic priming", notes: "3-vial coordinated protocol" },
      { stage: "Stage 2: Target Synergistic Escalation", timeframe: "Weeks 5–12", doseDisplay: "Reta 4mg / Cagri 0.6mg / AOD 300mcg", doseMcg: 2500, cadence: "Protocol schedule", focus: "Maximal steatotic lipid clearance", notes: "3-vial target tier" },
      { stage: "Stage 3: Advanced Maintenance", timeframe: "Weeks 13+", doseDisplay: "Reta 6mg / Cagri 1.2mg / AOD 300mcg", doseMcg: 3500, cadence: "Protocol schedule", focus: "Peak metabolic rate elevation", notes: "3-vial peak maintenance" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 37366315", notes: "Jastreboff et al. Triple-hormone-receptor agonist retatrutide for obesity (NEJM 2023)." },
      { sourceReference: "PubMed PMID: 37385280", notes: "Frias et al. Efficacy and safety of cagrilintide combinations (Lancet)." }
    ],
    molecularDetails: { casNumber: "Tri-Compound Incretin Kit Standard", molarMass: "20 mg Net Peptide Mass" }
  })
]

export const BLENDS_BUNDLES_PRODUCTS = [
  createCatalogProduct({
    id: "cjc-1295-ghrp-2-blend",
    title: "CJC-1295 + GHRP-2 (10mg Dual Blend)",
    category: "Multi-Peptide Blends",
    netContentDisplay: "10MG",
    priceVialOnly: 3200,
    priceVialBac: 3400,
    priceSubqKit: 3520,
    descriptionSummary: "Coordinated GHRH and ghrelin-mimetic GHRP-2 combination peptide for pulsatile GH research."
  }),
  createCatalogProduct({
    id: "tesamorelin-ipamorelin-blend",
    title: "Tesamorelin + Ipamorelin (10mg Dual Blend)",
    category: "Multi-Peptide Blends",
    netContentDisplay: "10MG",
    priceVialOnly: 3600,
    priceVialBac: 3800,
    priceSubqKit: 3920,
    descriptionSummary: "Selective visceral adiposity-targeting GHRH paired with clean secretagogue Ipamorelin."
  }),
  createCatalogProduct({
    id: "aod-cjc-ipam-blend",
    title: "AOD-9604 + CJC + Ipamorelin (12mg Triple Blend)",
    category: "Multi-Peptide Blends",
    netContentDisplay: "12MG",
    priceVialOnly: 3800,
    priceVialBac: 4000,
    priceSubqKit: 4120,
    descriptionSummary: "Tri-action formulation combining lipolytic AOD-9604 with CJC-1295 and Ipamorelin."
  }),
  createCatalogProduct({
    id: "ghk-cu-bpc-157-blend",
    title: "GHK-Cu + BPC-157 (60mg Regeneration Blend)",
    category: "Multi-Peptide Blends",
    netContentDisplay: "60MG",
    priceVialOnly: 3900,
    priceVialBac: 4100,
    priceSubqKit: 4220,
    descriptionSummary: "High-concentration GHK-Cu (50mg) combined with BPC-157 (10mg) for extracellular matrix regeneration."
  }),
  createCatalogProduct({
    id: "epithalon-ta1-blend",
    title: "Epithalon + Thymosin Alpha-1 (15mg Longevity Blend)",
    category: "Multi-Peptide Blends",
    netContentDisplay: "15MG",
    priceVialOnly: 3800,
    priceVialBac: 4000,
    priceSubqKit: 4120,
    descriptionSummary: "Pineal telomerase activator Epithalon paired with thymic immune modulator Thymosin Alpha-1."
  }),
  createCatalogProduct({
    id: "igf1-lr3-peg-mgf-bundle",
    title: "IGF-1 LR3 + PEG-MGF (Multi-Vial Hypertrophy Kit)",
    category: "Multi-Peptide Blends",
    netContentDisplay: "3MG",
    priceVialOnly: 4500,
    priceVialBac: 4700,
    priceSubqKit: 4820,
    descriptionSummary: "Dual-vial research kit containing Long R3 IGF-1 (1mg) and PEG-MGF (2mg) for muscle biology studies."
  }),
  createCatalogProduct({
    id: "triple-metabolic-bundle",
    title: "Triple Metabolic Incretin Stack (Reta + Cagri + AOD)",
    category: "Multi-Peptide Blends",
    netContentDisplay: "20MG",
    priceVialOnly: 5800,
    priceVialBac: 6000,
    priceSubqKit: 6150,
    descriptionSummary: "Tri-vial premier metabolic research standard pairing Retatrutide, Cagrilintide, and AOD-9604."
  })
]
