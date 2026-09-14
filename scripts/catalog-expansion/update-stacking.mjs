import fs from "fs"
import path from "path"

const STOREFRONT_STACK_PATH = path.resolve("apps/storefront/src/lib/data/peptide-stack-interactions.json")
const BACKEND_STACK_PATH = path.resolve("apps/backend/data/peptide-stack-interactions.json")

console.log("Reading existing peptide-stack-interactions.json...")
const stackData = JSON.parse(fs.readFileSync(STOREFRONT_STACK_PATH, "utf8"))

const newCompounds = [
  {
    id: "cagrilintide",
    name: "Cagrilintide (Amylin Analogue)",
    shortName: "Cagrilintide",
    category: "Metabolic & Incretin",
    targetReceptor: "Amylin (AMY1-3) & Calcitonin Receptors",
    primaryPathway: "Central area postrema satiety, gastric slowing, glycemic setpoint normalization",
    adminRoute: "SubQ (Weekly)",
    optimalTiming: "Once every 7 days, coordinated with incretin protocol",
    halfLife: "7 days (~168 hours)",
    protocolHandle: "cagrisema-blend"
  },
  {
    id: "orforglipron",
    name: "Orforglipron (LY3502970)",
    shortName: "Orforglipron",
    category: "Metabolic & Incretin",
    targetReceptor: "Non-Peptide GLP-1 Receptor Small Molecule",
    primaryPathway: "Glucose-dependent insulin release, hypothalamic satiety signaling, delayed gastric transit",
    adminRoute: "Oral / SubQ",
    optimalTiming: "Once daily (Q24H) in fasted morning state",
    halfLife: "29-49 hours",
    protocolHandle: "orforglipron"
  },
  {
    id: "pemvidutide",
    name: "Pemvidutide (GLP-1/Glucagon)",
    shortName: "Pemvidutide",
    category: "Metabolic & Incretin",
    targetReceptor: "Balanced 1:1 GLP-1 and Glucagon Receptor Dual Agonist",
    primaryPathway: "Hepatic fat beta-oxidation, mitochondrial lipid clearance, appetite reduction",
    adminRoute: "SubQ (Weekly)",
    optimalTiming: "Once every 7 days",
    halfLife: "4-5 days",
    protocolHandle: "pemvidutide"
  },
  {
    id: "peg-mgf",
    name: "PEG-MGF (Pegylated Mechano Growth Factor)",
    shortName: "PEG-MGF",
    category: "Anabolic & Satellite Cell Activation",
    targetReceptor: "IGF-1Ec C-Terminal Autocrine Pathway",
    primaryPathway: "Muscle stem cell proliferation, satellite cell pool expansion, myofiber repair",
    adminRoute: "SubQ (Systemic)",
    optimalTiming: "Post-workout or rest day, 2-3x weekly",
    halfLife: "48-72 hours",
    protocolHandle: "peg-mgf"
  },
  {
    id: "igf-1-lr3",
    name: "IGF-1 LR3 (Long R3 Insulin-Like Growth Factor-1)",
    shortName: "IGF-1 LR3",
    category: "Anabolic & Cellular Hyperplasia",
    targetReceptor: "IGF-1 Receptor (IGF-1R) with Reduced Binding Protein Affinity",
    primaryPathway: "Myoblast differentiation, protein translation, glycogen synthesis, systemic cellular hyperplasia",
    adminRoute: "SubQ",
    optimalTiming: "Post-training, accompanied by fast-acting carbohydrates",
    halfLife: "20-30 hours",
    protocolHandle: "igf-1-lr3"
  },
  {
    id: "follistatin-344",
    name: "Follistatin-344",
    shortName: "Follistatin-344",
    category: "Myostatin & Muscle Hypertrophy",
    targetReceptor: "Myostatin (GDF-8) & Activin-A Neutralization",
    primaryPathway: "Lifting the genetic brake on muscle growth, tenocyte proliferation, connective repair",
    adminRoute: "SubQ",
    optimalTiming: "Daily micro-dose in 10-30 day cycles",
    halfLife: "2-4 hours (biological effects persist for weeks)",
    protocolHandle: "follistatin-344"
  },
  {
    id: "bpc-157-arginate",
    name: "BPC-157 Arginate (Stable Oral/SubQ)",
    shortName: "BPC-157 Arg",
    category: "Tissue Repair & Healing",
    targetReceptor: "VEGFR2, FAK-Paxillin, Nitric Oxide Synthesis",
    primaryPathway: "Acid-stable angiogenesis, gut mucosa barrier restoration, accelerated tendon and muscle repair",
    adminRoute: "Oral / SubQ",
    optimalTiming: "Morning fasted or with light meal",
    halfLife: "6 hours (gastric stability >5 hours in pH 2.0)",
    protocolHandle: "bpc-157-arginate"
  },
  {
    id: "vesugen",
    name: "Vesugen (Lys-Glu-Asp Vascular Bioregulator)",
    shortName: "Vesugen",
    category: "Vascular & Microcirculation",
    targetReceptor: "Endothelial Epigenetic Histone Complex",
    primaryPathway: "Endothelial nitric oxide synthesis, vascular wall elasticity, microcirculation recovery",
    adminRoute: "SubQ",
    optimalTiming: "Morning in 10-20 day cycles",
    halfLife: "2-4 hours (epigenetic effects persist 3-6 months)",
    protocolHandle: "vesugen"
  },
  {
    id: "cardiogen",
    name: "Cardiogen (Ala-Glu-Asp-Arg Cardiac Bioregulator)",
    shortName: "Cardiogen",
    category: "Cardiovascular Repair",
    targetReceptor: "Myocardial Epigenetic Transcription",
    primaryPathway: "Inhibition of cardiac scar fibrosis, cardiomyocyte ATP generation, myocardial repair",
    adminRoute: "SubQ",
    optimalTiming: "Morning alongside Vesugen in 10-20 day cycles",
    halfLife: "2-4 hours (epigenetic effects persist 3-6 months)",
    protocolHandle: "cardiogen"
  },
  {
    id: "tesamorelin",
    name: "Tesamorelin (GHRH Analogue)",
    shortName: "Tesamorelin",
    category: "Somatotropic GH Axis",
    targetReceptor: "Pituitary GHRH Receptor",
    primaryPathway: "Physiological pulsatile GH transcription with selective visceral adipose tissue lipolysis",
    adminRoute: "SubQ",
    optimalTiming: "Pre-bed (strictly fasted >=2h)",
    halfLife: "30 minutes",
    protocolHandle: "tesamorelin"
  },
  {
    id: "thymulin",
    name: "Thymulin (Zinc-Dependent Thymic Nonapeptide)",
    shortName: "Thymulin",
    category: "Immune & Neuro-Inflammation",
    targetReceptor: "Thymocyte Surface Receptors & Neuro-Immune Axis",
    primaryPathway: "T-cell maturation, cytokine balance, suppression of neuroinflammatory hyperalgesia",
    adminRoute: "SubQ",
    optimalTiming: "2-3x weekly",
    halfLife: "2 hours",
    protocolHandle: "thymulin"
  },
  {
    id: "slu-pp-332",
    name: "SLU-PP-332 (ERRα Exercise Mimetic)",
    shortName: "SLU-PP-332",
    category: "Metabolic & Mitochondrial",
    targetReceptor: "Estrogen-Related Receptor Alpha (ERRα)",
    primaryPathway: "Mitochondrial biogenesis, fatty acid beta-oxidation, physical endurance gene induction",
    adminRoute: "SubQ",
    optimalTiming: "Morning prior to physical activity",
    halfLife: "6-8 hours",
    protocolHandle: "slu-pp-332"
  }
]

// Add compounds if not already present
for (const comp of newCompounds) {
  if (!stackData.compounds.some(c => c.id === comp.id)) {
    stackData.compounds.push(comp)
  }
}

const newInteractions = [
  {
    compound_a: "cagrilintide",
    compound_b: "semaglutide",
    status: "synergistic",
    score: 99,
    title: "The CagriSema Protocol: Coordinated Amylin + GLP-1 Incretin Synergy",
    mechanismSummary: "Cagrilintide engages area postrema and ventral tegmental amylin receptors while Semaglutide stimulates hypothalamic GLP-1 receptors, producing multiplicative appetite suppression and glycemic control superior to either monotherapy.",
    timingProtocol: "Co-administered once weekly on the same day. Titrate gradually every 4 weeks.",
    safetyRule: "Strict stepwise escalation required to prevent gastrointestinal adverse events.",
    citation: "PubMed PMID: 37385280 (Lancet 2023)",
    stackedProtocol: {
      cycleLength: "16 to 32 weeks",
      washout: "6 weeks between research blocks",
      morningDose: "Weekly SubQ administration (0.5 mg to 2.4 mg combined)",
      eveningDose: "None",
      weeklySchedule: "Once every 7 days (e.g. Sunday evening)",
      syringeHandling: "Separate sterile syringes unless utilizing validated co-formulated CagriSema standard."
    }
  },
  {
    compound_a: "peg-mgf",
    compound_b: "igf-1-lr3",
    status: "synergistic",
    score: 97,
    title: "The Anabolic Saturation Stack: Satellite Cell Proliferation + Myofiber Differentiation",
    mechanismSummary: "PEG-MGF drives rapid proliferation of dormant muscle satellite cells into an expanded stem cell pool, while IGF-1 LR3 triggers differentiation of those newly created cells into mature, functional myofibrils.",
    timingProtocol: "PEG-MGF: 200–400 mcg 2–3x weekly post-workout. IGF-1 LR3: 20–50 mcg daily on training days.",
    safetyRule: "Consume 30–50g fast-acting carbohydrates with IGF-1 LR3 to prevent transient hypoglycemia.",
    citation: "Biochem Biophys Res Commun / J Appl Physiol",
    stackedProtocol: {
      cycleLength: "4 to 6 weeks",
      washout: "4 weeks washout off-cycle",
      morningDose: "IGF-1 LR3: 25 mcg SubQ post-training with nutrition",
      eveningDose: "PEG-MGF: 200 mcg SubQ on post-training days",
      weeklySchedule: "IGF-1 LR3 on training days (Mon/Wed/Fri); PEG-MGF post-workout.",
      syringeHandling: "Separate sterile U-100 syringes. Never combine in one vial."
    }
  },
  {
    compound_a: "bpc-157-arginate",
    compound_b: "tb-500",
    status: "synergistic",
    score: 99,
    title: "Enhanced Wolverine Stack: Acid-Stable Angiogenesis + Systemic Actin Remodeling",
    mechanismSummary: "Stable L-arginate salt of BPC-157 ensures robust microvascular VEGFR2 capillary ingrowth and gut barrier recovery, perfectly paired with TB-500 systemic G-actin sequestration for organized scar-free tissue repair.",
    timingProtocol: "BPC-157 Arginate: 250–500 mcg daily (SubQ or oral). TB-500: 2.5 mg twice weekly SubQ.",
    safetyRule: "Sterile technique for TB-500; BPC-157 Arginate may be administered orally or SubQ.",
    citation: "PubMed: 21030672 & 20119825",
    stackedProtocol: {
      cycleLength: "6 to 8 weeks",
      washout: "4 weeks off-cycle before repeating",
      morningDose: "BPC-157 Arginate: 250–500 mcg (fasted morning)",
      eveningDose: "None",
      weeklySchedule: "BPC-157 Arg: Daily (Mon-Sun). TB-500: 2.5 mg on Monday and Thursday.",
      syringeHandling: "Separate administration."
    }
  },
  {
    compound_a: "tesamorelin",
    compound_b: "ipamorelin",
    status: "synergistic",
    score: 98,
    title: "Visceral Lipolysis & Clean Pulse Stack: GHRH Selective Transcription + GHRP Release",
    mechanismSummary: "Tesamorelin selectively targets visceral abdominal fat while stimulating pituitary GH transcription; Ipamorelin triggers vesicular release without elevating prolactin or cortisol.",
    timingProtocol: "Co-administer together 30 minutes before sleep on a strictly fasted stomach (>=2 hours after last meal).",
    safetyRule: "Pre-bed administration strictly fasted to avoid somatostatin release from carbohydrate/insulin spikes.",
    citation: "N Engl J Med / J Clin Endocrinol Metab",
    stackedProtocol: {
      cycleLength: "12 to 16 weeks",
      washout: "4 weeks off-cycle",
      morningDose: "None",
      eveningDose: "Tesamorelin 1.0 mg + Ipamorelin 200 mcg SubQ (>=2h fasted)",
      weeklySchedule: "5 days on, 2 days off (Monday through Friday on, weekends off).",
      syringeHandling: "Separate sterile syringes for each vial."
    }
  },
  {
    compound_a: "vesugen",
    compound_b: "cardiogen",
    status: "synergistic",
    score: 96,
    title: "Cardiovascular Bioregulation Stack: Endothelial Nitric Oxide + Myocardial Protection",
    mechanismSummary: "Vesugen restores microvascular endothelial capillary elasticity and blood flow, while Cardiogen protects cardiomyocytes from ischemic strain and suppresses pathological collagen scar fibrosis.",
    timingProtocol: "Administer both compounds during morning hours in 10-20 day research cohorts.",
    safetyRule: "Endogenous bioregulator tri/tetrapeptides with exceptional safety profiles.",
    citation: "Bull Exp Biol Med / Adv Gerontol",
    stackedProtocol: {
      cycleLength: "10 to 20 days",
      washout: "2 to 3 months off-cycle",
      morningDose: "Vesugen 10 mg + Cardiogen 10 mg SubQ",
      eveningDose: "None",
      weeklySchedule: "Daily for 10–20 days consecutively.",
      syringeHandling: "Separate sterile syringes."
    }
  },
  {
    compound_a: "follistatin-344",
    compound_b: "ace-031",
    status: "favorable",
    score: 88,
    title: "Comprehensive Myostatin & Activin Neutralization Protocol",
    mechanismSummary: "Follistatin-344 directly binds circulating myostatin while ACE-031 acts as a soluble ActRIIB decoy receptor, suppressing both myostatin and activin signaling to maximize lean tissue retention.",
    timingProtocol: "Conservative micro-dosing in short 10-20 day experimental blocks.",
    safetyRule: "Monitor connective tissue adaptation as muscle force generation rises rapidly.",
    citation: "Mol Ther / Muscle Nerve",
    stackedProtocol: {
      cycleLength: "2 to 4 weeks",
      washout: "8 weeks washout period",
      morningDose: "Follistatin-344: 100 mcg daily SubQ",
      eveningDose: "ACE-031: 1 mg once weekly",
      weeklySchedule: "Follistatin daily for 10-20 days; ACE-031 weekly.",
      syringeHandling: "Separate sterile syringes."
    }
  }
]

// Add pairwise interactions if not already present
for (const inter of newInteractions) {
  const exists = stackData.pairwise_interactions.some(
    pi => (pi.compound_a === inter.compound_a && pi.compound_b === inter.compound_b) ||
          (pi.compound_a === inter.compound_b && pi.compound_b === inter.compound_a)
  )
  if (!exists) {
    stackData.pairwise_interactions.push(inter)
  }
}

const newPresets = [
  {
    id: "anabolic-hypertrophy",
    name: "Anabolic Satellite Cell & Hyperplasia Regimen",
    tag: "Muscle Stem Cell Activation",
    compound_ids: ["peg-mgf", "igf-1-lr3"],
    summary: "Coordinated satellite stem cell expansion with PEG-MGF followed by accelerated myofibrillar protein synthesis and differentiation via IGF-1 LR3.",
    idealCycleWeeks: 6,
    bundleDiscountPercent: 15
  },
  {
    id: "triple-metabolic-stack",
    name: "Triple Incretin & Metabolic Synergy Regimen",
    tag: "Triple Incretin + Lipolysis",
    compound_ids: ["retatrutide", "cagrilintide", "aod-9604"],
    summary: "Triple GLP-1/GIP/Glucagon receptor stimulation paired with amylin neuro-satiety and targeted adipocyte beta-3 lipolysis.",
    idealCycleWeeks: 12,
    bundleDiscountPercent: 15
  }
]

for (const preset of newPresets) {
  if (!stackData.presets.some(p => p.id === preset.id)) {
    stackData.presets.push(preset)
  }
}

console.log(`Total compounds now: ${stackData.compounds.length}`)
console.log(`Total pairwise interactions now: ${stackData.pairwise_interactions.length}`)
console.log(`Total presets now: ${stackData.presets.length}`)

fs.writeFileSync(STOREFRONT_STACK_PATH, JSON.stringify(stackData, null, 2) + "\n", "utf8")
fs.writeFileSync(BACKEND_STACK_PATH, JSON.stringify(stackData, null, 2) + "\n", "utf8")
console.log("Successfully synchronized peptide-stack-interactions.json across storefront and backend!")
