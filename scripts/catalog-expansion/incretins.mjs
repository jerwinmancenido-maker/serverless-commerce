import { createProtocol, createCatalogProduct, createGraduation } from "./builder.mjs"

export const INCRETINS_PROTOCOLS = [
  createProtocol({
    id: "cagrisema-blend",
    compoundName: "CagriSema (Cagrilintide 5mg + Semaglutide 5mg Blend)",
    handles: ["cagrisema", "cagrisema-blend", "cagrilintide-semaglutide"],
    subtitle: "Dual-Action Amylin & GLP-1 Receptor Co-Agonist Stoichiometric Standard",
    longDescription: "**What it is:** CagriSema is an advanced dual-hormone combination peptide pairing Cagrilintide (a long-acting amylin analogue) and Semaglutide (a validated GLP-1 receptor agonist) in a precise 1:1 stoichiometric ratio (5mg / 5mg).\n\n**How it works:** By concurrently engaging the area postrema and ventral tegmental area via calcitonin/RAMP amylin receptor complexes while stimulating hypothalamic GLP-1 receptors, CagriSema produces profound synergistic suppression of appetite, deceleration of gastric emptying, and restoration of glycemic setpoints exceeding either agent alone.\n\n**Why researchers study it:** Investigated in Phase 3 trials (REDEFINE program) for unmatched weight reduction (exceeding 25% in clinical cohorts) and significant improvements in cardiovascular and metabolic biomarkers.",
    category: "Metabolic Signaling & Incretins",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "0.5 mg – 2.4 mg Weekly SubQ",
    standardDoseMcg: 500,
    cadence: "1x Every 7 Days (Weekly SubQ)",
    halfLife: "~168 Hours (~7 Days Terminal Half-Life)",
    typicalProtocolDuration: "16 to 32 Weeks Titration Block",
    washoutPeriod: "6 Weeks between research cohorts",
    isBlend: true,
    blendConstituents: [
      { name: "Cagrilintide", ratioMg: 5, percentageOfTotal: 50 },
      { name: "Semaglutide", ratioMg: 5, percentageOfTotal: 50 }
    ],
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Weeks 1–4", doseDisplay: "0.5 mg Weekly", doseMcg: 500, cadence: "1x Every 7 Days", focus: "GI tolerability", notes: "10.0 units (0.10 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Mid-Dose Titration", timeframe: "Weeks 5–8", doseDisplay: "1.0 mg Weekly", doseMcg: 1000, cadence: "1x Every 7 Days", focus: "Satiety escalation", notes: "20.0 units (0.20 mL)" },
      { stage: "Stage 3: Advanced Cohort", timeframe: "Weeks 9–12", doseDisplay: "1.7 mg Weekly", doseMcg: 1700, cadence: "1x Every 7 Days", focus: "Dual receptor saturation", notes: "34.0 units (0.34 mL)" },
      { stage: "Stage 4: Target Maintenance", timeframe: "Weeks 13+", doseDisplay: "2.4 mg Weekly", doseMcg: 2400, cadence: "1x Every 7 Days", focus: "Primary trial endpoint", notes: "48.0 units (0.48 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 37385280", notes: "Frias et al. Efficacy and safety of cagrilintide plus semaglutide in individuals with obesity: REDEFINE Phase 2 (Lancet)." },
      { sourceReference: "PubMed PMID: 34146522", notes: "DeBlock et al. Cagrilintide, a long-acting amylin analogue, in combination with semaglutide (Lancet Diabetes Endocrinol)." }
    ],
    investigatedBenefits: [
      "Dual amylin and GLP-1 receptor coordinated neuro-signaling",
      "Superior appetite and hedonic food intake reduction over single incretins",
      "Robust preservation of glycemic control and insulin sensitivity"
    ],
    adverseObservations: [
      "Dose-dependent transient nausea and gastrointestinal symptoms during rapid escalation",
      "Transient delayed gastric emptying effects"
    ],
    molecularDetails: {
      casNumber: "Blend (Cagrilintide 1415456-99-3 / Semaglutide 910463-68-2)",
      molarMass: "8,530.8 g/mol Combined Equimolar Basis"
    }
  }),

  createProtocol({
    id: "orforglipron",
    compoundName: "Orforglipron (LY3502970)",
    handles: ["orforglipron", "ly3502970"],
    subtitle: "Oral Non-Peptide GLP-1 Receptor Agonist Analytical Monograph",
    longDescription: "**What it is:** Orforglipron (LY3502970) is a pioneering non-peptide small-molecule agonist of the GLP-1 receptor, engineered to achieve high oral bioavailability without requiring absorption enhancers.\n\n**How it works:** Orforglipron binds to the transmembrane domain of the GLP-1 receptor, allosterically inducing downstream cAMP accumulation and glucose-dependent insulin secretion while profoundly suppressing appetite.\n\n**Why researchers study it:** Researched in Phase 3 clinical trials (ACHIEVE program) for oral efficacy rivaling injectable peptide incretins, achieving significant reductions in HbA1c and body weight.",
    category: "Metabolic Signaling & Incretins",
    defaultVialNetMg: 12,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "3.0 mg – 12.0 mg Daily Analytical Window",
    standardDoseMcg: 3000,
    cadence: "1x Daily (Q24H)",
    halfLife: "~29 to 49 Hours",
    typicalProtocolDuration: "12 to 26 Weeks Evaluation Block",
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "oral"],
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Weeks 1–4", doseDisplay: "3.0 mg Daily", doseMcg: 3000, cadence: "1x Daily", focus: "Receptor tolerance", notes: "50.0 units (0.50 mL) at 6.0 mg/mL" },
      { stage: "Stage 2: Titration", timeframe: "Weeks 5–8", doseDisplay: "6.0 mg Daily", doseMcg: 6000, cadence: "1x Daily", focus: "Glycemic optimization", notes: "100.0 units (1.00 mL) at 6.0 mg/mL" },
      { stage: "Stage 3: Maintenance", timeframe: "Weeks 9+", doseDisplay: "12.0 mg Daily", doseMcg: 12000, cadence: "1x Daily", focus: "Maximum receptor saturation", notes: "Target clinical tier" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 37352220", notes: "Pratt et al. Daily Oral GLP-1 Receptor Agonist Orforglipron for Adults with Obesity (NEJM 2023)." }
    ],
    molecularDetails: { casNumber: "2212020-52-3", formula: "C42H39F2N7O4" }
  }),

  createProtocol({
    id: "pemvidutide",
    compoundName: "Pemvidutide (ALT-801)",
    handles: ["pemvidutide", "alt-801"],
    subtitle: "Balanced Dual GLP-1/Glucagon Receptor Agonist Standard",
    longDescription: "**What it is:** Pemvidutide (ALT-801) is a synthetic, long-acting dual agonist targeting both the GLP-1 receptor and the Glucagon receptor with an equimolar (1:1) potency ratio, formulated with a site-specific lipid diacid chain.\n\n**How it works:** GLP-1 activation delivers glycemic stability and central satiety suppression, while concurrent glucagon receptor activation stimulates direct mitochondrial hepatic fat burning (beta-oxidation) and increased resting metabolic rate.\n\n**Why researchers study it:** Researched in Phase 2 trials (MOMENTUM study) for metabolic dysfunction-associated steatohepatitis (MASH) and profound reduction of hepatic liver fat (over 75% relative reduction).",
    category: "Metabolic Signaling & Incretins",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "1.2 mg – 2.4 mg Weekly SubQ",
    standardDoseMcg: 1200,
    cadence: "1x Every 7 Days (Weekly SubQ)",
    halfLife: "~140 Hours (Long-Acting PK Profile)",
    typicalProtocolDuration: "12 to 24 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Hepatic Induction", timeframe: "Weeks 1–4", doseDisplay: "1.2 mg Weekly", doseMcg: 1200, cadence: "1x Every 7 Days", focus: "Initial glucagon receptor priming", notes: "24.0 units (0.24 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Maintenance", timeframe: "Weeks 5–12", doseDisplay: "1.8 mg Weekly", doseMcg: 1800, cadence: "1x Every 7 Days", focus: "Hepatic lipid clearance", notes: "36.0 units (0.36 mL)" },
      { stage: "Stage 3: Advanced Optimization", timeframe: "Weeks 13+", doseDisplay: "2.4 mg Weekly", doseMcg: 2400, cadence: "1x Every 7 Days", focus: "Peak steatohepatitis resolution", notes: "48.0 units (0.48 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 38552174", notes: "Alkhouri et al. Pemvidutide in metabolic dysfunction-associated steatotic liver disease: MOMENTUM Phase 2." }
    ],
    molecularDetails: { casNumber: "2446738-41-4", sequenceOrFormula: "40AA Dual Agonist Fatty-Acid Lipidated" }
  }),

  createProtocol({
    id: "cotadutide",
    compoundName: "Cotadutide (MEDI0382)",
    handles: ["cotadutide", "medi0382"],
    subtitle: "Dual GLP-1/Glucagon Receptor Agonist for Glycemic & Renal Protection",
    longDescription: "**What it is:** Cotadutide (MEDI0382) is a potent synthetic oxyntomodulin-like peptide engineered with balanced dual agonism at both GLP-1 and glucagon receptors, conjugated with a palmitoyl fatty acid chain for extended half-life.\n\n**How it works:** By engaging both GLP-1R and GCGR, Cotadutide stimulates insulin release, delays gastric emptying, improves whole-body energy expenditure, and promotes renal hemodynamic preservation in models of diabetic nephropathy.\n\n**Why researchers study it:** Studied in Phase 2 clinical trials for type 2 diabetes with chronic kidney disease (CKD) and non-alcoholic fatty liver disease.",
    category: "Metabolic Signaling & Incretins",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "300 mcg – 600 mcg Daily SubQ",
    standardDoseMcg: 300,
    cadence: "1x Daily (Q24H SubQ)",
    halfLife: "~12 Hours",
    typicalProtocolDuration: "8 to 12 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Weeks 1–2", doseDisplay: "100 mcg Daily", doseMcg: 100, cadence: "1x Daily", focus: "GI adaptation", notes: "2.0 units (0.02 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Titration", timeframe: "Weeks 3–6", doseDisplay: "300 mcg Daily", doseMcg: 300, cadence: "1x Daily", focus: "Glycemic control", notes: "6.0 units (0.06 mL)" },
      { stage: "Stage 3: Maintenance", timeframe: "Weeks 7+", doseDisplay: "600 mcg Daily", doseMcg: 600, cadence: "1x Daily", focus: "Renal & hepatic endpoints", notes: "12.0 units (0.12 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 33446549", notes: "Parker et al. Cotadutide, a dual GLP-1 and glucagon receptor agonist, in patients with T2D (Lancet Diabetes Endocrinol)." }
    ],
    molecularDetails: { casNumber: "1675203-84-5", molecularWeightGPerMol: 3886.4 }
  }),

  createProtocol({
    id: "ecnoglutide",
    compoundName: "Ecnoglutide (XW003)",
    handles: ["ecnoglutide", "xw003"],
    subtitle: "Biased Long-Acting GLP-1 Receptor Agonist Analytical Reference",
    longDescription: "**What it is:** Ecnoglutide (XW003) is a cAMP-biased GLP-1 receptor agonist with an optimized hydrophobic fatty acid diacid moiety that minimizes beta-arrestin recruitment, reducing receptor desensitization and internalization.\n\n**How it works:** Selective cAMP signaling delivers potent insulinotropic and satiety actions with reduced receptor down-regulation, extending pharmacodynamic duration and improving tolerability.\n\n**Why researchers study it:** Under active Phase 3 clinical evaluation for robust glycemic control and weight management in obesity.",
    category: "Metabolic Signaling & Incretins",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "0.6 mg – 2.4 mg Weekly SubQ",
    standardDoseMcg: 600,
    cadence: "1x Every 7 Days (Weekly SubQ)",
    halfLife: "~160 Hours",
    typicalProtocolDuration: "16 to 24 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Weeks 1–4", doseDisplay: "0.6 mg Weekly", doseMcg: 600, cadence: "1x Every 7 Days", focus: "Receptor tolerance", notes: "12.0 units (0.12 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Mid-Dose", timeframe: "Weeks 5–8", doseDisplay: "1.2 mg Weekly", doseMcg: 1200, cadence: "1x Every 7 Days", focus: "Appetite suppression", notes: "24.0 units (0.24 mL)" },
      { stage: "Stage 3: Target Cohort", timeframe: "Weeks 9+", doseDisplay: "2.4 mg Weekly", doseMcg: 2400, cadence: "1x Every 7 Days", focus: "Maintenance endpoint", notes: "48.0 units (0.48 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 37978250", notes: "Ji et al. Efficacy and safety of ecnoglutide in adults with type 2 diabetes (Lancet)." }
    ],
    molecularDetails: { casNumber: "2609071-89-6", sequenceOrFormula: "cAMP-Biased Lipidated Analogue" }
  }),

  createProtocol({
    id: "slu-pp-332",
    compoundName: "SLU-PP-332",
    handles: ["slu-pp-332", "slupp332"],
    subtitle: "Pan-Estrogen-Related Receptor (ERR) Agonist · Exercise Mimetic Standard",
    longDescription: "**What it is:** SLU-PP-332 is a novel synthetic small molecule that acts as a potent pan-agonist of estrogen-related receptors (ERRα, ERRβ, and ERRγ), crucial nuclear transcription factors regulating cellular mitochondrial biogenesis.\n\n**How it works:** By selectively activating ERR receptors, SLU-PP-332 mimics the genetic expression cascade induced by aerobic endurance training, dramatically increasing mitochondrial fatty acid oxidation and cellular endurance in skeletal muscle fibers.\n\n**Why researchers study it:** Investigated as an 'exercise-in-a-bottle' mimetic for muscle wasting, metabolic syndrome, and cardiac function preservation.",
    category: "Metabolic Signaling & Incretins",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "500 mcg – 2000 mcg Daily SubQ / Oral",
    standardDoseMcg: 500,
    cadence: "1x Daily (Q24H SubQ)",
    halfLife: "~8 to 12 Hours",
    typicalProtocolDuration: "6 to 12 Weeks",
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "oral"],
    titrationSteps: [
      { stage: "Stage 1: Basal ERR Priming", timeframe: "Weeks 1–2", doseDisplay: "250 mcg Daily", doseMcg: 250, cadence: "1x Daily", focus: "Mitochondrial adaptation", notes: "5.0 units (0.05 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Evaluation", timeframe: "Weeks 3–6", doseDisplay: "500 mcg Daily", doseMcg: 500, cadence: "1x Daily", focus: "Fatty acid oxidation", notes: "10.0 units (0.10 mL)" },
      { stage: "Stage 3: Peak Cohort", timeframe: "Weeks 7+", doseDisplay: "1000 mcg Daily", doseMcg: 1000, cadence: "1x Daily", focus: "Endurance mimicking", notes: "20.0 units (0.20 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 37737222", notes: "Billingsley et al. A synthetic ERR agonist mimics exercise gene networks in muscle (J Pharmacol Exp Ther 2023)." }
    ],
    molecularDetails: { casNumber: "3032506-61-4", formula: "C19H14F3NO2", molecularWeightGPerMol: 345.3 }
  }),

  createProtocol({
    id: "adipotide",
    compoundName: "Adipotide (FTPP)",
    handles: ["adipotide", "ftpp"],
    subtitle: "Prohibitin-Targeting Adipose Vascular Proapoptotic Peptidic Standard",
    longDescription: "**What it is:** Adipotide (also known as FTPP) is a targeted peptidomimetic composed of a homing domain that binds to prohibitin on the vascular surface of white adipose tissue coupled to a pro-apoptotic cellular disruption domain.\n\n**How it works:** Once bound to prohibitin in white fat blood vessels, the apoptotic domain disrupts mitochondrial membranes in vascular endothelial cells, depriving white fat deposits of blood supply and leading to selective adipose atrophy.\n\n**Why researchers study it:** Researched in primates and rodent models for rapid, targeted reduction of subcutaneous and visceral fat volume.",
    category: "Metabolic Signaling & Incretins",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "250 mcg – 500 mcg Daily SubQ (28-Day Cycle)",
    standardDoseMcg: 250,
    cadence: "1x Daily (Q24H SubQ for 28-Day Analytical Block)",
    halfLife: "~2 to 4 Hours",
    typicalProtocolDuration: "28 Days Maximum per Analytical Cycle",
    washoutPeriod: "8 Weeks Minimum before re-evaluation",
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Days 1–7", doseDisplay: "100 mcg Daily", doseMcg: 100, cadence: "1x Daily", focus: "Renal biomarker baseline", notes: "2.0 units (0.02 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Evaluation", timeframe: "Days 8–21", doseDisplay: "250 mcg Daily", doseMcg: 250, cadence: "1x Daily", focus: "Adipose apoptosis observation", notes: "5.0 units (0.05 mL)" },
      { stage: "Stage 3: Peak Block", timeframe: "Days 22–28", doseDisplay: "500 mcg Daily", doseMcg: 500, cadence: "1x Daily", focus: "Cycle conclusion", notes: "10.0 units (0.10 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 22072637", notes: "Barnhart et al. A peptidomimetic targeting white fat vasculature causes weight loss in primates (Sci Transl Med 2011)." }
    ],
    molecularDetails: { casNumber: "137525-51-0", sequenceOrFormula: "CKGGRAKDC-GG-(KLAKLAK)2" }
  }),

  createProtocol({
    id: "l-carnitine",
    compoundName: "Injectable L-Carnitine (600 mg/mL)",
    handles: ["l-carnitine", "injectable-l-carnitine", "lcarnitine"],
    subtitle: "High-Concentration Mitochondrial Fatty Acid Shuttle Analytical Standard",
    longDescription: "**What it is:** Injectable L-Carnitine is a high-purity aqueous formulation of (R)-(3-carboxy-2-hydroxypropyl)trimethylammonium hydroxide, providing 600 mg/mL USP pharmaceutical-grade active carrier.\n\n**How it works:** L-Carnitine serves as an essential cofactor for carnitine palmitoyltransferase-1 (CPT-1), facilitating the transport of long-chain fatty acids across the inner mitochondrial membrane for beta-oxidation and ATP generation.\n\n**Why researchers study it:** Evaluated in cellular bioenergetics, androgen receptor up-regulation, recovery from high-intensity training models, and metabolic lipid clearance.",
    category: "Metabolic Signaling & Incretins",
    defaultVialNetMg: 600,
    defaultDiluentMl: 1.0,
    solvent: "Sterile Aqueous Vehicle USP",
    standardDoseDisplay: "200 mg – 600 mg Pre-Assay SubQ/IM",
    standardDoseMcg: 300000,
    cadence: "Pre-Experimental Assay (3x–5x Weekly)",
    halfLife: "~15 Hours",
    typicalProtocolDuration: "8 to 16 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Micro-Calibration", timeframe: "Week 1", doseDisplay: "150 mg SubQ", doseMcg: 150000, cadence: "3x Weekly", focus: "Local tissue tolerability", notes: "25.0 units (0.25 mL) at 600 mg/mL" },
      { stage: "Stage 2: Target Assay", timeframe: "Weeks 2–8", doseDisplay: "300 mg SubQ", doseMcg: 300000, cadence: "Daily pre-assay", focus: "Mitochondrial beta-oxidation", notes: "50.0 units (0.50 mL)" },
      { stage: "Stage 3: Full Saturation", timeframe: "Weeks 9+", doseDisplay: "600 mg SubQ/IM", doseMcg: 600000, cadence: "Daily pre-assay", focus: "Max CPT-1 saturation", notes: "100.0 units (1.00 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 15212755", notes: "Karlic & Lohninger. Supplementation of L-carnitine in athletes: does it make sense? (Nutrition 2004)." }
    ],
    molecularDetails: { casNumber: "541-15-1", formula: "C7H15NO3", molecularWeightGPerMol: 161.2 }
  }),

  createProtocol({
    id: "pramlintide",
    compoundName: "Pramlintide",
    handles: ["pramlintide"],
    subtitle: "Synthetic Human Amylin Receptor Agonist Reference Monograph",
    longDescription: "**What it is:** Pramlintide is a synthetic analogue of human amylin with three proline substitutions (at positions 25, 28, and 29) designed to prevent self-aggregation into amyloid fibrils while maintaining full biological potency.\n\n**How it works:** Pramlintide activates calcitonin/RAMP receptor complexes, centrally suppressing postprandial glucagon secretion, slowing gastric emptying rate, and enhancing satiety signaling.\n\n**Why researchers study it:** Researched as an analytical comparator in postprandial glucose dynamics and dual-incretin research.",
    category: "Metabolic Signaling & Incretins",
    defaultVialNetMg: 5,
    defaultDiluentMl: 2.5,
    standardDoseDisplay: "30 mcg – 120 mcg Pre-Prandial SubQ",
    standardDoseMcg: 60,
    cadence: "Pre-Experimental Ingestion SubQ",
    halfLife: "~48 Minutes",
    typicalProtocolDuration: "8 to 12 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Low Initiation", timeframe: "Weeks 1–2", doseDisplay: "30 mcg", doseMcg: 30, cadence: "Pre-assay", focus: "GI adaptation", notes: "1.5 units (0.015 mL) at 2.0 mg/mL" },
      { stage: "Stage 2: Target Titration", timeframe: "Weeks 3–6", doseDisplay: "60 mcg", doseMcg: 60, cadence: "Pre-assay", focus: "Glucagon suppression", notes: "3.0 units (0.03 mL)" },
      { stage: "Stage 3: Advanced Ceiling", timeframe: "Weeks 7+", doseDisplay: "120 mcg", doseMcg: 120, cadence: "Pre-assay", focus: "Peak satiety", notes: "6.0 units (0.06 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 12032107", notes: "Hollander et al. Addition of pramlintide to insulin therapy improves long-term glycemic control (Diabetes Care)." }
    ],
    molecularDetails: { casNumber: "151126-32-8", formula: "C171H267N51O53S2", molecularWeightGPerMol: 3949.4 }
  }),

  createProtocol({
    id: "sr9009",
    compoundName: "SR9009 (Stenabolic)",
    handles: ["sr9009", "stenabolic"],
    subtitle: "Synthetic Rev-ErbA Agonist · Circadian Rhythm & Mitochondrial Biogenesis Standard",
    longDescription: "**What it is:** SR9009 (Stenabolic) is a synthetic small-molecule agonist of Rev-ErbAα and Rev-ErbAβ, nuclear hormone receptors that orchestrate the mammalian circadian clock and metabolic homeostasis.\n\n**How it works:** By binding Rev-Erb receptors, SR9009 upregulates the transcription of fatty acid and glucose oxidation genes, increasing mitochondrial density in skeletal muscle and driving resting metabolic expenditure.\n\n**Why researchers study it:** Famous in preclinical exercise physiology for boosting running capacity, aerobic endurance, and energy expenditure in murine models without physical training.",
    category: "Metabolic Signaling & Incretins",
    defaultVialNetMg: 20,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "5.0 mg – 20.0 mg Daily Analytical Window",
    standardDoseMcg: 5000,
    cadence: "Divided Dosing (2x–3x Daily Due to Short Half-Life)",
    halfLife: "~4 to 5 Hours",
    typicalProtocolDuration: "6 to 8 Weeks",
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "oral"],
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Weeks 1–2", doseDisplay: "5.0 mg Daily", doseMcg: 5000, cadence: "2x Daily (2.5mg split)", focus: "Circadian baseline", notes: "25.0 units (0.25 mL) at 10.0 mg/mL" },
      { stage: "Stage 2: Target Evaluation", timeframe: "Weeks 3–6", doseDisplay: "10.0 mg Daily", doseMcg: 10000, cadence: "2x Daily (5mg split)", focus: "Mitochondrial density", notes: "50.0 units (0.50 mL)" },
      { stage: "Stage 3: Peak Cohort", timeframe: "Weeks 7–8", doseDisplay: "20.0 mg Daily", doseMcg: 20000, cadence: "3x Daily (6.6mg split)", focus: "Beta-oxidation", notes: "100.0 units (1.00 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 22460952", notes: "Solt et al. Regulation of circadian behaviour and metabolism by synthetic Rev-Erb agonists (Nature 2012)." }
    ],
    molecularDetails: { casNumber: "1379686-30-2", formula: "C20H24ClN3O4S", molecularWeightGPerMol: 437.94 }
  })
]

export const INCRETINS_PRODUCTS = [
  createCatalogProduct({
    id: "cagrisema-blend",
    title: "CagriSema (10mg Dual Incretin Blend)",
    category: "Metabolic Signaling & Incretins",
    netContentDisplay: "10MG",
    priceVialOnly: 3850,
    priceVialBac: 4050,
    priceSubqKit: 4180,
    descriptionSummary: "Dual-action combination peptide containing 5mg Cagrilintide and 5mg Semaglutide in a precise equimolar formulation."
  }),
  createCatalogProduct({
    id: "orforglipron",
    title: "Orforglipron (12mg Research Vial)",
    category: "Metabolic Signaling & Incretins",
    netContentDisplay: "12MG",
    priceVialOnly: 3400,
    priceVialBac: 3600,
    priceSubqKit: 3720,
    descriptionSummary: "Oral non-peptide small-molecule GLP-1 receptor agonist research reference standard."
  }),
  createCatalogProduct({
    id: "pemvidutide",
    title: "Pemvidutide (10mg Research Vial)",
    category: "Metabolic Signaling & Incretins",
    netContentDisplay: "10MG",
    priceVialOnly: 3600,
    priceVialBac: 3800,
    priceSubqKit: 3920,
    descriptionSummary: "Balanced dual GLP-1/Glucagon receptor agonist provisioned for hepatic fat oxidation research."
  }),
  createCatalogProduct({
    id: "cotadutide",
    title: "Cotadutide (10mg Research Vial)",
    category: "Metabolic Signaling & Incretins",
    netContentDisplay: "10MG",
    priceVialOnly: 3200,
    priceVialBac: 3400,
    priceSubqKit: 3520,
    descriptionSummary: "Dual GLP-1/Glucagon receptor agonist investigated in glycemic and renal protection assays."
  }),
  createCatalogProduct({
    id: "ecnoglutide",
    title: "Ecnoglutide (10mg Research Vial)",
    category: "Metabolic Signaling & Incretins",
    netContentDisplay: "10MG",
    priceVialOnly: 3500,
    priceVialBac: 3700,
    priceSubqKit: 3820,
    descriptionSummary: "Biased long-acting GLP-1 receptor agonist with minimal beta-arrestin desensitization."
  }),
  createCatalogProduct({
    id: "slu-pp-332",
    title: "SLU-PP-332 (10mg Research Vial)",
    category: "Metabolic Signaling & Incretins",
    netContentDisplay: "10MG",
    priceVialOnly: 2950,
    priceVialBac: 3150,
    priceSubqKit: 3270,
    descriptionSummary: "Synthetic pan-ERR agonist exercise mimetic standard for mitochondrial and muscle metabolic studies."
  }),
  createCatalogProduct({
    id: "adipotide",
    title: "Adipotide / FTPP (10mg Research Vial)",
    category: "Metabolic Signaling & Incretins",
    netContentDisplay: "10MG",
    priceVialOnly: 3100,
    priceVialBac: 3300,
    priceSubqKit: 3420,
    descriptionSummary: "Prohibitin-targeting white adipose vascular proapoptotic peptide for adipose atrophy evaluation."
  }),
  createCatalogProduct({
    id: "l-carnitine",
    title: "Injectable L-Carnitine (600mg/mL 10mL Vial)",
    category: "Metabolic Signaling & Incretins",
    netContentDisplay: "600MG/ML",
    priceVialOnly: 1950,
    priceVialBac: 2150,
    priceSubqKit: 2270,
    descriptionSummary: "High-concentration pharmaceutical-grade L-Carnitine carrier for mitochondrial beta-oxidation evaluation."
  }),
  createCatalogProduct({
    id: "pramlintide",
    title: "Pramlintide (5mg Research Vial)",
    category: "Metabolic Signaling & Incretins",
    netContentDisplay: "5MG",
    priceVialOnly: 2600,
    priceVialBac: 2800,
    priceSubqKit: 2920,
    descriptionSummary: "Synthetic human amylin receptor agonist standard for postprandial glucagon inhibition research."
  }),
  createCatalogProduct({
    id: "sr9009",
    title: "SR9009 / Stenabolic (20mg Research Vial)",
    category: "Metabolic Signaling & Incretins",
    netContentDisplay: "20MG",
    priceVialOnly: 2400,
    priceVialBac: 2600,
    priceSubqKit: 2720,
    descriptionSummary: "Synthetic Rev-ErbA agonist evaluated for mitochondrial biogenesis and circadian energy regulation."
  })
]
