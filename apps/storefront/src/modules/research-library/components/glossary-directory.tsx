"use client"

import React, { useMemo, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  MagnifyingGlass,
  BookOpen,
  ArrowRightMini,
  Sparkles,
  Beaker,
} from "@medusajs/icons"

export interface GlossaryItem {
  term: string
  category: string
  definition: string
  relatedCompounds: string[]
}

const EXTENDED_GLOSSARY: GlossaryItem[] = [
  {
    term: "Agonist",
    category: "Pharmacodynamics",
    definition: "A chemical or endogenous ligand that binds to a specific biological receptor and activates it to trigger an intracellular physiological or biochemical cascade.",
    relatedCompounds: ["Semaglutide", "Tirzepatide", "Ipamorelin"],
  },
  {
    term: "Antagonist",
    category: "Pharmacodynamics",
    definition: "A substance that binds to a receptor without triggering cellular activation, competitively or non-competitively blocking natural or synthetic agonist binding.",
    relatedCompounds: ["Naloxone", "Cetrorelix"],
  },
  {
    term: "Angiogenesis",
    category: "Physiology",
    definition: "The physiological process through which new micro-blood vessels form from pre-existing vascular beds, critical for tissue granulation, collagen synthesis, and wound repair.",
    relatedCompounds: ["BPC-157", "TB-500"],
  },
  {
    term: "Bacteriostatic Water USP",
    category: "Laboratory Supplies",
    definition: "USP-grade sterile, non-pyrogenic water containing 0.9% (9 mg/mL) Benzyl Alcohol. The bacteriostatic agent suppresses microbial and fungal replication in multi-dose reconstituted vials for 21–28 days.",
    relatedCompounds: ["Bacteriostatic Water USP", "BPC-157", "TB-500"],
  },
  {
    term: "Bioavailability",
    category: "Pharmacokinetics",
    definition: "The fraction or percentage of an administered analytical compound that reaches systemic micro-circulation intact without first-pass hepatic or gastric degradation.",
    relatedCompounds: ["BPC-157 (Arg)", "Semaglutide"],
  },
  {
    term: "C-Terminus",
    category: "Biochemistry",
    definition: "The end of an amino acid chain terminated by a free carboxyl group (-COOH). In synthetic peptides, C-terminal amidation (-NH2) is frequently engineered to resist carboxypeptidase cleavage.",
    relatedCompounds: ["Semaglutide", "Tirzepatide", "CJC-1295"],
  },
  {
    term: "Co-Agonist",
    category: "Pharmacodynamics",
    definition: "A engineered synthetic single-molecule peptide that concurrently engages two distinct receptor families with tuned stoichiometric potency.",
    relatedCompounds: ["Tirzepatide (GIP/GLP-1)", "Retatrutide (GIP/GLP-1/Glucagon)"],
  },
  {
    term: "Deamidation",
    category: "Biochemistry",
    definition: "A non-enzymatic chemical reaction where an amide functional group in asparagine or glutamine residues is cleaved into a carboxylic acid, contributing to aqueous peptide degradation.",
    relatedCompounds: ["CJC-1295 No DAC", "Semaglutide"],
  },
  {
    term: "Desensitization",
    category: "Pharmacodynamics",
    definition: "The progressive downregulation or uncoupling of receptor signaling following sustained, non-pulsatile ligand stimulation. Mitigated in secretagogue protocols via pulsatile dosing cycles.",
    relatedCompounds: ["GHRP-6", "Hexarelin", "CJC-1295"],
  },
  {
    term: "Disulfide Bridge",
    category: "Biochemistry",
    definition: "A covalent bond formed between two thiol groups of cysteine residues (R-S-S-R). Provides critical conformational rigidity and tertiary folding stability to complex peptides.",
    relatedCompounds: ["Oxytocin", "Linaclotide"],
  },
  {
    term: "Endotoxin (LPS)",
    category: "Analytical Quality",
    definition: "Lipopolysaccharides originating from the outer membrane of Gram-negative bacteria. Strict laboratory reference grade standards mandate endotoxin thresholds <0.02 EU/mg.",
    relatedCompounds: ["All Analytical Reference Standards"],
  },
  {
    term: "GIP Receptor",
    category: "Metabolic Signaling",
    definition: "Glucose-dependent Insulinotropic Polypeptide receptor expressing on pancreatic beta-cells and adipose tissue, regulating postprandial insulin release and lipid buffering.",
    relatedCompounds: ["Tirzepatide", "Retatrutide"],
  },
  {
    term: "GLP-1 Receptor",
    category: "Metabolic Signaling",
    definition: "Glucagon-Like Peptide-1 G-protein coupled receptor stimulating incretin glucose regulation, delaying gastric motility, and activating hypothalamic satiety circuits.",
    relatedCompounds: ["Semaglutide", "Tirzepatide", "Retatrutide"],
  },
  {
    term: "Growth Hormone Axis (GHRH / GHRP)",
    category: "Endocrinology",
    definition: "Dual signaling cascade governing somatotropic growth hormone release. GHRH analogues stimulate pituitary synthesis, while GHRP ghrelin mimetics amplify pulsatile secretory bursts.",
    relatedCompounds: ["CJC-1295", "Ipamorelin", "Tesamorelin", "Sermorelin"],
  },
  {
    term: "Half-Life (t½)",
    category: "Pharmacokinetics",
    definition: "The duration required for 50% of the active compound to be cleared or metabolized from an in vitro or in vivo biological matrix.",
    relatedCompounds: ["Semaglutide (~168 hrs)", "BPC-157 (~4 hrs)", "Tirzepatide (~120 hrs)"],
  },
  {
    term: "High-Performance Liquid Chromatography (RP-HPLC)",
    category: "Analytical Quality",
    definition: "Analytical separation technique measuring chemical purity, sequence retention time, and related substances against reference standards (threshold ≥99.0%).",
    relatedCompounds: ["All Reference Lots"],
  },
  {
    term: "Hydrophobicity",
    category: "Biochemistry",
    definition: "The physical tendency of non-polar amino acid side chains (Leucine, Isoleucine, Valine) to aggregate away from water, sometimes requiring specialized acidic reconstitution solvents.",
    relatedCompounds: ["Semax", "Selank", "MGF"],
  },
  {
    term: "Incretin",
    category: "Metabolic Signaling",
    definition: "Gut-derived metabolic hormones (GLP-1, GIP) secreted postprandially that potentiate insulin secretion and modulate metabolic energy expenditure.",
    relatedCompounds: ["Semaglutide", "Tirzepatide", "Cagrilintide"],
  },
  {
    term: "Low Dead Space (LDS)",
    category: "Laboratory Supplies",
    definition: "Syringe design where the plunger tip extends into the needle orifice, reducing residual dead-volume loss from ~0.08 mL to <0.002 mL per draw.",
    relatedCompounds: ["U-100 LDS Syringes"],
  },
  {
    term: "Lyophilization",
    category: "Bioprocessing",
    definition: "Freeze-drying dehydration process operating under high vacuum and sublimation, stabilizing fragile polypeptide chains into a dry solid cake for multi-year preservation.",
    relatedCompounds: ["All Lyophilized Vials"],
  },
  {
    term: "Mass Spectrometry (ESI-MS)",
    category: "Analytical Quality",
    definition: "Electrospray Ionization Mass Spectrometry measuring mass-to-charge ratios (m/z) to definitively verify molecular formula, isotopic distribution, and exact molecular weight.",
    relatedCompounds: ["All Reference Lots"],
  },
  {
    term: "Meniscus",
    category: "Laboratory Supplies",
    definition: "The curved upper surface of a liquid column. In U-100 syringes, dosage is calibrated by aligning the leading flat edge of the black plunger seal, eliminating meniscus ambiguity.",
    relatedCompounds: ["U-100 Syringes"],
  },
  {
    term: "Mitochondrial-Derived Peptide (MDP)",
    category: "Cellular Biology",
    definition: "Short bioactive peptides encoded within mitochondrial open reading frames (e.g., MOTS-c) that act as metabolic and cellular longevity signaling hormones.",
    relatedCompounds: ["MOTS-c", "Humanin"],
  },
  {
    term: "N-Terminus",
    category: "Biochemistry",
    definition: "The start of an amino acid chain possessing a free amine group (-NH2). In synthetic design, N-terminal acetylation is utilized to protect against aminopeptidase cleavage.",
    relatedCompounds: ["Semaglutide", "Epithalon"],
  },
  {
    term: "Osmolality",
    category: "Laboratory Supplies",
    definition: "The concentration of solute particles per kilogram of solvent. Reconstituted peptides in 0.9% saline are isotonic (~290 mOsm/kg), preventing cellular osmotic shock.",
    relatedCompounds: ["Bacteriostatic Saline 0.9%", "GHK-Cu"],
  },
  {
    term: "Parallax Error",
    category: "Laboratory Supplies",
    definition: "Apparent displacement or difference in the apparent position of a liquid level or syringe tick mark when viewed from an angle other than perpendicular to the barrel.",
    relatedCompounds: ["U-100 Syringes"],
  },
  {
    term: "Pharmacodynamics (PD)",
    category: "Pharmacology",
    definition: "The study of the biochemical and physiological effects of compounds on receptors, signal transduction pathways, and molecular biological systems.",
    relatedCompounds: ["All Peptides"],
  },
  {
    term: "Pharmacokinetics (PK)",
    category: "Pharmacology",
    definition: "The quantitative study of compound absorption, distribution, metabolism, and excretion (ADME) kinetics over time within a biological system.",
    relatedCompounds: ["All Peptides"],
  },
  {
    term: "Polypeptide",
    category: "Biochemistry",
    definition: "A linear organic polymer consisting of multiple amino-acid residues bonded together in a chain, forming part of (or the entirety of) a protein molecule.",
    relatedCompounds: ["All Analytical Compounds"],
  },
  {
    term: "Reconstitution",
    category: "Laboratory Supplies",
    definition: "The laboratory process of dissolving a dry, lyophilized peptide cake into a sterile liquid diluent (such as Bacteriostatic Water USP) to create a homogenous solution.",
    relatedCompounds: ["Bacteriostatic Water USP", "All Lyophilized Vials"],
  },
  {
    term: "Solvent",
    category: "Laboratory Supplies",
    definition: "A sterile aqueous medium utilized to dissolve chemical solutes. Primary solvents include Bacteriostatic Water USP, 0.6% Acetic Acid, and Bacteriostatic Saline.",
    relatedCompounds: ["Bacteriostatic Water USP", "Acetic Acid 0.6%"],
  },
  {
    term: "Stoichiometry",
    category: "Biochemistry",
    definition: "The quantitative relationship between reactants and products. In reconstitution, dictates the exact concentration formula: Concentration = Mass (mg) / Volume (mL).",
    relatedCompounds: ["All Formulations"],
  },
  {
    term: "Sublimation",
    category: "Bioprocessing",
    definition: "The physical phase transition where a frozen substance transforms directly from solid ice to vapor without passing through a liquid phase, utilized during lyophilization.",
    relatedCompounds: ["Lyophilized Vials"],
  },
  {
    term: "Synergy",
    category: "Pharmacology",
    definition: "An interaction between two or more compounds where the combined biological effect is greater than the sum of their individual actions (e.g. BPC-157 + TB-500).",
    relatedCompounds: ["BPC-157", "TB-500", "CJC-1295", "Ipamorelin"],
  },
  {
    term: "Titration",
    category: "Pharmacology",
    definition: "The systematic, step-wise adjustment of dose concentration over defined weekly research intervals to optimize receptor responsiveness while minimizing desensitization.",
    relatedCompounds: ["Semaglutide", "Tirzepatide", "Retatrutide"],
  },
  {
    term: "U-100 Standard",
    category: "Laboratory Supplies",
    definition: "International volumetric standard for insulin syringes defining 100 graduation units as exactly 1.0 mL (1 unit = 0.01 mL = 10 microliters).",
    relatedCompounds: ["U-100 Syringes"],
  },
  {
    term: "Vacuum Seal",
    category: "Bioprocessing",
    definition: "Partial negative atmospheric pressure sealed inside lyophilized vials during factory stoppering, preventing oxidative air ingress and requiring careful thumb resistance during diluent transfer.",
    relatedCompounds: ["All Lyophilized Vials"],
  },
  {
    term: "Vortexing",
    category: "Laboratory Supplies",
    definition: "Violent mechanical high-speed swirling. Strictly contraindicated for peptides as interfacial shear stress shears delicate secondary folds and causes foaming denaturation.",
    relatedCompounds: ["All Peptides"],
  },
]

const CATEGORIES = [
  "ALL",
  "Pharmacodynamics",
  "Pharmacokinetics",
  "Metabolic Signaling",
  "Biochemistry",
  "Analytical Quality",
  "Laboratory Supplies",
  "Bioprocessing",
  "Physiology",
  "Endocrinology",
]

const ALPHABET = ["ALL", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")]

export function GlossaryDirectory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLetter, setSelectedLetter] = useState("ALL")
  const [selectedCategory, setSelectedCategory] = useState("ALL")

  const filteredTerms = useMemo(() => {
    return EXTENDED_GLOSSARY.filter((item) => {
      // Letter filter
      if (selectedLetter !== "ALL") {
        if (!item.term.toUpperCase().startsWith(selectedLetter)) {
          return false
        }
      }

      // Category filter
      if (selectedCategory !== "ALL") {
        if (item.category !== selectedCategory) {
          return false
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTerm = item.term.toLowerCase().includes(q)
        const matchDef = item.definition.toLowerCase().includes(q)
        const matchCat = item.category.toLowerCase().includes(q)
        const matchRelated = item.relatedCompounds?.some((c) => c.toLowerCase().includes(q))
        return matchTerm || matchDef || matchCat || matchRelated
      }

      return true
    }).sort((a, b) => a.term.localeCompare(b.term))
  }, [selectedLetter, selectedCategory, searchQuery])

  // Count active terms per letter for indicator badges
  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of EXTENDED_GLOSSARY) {
      const firstChar = item.term.charAt(0).toUpperCase()
      counts[firstChar] = (counts[firstChar] || 0) + 1
    }
    return counts
  }, [])

  return (
    <div className="w-full space-y-10">
      {/* Quick Action Reference Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold">
            📖
          </span>
          <span>Scientific Lexicon Quick Links:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <LocalizedClientLink
            href="/dosage-chart"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <span>Master Dosage Chart (88 Compounds)</span>
            <ArrowRightMini className="h-4 w-4" />
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/learn/beginners-guide"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <Beaker className="h-3.5 w-3.5 text-emerald-600" />
            <span>Beginner&apos;s Reconstitution SOP</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/learn/storage-guide"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Storage &amp; Stability Matrix</span>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Search & Filter Header Box */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Interactive Search
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Search Biomedical Terminology
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Filter by receptor family, pharmacokinetic property, or compound name.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            {filteredTerms.length} Terms Documented
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search glossary by term, definition, or compound (e.g. Incretin, Agonist, Half-Life, HPLC)..."
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-10 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* A–Z Letter Pagination Bar */}
        <div className="flex flex-wrap items-center gap-1 border-t border-slate-200 pt-4">
          {ALPHABET.map((letter) => {
            const isSelected = selectedLetter === letter
            const hasCount = letter === "ALL" || Boolean(letterCounts[letter])

            return (
              <button
                key={letter}
                type="button"
                onClick={() => setSelectedLetter(letter)}
                disabled={!hasCount}
                className={`flex h-7 min-w-[28px] items-center justify-center rounded-lg px-1.5 text-xs font-mono font-bold transition-colors ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : hasCount
                    ? "border border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
                    : "text-slate-300 cursor-not-allowed border border-transparent"
                }`}
              >
                {letter}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results Grid */}
      {filteredTerms.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <BookOpen className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm font-bold text-slate-800">No glossary terms matched your query.</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("")
              setSelectedLetter("ALL")
              setSelectedCategory("ALL")
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTerms.map((item) => (
            <div
              key={item.term}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {item.term}
                  </h3>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 shrink-0">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.definition}</p>
              </div>

              {item.relatedCompounds && item.relatedCompounds.length > 0 && (
                <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Relevant:
                  </span>
                  {item.relatedCompounds.map((comp) => (
                    <span
                      key={comp}
                      className="rounded-md border border-emerald-200 bg-emerald-50/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-800"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
