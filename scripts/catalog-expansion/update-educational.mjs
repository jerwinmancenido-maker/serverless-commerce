import fs from "fs"
import path from "path"

const EDUCATIONAL_PATH = path.resolve("apps/backend/data/peptide-educational-content.json")

console.log("Reading existing educational content...")
const edu = JSON.parse(fs.readFileSync(EDUCATIONAL_PATH, "utf8"))

const newGlossaryTerms = [
  {
    term: "Khavinson Bioregulation",
    category: "Epigenetics & Gerontology",
    definition: "Tissue-specific short regulatory peptides (di-, tri-, and tetrapeptides) that cross cellular and nuclear membranes to bind nucleosomal histone complexes, reactivating silenced genes and normalizing cellular protein synthesis.",
    relatedCompounds: ["Epithalon", "Vesugen", "Cardiogen", "Cortagen", "Chonluten"]
  },
  {
    term: "Amylin Co-Agonism",
    category: "Metabolic Signaling",
    definition: "Concurrent activation of calcitonin/RAMP receptor complexes alongside GLP-1 receptors, producing cooperative suppression of hypothalamic hunger centers, deceleration of gastric emptying, and reduction in hedonic feeding.",
    relatedCompounds: ["CagriSema", "Cagrilintide", "Pramlintide"]
  },
  {
    term: "Small-Molecule GLP-1",
    category: "Pharmacology",
    definition: "Synthetic non-peptide heterocyclic ligands that bind allosterically within the transmembrane pocket of the GLP-1 receptor, achieving high oral bioavailability without requiring permeation enhancers.",
    relatedCompounds: ["Orforglipron (LY3502970)"]
  },
  {
    term: "PES Membrane Filtration",
    category: "Laboratory Consumables",
    definition: "Polyethersulfone 0.22-micrometer sterile syringe filtration membranes providing high flow rates and low protein-binding characteristics for cold sterilization of reconstituted research solutions.",
    relatedCompounds: ["0.22um PES Syringe Filters"]
  },
  {
    term: "Low Dead Space (LDS)",
    category: "Laboratory Consumables",
    definition: "Specialized syringe needle geometry where the needle is integrated directly into the syringe barrel, reducing fluid hold-up volume from 0.08 mL to <0.005 mL, preventing microgram peptide loss.",
    relatedCompounds: ["U-100 LDS Syringes"]
  },
  {
    term: "Reconstituted Solution Stability",
    category: "Storage & Stability",
    definition: "The beyond-use date (BUD) window governed by USP <797> and ISO standards during which an aqueous peptide solution in Bacteriostatic Water maintains >=95% potency under 2°C–8°C refrigeration.",
    relatedCompounds: ["All Reconstituted Compounds"]
  },
  {
    term: "Subcutaneous Depot Kinetics",
    category: "Pharmacokinetics",
    definition: "Sustained interstitial release of therapeutic macromolecules from subcutaneous adipose tissue into local capillary networks, blunting plasma Cmax spikes and extending systemic duration.",
    relatedCompounds: ["Semaglutide", "Tirzepatide", "Retatrutide"]
  },
  {
    term: "Actomyosin Cross-Bridge Remodeling",
    category: "Tissue Repair",
    definition: "Cellular process of actin filament sequestration and microvascular alignment driven by Thymosin Beta-4 and BPC-157, preventing disordered keloid scar formation while restoring biomechanical elasticity.",
    relatedCompounds: ["TB-500", "BPC-157", "Wolverine Blend"]
  },
  {
    term: "Epigenetic Telomerase Reactivation",
    category: "Cellular Longevity",
    definition: "Direct binding of Ala-Glu-Asp-Gly (Epithalon) to telomeric and promoter chromatin regions, inducing transcription of the catalytic subunit of telomerase (hTERT) in somatic cells.",
    relatedCompounds: ["Epithalon"]
  },
  {
    term: "Mitochondrial Uncoupling",
    category: "Cellular Bioenergetics",
    definition: "The deliberate dissipation of the proton motive gradient across the inner mitochondrial membrane via protonophore molecules (BAM15), burning calories as heat without hyperthermic toxicity.",
    relatedCompounds: ["BAM15", "MOTS-c"]
  }
]

for (const term of newGlossaryTerms) {
  if (!edu.glossary.some(g => g.term.toLowerCase() === term.term.toLowerCase())) {
    edu.glossary.push(term)
  }
}

// Add 4 targeted FAQs into the relevant categories
const newQuestions = [
  {
    category: "Reconstitution & Handling",
    q: "Why do Low Dead Space (LDS) syringes matter for expensive peptide research?",
    a: "Standard detachable-needle syringes retain up to 0.08 mL (8 units) of fluid inside the needle hub after full depression. With a high-concentration 10 mg/mL solution, that discarded dead space represents 800 mcg of peptide wasted per injection. PepStack LDS syringes integrate the needle directly into the barrel, reducing dead space to under 0.005 mL (<0.5 units) to conserve maximum active compound."
  },
  {
    category: "Reconstitution & Handling",
    q: "What is the difference between BPC-157 Arginate salt and standard BPC-157 Acetate?",
    a: "Standard BPC-157 is synthesized as an acetate salt, which is optimal for subcutaneous injection but hydrolyzes rapidly in gastric acid (pH <2.0). BPC-157 Arginate is a stabilized L-arginine salt that survives simulated gastric juice for over 5 hours, making it the premier benchmark for oral solution delivery and lower GI tract research."
  },
  {
    category: "Regulatory & Quality Standards",
    q: "Why is a 4-week stepwise titration strictly enforced for dual/triple incretins?",
    a: "GLP-1, GIP, and Amylin receptors in the area postrema and enteric nervous system require progressive receptor adaptation. Escalating doses at 4-week intervals (e.g. 2.5mg -> 5.0mg -> 7.5mg for Tirzepatide) prevents acute receptor saturation, severe nausea, and vomiting while ensuring steady-state pharmacokinetics."
  },
  {
    category: "Cold-Chain Logistics & Delivery",
    q: "How does USP <797> beyond-use dating apply to reconstituted peptide multi-dose vials?",
    a: "Under USP <797> guidelines for multi-dose preserved vials, solutions reconstituted with 0.9% Benzyl Alcohol (Bacteriostatic Water USP) maintained under continuous refrigeration (2°C–8°C) possess a validated 28-day beyond-use date. Freezing reconstituted solutions is strictly discouraged, as ice crystal formation shears peptide bonds."
  }
]

for (const nq of newQuestions) {
  const catObj = edu.faq.find(f => f.category === nq.category)
  if (catObj) {
    if (!catObj.questions.some(q => q.q === nq.q)) {
      catObj.questions.push({ q: nq.q, a: nq.a })
    }
  }
}

console.log(`Total glossary terms now: ${edu.glossary.length}`)
fs.writeFileSync(EDUCATIONAL_PATH, JSON.stringify(edu, null, 2) + "\n", "utf8")
console.log("Successfully updated educational content in apps/backend/data/peptide-educational-content.json!")
