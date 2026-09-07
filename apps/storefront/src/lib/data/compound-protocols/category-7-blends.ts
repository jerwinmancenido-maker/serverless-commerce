import type { CompoundAnalyticalProtocol } from "./types"

export const CATEGORY_7_BLENDS_PROTOCOLS: CompoundAnalyticalProtocol[] = [
  {
    "id": "glow-blend",
    "compoundName": "GLOW Blend",
    "handles": [
      "glow-blend",
      "glow",
      "glow-peptide",
      "ghk-bpc-tb500",
      "glow70"
    ],
    "subtitle": "Triple-Synergy Matrix Remodeling (GHK-Cu 50mg + BPC-157 10mg + TB-500 10mg) Protocol",
    "longDescription": "**What it is:** GLOW Blend is an advanced multi-peptide formulation combining high-potency GHK-Cu, TB-500, and BPC-157 in a precisely balanced synergistic ratio.\n\n**How it works:** This triple blend tackles tissue and cosmetic regeneration from every angle: GHK-Cu stimulates massive collagen and elastin synthesis while resetting gene expression; TB-500 upregulates actin to speed cell migration and prevent scar tissue; and BPC-157 builds fresh microvascular capillaries to deliver oxygen and nutrients throughout the matrix.\n\n**Why researchers study it:** Researched as the ultimate cosmetic and skin rejuvenation blend, for reversing skin aging, wrinkle reduction, rapid wound repair, scar minimization, and radiant skin elasticity.",
    "category": "Multi-Peptide Blends",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "glow70",
    "isBlend": true,
    "blendConstituents": [
      {
        "name": "GHK-Cu",
        "ratioMg": 50,
        "percentageOfTotal": 71.4
      },
      {
        "name": "BPC-157",
        "ratioMg": 10,
        "percentageOfTotal": 14.3
      },
      {
        "name": "TB-500",
        "ratioMg": 10,
        "percentageOfTotal": 14.3
      }
    ],
    "reconstitution": {
      "defaultVialNetMg": 70,
      "defaultDiluentMl": 3.5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 3.5 mL diluent slowly down the glass wall. The solution immediately assumes an intense deep royal blue color from the GHK-Cu component. Swirl gently horizontally for 60 seconds until all lyophilized cakes are fully dissolved. Do not shake.",
      "resultingConcentrationMgPerMl": 20,
      "handlingRule": "Clear royal blue aqueous solution. Each 1.0 mL contains 14.28 mg GHK-Cu, 2.86 mg BPC-157, and 2.86 mg TB-500. Protect strictly from direct sunlight."
    },
    "dosing": {
      "standardDoseDisplay": "1,400 mcg total blend daily (Yields 1,000 mcg GHK-Cu + 200 mcg BPC-157 + 200 mcg TB-500)",
      "standardDoseMcg": 1400,
      "cadence": "1x Daily (SubQ, preferably morning or post-training)",
      "halfLife": "Multi-phase: BPC-157 (~4h), GHK-Cu (~2h), TB-500 (~24–36h)",
      "typicalProtocolDuration": "30 to 45 Days",
      "washoutPeriod": "30 Days between cycles to allow physiological copper clearance",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation & Tissue Acclimatization",
          "timeframe": "Days 1–5",
          "doseDisplay": "700 mcg blend daily (0.50 mg GHK / 100 mcg BPC / 100 mcg TB)",
          "doseMcg": 700,
          "cadence": "1x Daily (SubQ)",
          "focus": "Baseline tissue tolerance calibration, initial actin filament mobilization, and microvascular priming",
          "notes": "3.5 units (0.035 mL) on U-100 syringe at 20.0 mg/mL total concentration"
        },
        {
          "stage": "Phase 2: Full Tri-Synergy Matrix Regeneration",
          "timeframe": "Days 6–30",
          "doseDisplay": "1,400 mcg blend daily (1.0 mg GHK / 200 mcg BPC / 200 mcg TB)",
          "doseMcg": 1400,
          "cadence": "1x Daily (SubQ)",
          "focus": "Peak collagen I/III bundle synthesis (GHK-Cu), tendon/ligament fibroblast outgrowth (BPC-157), and systemic capillary cell migration (TB-500)",
          "notes": "7.0 units (0.07 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Copper Homeostasis Washout",
          "timeframe": "Days 31–60",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Physiological copper clearance and observation of persistent extracellular matrix cross-linking",
          "notes": "Mandatory 30-day cessation window"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "7.0 units (0.07 mL)",
      "graduations": [
        {
          "doseDisplay": "700 mcg blend (0.5mg GHK / 100mcg BPC / 100mcg TB)",
          "doseMcg": 700,
          "volumeMl": 0.035,
          "syringeIU": 3.5,
          "tickLabel": "3.5 units (0.035 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1,400 mcg blend (1.0mg GHK / 200mcg BPC / 200mcg TB)",
          "doseMcg": 1400,
          "volumeMl": 0.07,
          "syringeIU": 7,
          "tickLabel": "7.0 units (0.07 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "2,100 mcg blend (1.5mg GHK / 300mcg BPC / 300mcg TB)",
          "doseMcg": 2100,
          "volumeMl": 0.105,
          "syringeIU": 10.5,
          "tickLabel": "10.5 units (0.105 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dark desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days. Keep strictly shielded from direct light",
      "lightProtection": true
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 26236730",
        "notes": "Pickart et al. GHK-Cu in tissue regeneration and collagen upregulation."
      },
      {
        "sourceReference": "PubMed PMID: 21030672",
        "notes": "Sikiric et al. BPC-157 in angiogenic repair and soft tissue recovery."
      },
      {
        "sourceReference": "PubMed PMID: 20536453",
        "notes": "Philp et al. Thymosin beta-4 active peptide in wound repair and actin dynamics."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Triple-Action Aesthetic Rejuvenation**: Combines collagen production, cell migration, and microvascular blood flow in one coordinated formula.",
      "**Massive Collagen & Elastin Production**: Rebuilds the structural matrix of aging skin to restore firmness, bounce, and smoothness.",
      "**Accelerated Wound Healing & Scar Erasure**: Prevents rigid scar tissue formation while accelerating post-procedure skin recovery.",
      "**Reduces Wrinkles & Fine Lines**: Enhances dermal thickness, skin hydration, and youthful skin texture.",
      "**Hair Follicle & Scalp Revitalization**: Stimulates microcirculation and nutrient delivery to support healthy hair growth."
    ],
    "adverseObservations": [
      "**Injection Site Stinging from Copper**: GHK-Cu content can cause localized stinging for 15–30 minutes post-subcutaneous administration.",
      "**Dilution Recommendation**: Reconstituting with 3.0 mL or more of Bacteriostatic Water significantly reduces injection discomfort.",
      "**Transient Skin Flushing**: Increased microvascular blood flow can cause mild, temporary facial or neck warmth.",
      "**Refrigeration & UV Shielding**: Protect the blue copper solution strictly from direct sunlight; refrigerate between 2°C–8°C."
    ]
  },
  {
    "id": "klow-blend",
    "compoundName": "KLOW Blend",
    "handles": [
      "klow-blend",
      "klow",
      "kpv-ll37-ghk-bpc",
      "klow80"
    ],
    "subtitle": "Quad-Action Antimicrobial, Anti-Inflammatory & Matrix Regenerative Standard",
    "longDescription": "**What it is:** KLOW Blend is an elite high-strength four-peptide matrix combining GHK-Cu, TB-500, BPC-157, and KPV in a comprehensive synergistic vial.\n\n**How it works:** It supercharges the regenerative power of the GLOW Blend by adding KPV, a master anti-inflammatory tripeptide. KPV inhibits NF-kB at the nucleus to shut down chronic redness, swelling, and irritation, allowing the regenerative actions of GHK-Cu, TB-500, and BPC-157 to rebuild damaged tissues without inflammatory interference.\n\n**Why researchers study it:** Studied for inflammatory skin conditions (eczema, rosacea, severe dermatitis), deep tissue healing, post-surgical recovery, scar prevention, and complete dermal renewal.",
    "category": "Multi-Peptide Blends",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "klow80",
    "isBlend": true,
    "blendConstituents": [
      {
        "name": "GHK-Cu",
        "ratioMg": 50,
        "percentageOfTotal": 62.5
      },
      {
        "name": "KPV",
        "ratioMg": 10,
        "percentageOfTotal": 12.5
      },
      {
        "name": "LL-37",
        "ratioMg": 10,
        "percentageOfTotal": 12.5
      },
      {
        "name": "BPC-157",
        "ratioMg": 10,
        "percentageOfTotal": 12.5
      }
    ],
    "reconstitution": {
      "defaultVialNetMg": 80,
      "defaultDiluentMl": 4,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Inject 4.0 mL diluent slowly down the glass wall. The solution turns characteristic bright royal blue. Swirl in continuous horizontal circles for 60 seconds until dissolved completely. Do not shake.",
      "resultingConcentrationMgPerMl": 20,
      "handlingRule": "Clear royal blue aqueous solution. Protect strictly from direct sunlight and thermal spikes."
    },
    "dosing": {
      "standardDoseDisplay": "1,600 mcg total blend daily (Yields 1,000 mcg GHK-Cu + 200 mcg KPV + 200 mcg LL-37 + 200 mcg BPC-157)",
      "standardDoseMcg": 1600,
      "cadence": "1x Daily (SubQ)",
      "halfLife": "Complex kinetics: KPV (~2h), LL-37 (~2h), BPC-157 (~4h), GHK-Cu (~2h)",
      "typicalProtocolDuration": "30 Days continuous trial block",
      "washoutPeriod": "30 Days between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Broad-Spectrum Inflammatory & Microbial Suppression",
          "timeframe": "Days 1–7",
          "doseDisplay": "800 mcg blend daily (0.5mg GHK / 100mcg KPV / 100mcg LL-37 / 100mcg BPC)",
          "doseMcg": 800,
          "cadence": "1x Daily (SubQ)",
          "focus": "NF-kappaB inhibition (KPV), bacterial biofilm disruption (LL-37), and microvascular tissue priming (BPC-157/GHK-Cu)",
          "notes": "4.0 units (0.04 mL) on U-100 syringe at 20.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Quad-Synergy Tissue Healing",
          "timeframe": "Days 8–30",
          "doseDisplay": "1,600 mcg blend daily (1.0mg GHK / 200mcg KPV / 200mcg LL-37 / 200mcg BPC)",
          "doseMcg": 1600,
          "cadence": "1x Daily",
          "focus": "Accelerated extracellular matrix re-epithelialization, deep collagen deposition, and antimicrobial protection",
          "notes": "8.0 units (0.08 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Systemic Washout",
          "timeframe": "Days 31–60",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Host microbiome equilibrium and copper clearance verification",
          "notes": "30-day rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "8.0 units (0.08 mL)",
      "graduations": [
        {
          "doseDisplay": "800 mcg blend (0.5mg GHK / 100mcg each KPV, LL-37, BPC)",
          "doseMcg": 800,
          "volumeMl": 0.04,
          "syringeIU": 4,
          "tickLabel": "4.0 units (0.04 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1,600 mcg blend (1.0mg GHK / 200mcg each KPV, LL-37, BPC)",
          "doseMcg": 1600,
          "volumeMl": 0.08,
          "syringeIU": 8,
          "tickLabel": "8.0 units (0.08 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 28143741",
        "notes": "KPV in anti-inflammatory signaling and gut barrier protection."
      },
      {
        "sourceReference": "PubMed PMID: 12782669",
        "notes": "LL-37 in biofilm disruption and antimicrobial defense."
      },
      {
        "sourceReference": "PubMed PMID: 26236730",
        "notes": "GHK-Cu in matrix remodeling and decorin gene modulation."
      },
      {
        "sourceReference": "PubMed PMID: 21030672",
        "notes": "BPC-157 in accelerated tissue repair and angiogenesis."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Four-Peptide Regenerative Matrix**: Unites GHK-Cu, TB-500, BPC-157, and KPV for complete anti-inflammatory and tissue-rebuilding synergy.",
      "**Shuts Down Chronic Dermal Inflammation**: KPV enters cell nuclei to stop NF-kB inflammatory cascades, calming redness and irritation.",
      "**Accelerated Collagen Matrix Restoration**: Stimulates robust collagen type I and III synthesis to restore damaged connective tissues.",
      "**Rapid Cell Migration & Microvascular Support**: Upregulates actin and VEGF pathways to deliver healing nutrients directly to wound beds.",
      "**Antimicrobial Barrier Protection**: KPV provides natural defense against bacterial and fungal skin pathogens."
    ],
    "adverseObservations": [
      "**Injection Site Stinging**: High copper content from GHK-Cu can cause localized stinging or a dull ache lasting 20–30 minutes.",
      "**High Reconstitution Dilution Advised**: Use at least 3.0 to 4.0 mL of Bacteriostatic Water to minimize localized injection irritation.",
      "**Cold Chain Storage**: Keep reconstituted solution refrigerated at 2°C–8°C away from heat and light."
    ]
  },
  {
    "id": "wolverine-blend",
    "compoundName": "Wolverine Blend",
    "handles": [
      "wolverine-blend",
      "wolverine",
      "bpc-tb500-blend",
      "recovery-blend"
    ],
    "subtitle": "Dual-Action Synergistic Musculoskeletal Repair (BPC-157 5mg + TB-500 5mg) Standard",
    "longDescription": "**What it is:** Wolverine Blend (also known as the Recovery Blend) is the premier dual-peptide synergy in modern sports medicine research, combining equal parts BPC-157 and TB-500.\n\n**How it works:** While BPC-157 rebuilds localized microvascular blood flow, activates tenocytes, and speeds collagen synthesis directly at the injury site, TB-500 circulates systemically to mobilize cellular actin, upregulate cell migration, and prevent stiff fibrotic scarring. Together, their complementary actions cut tissue recovery times dramatically compared to either peptide alone.\n\n**Why researchers study it:** Researched as the gold standard for rapid healing of torn ligaments, tendonitis, muscle tears, joint pain, cartilage wear, and post-surgical rehabilitation.",
    "category": "Multi-Peptide Blends",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "wolverine-blend",
    "isBlend": true,
    "blendConstituents": [
      {
        "name": "BPC-157",
        "ratioMg": 5,
        "percentageOfTotal": 50
      },
      {
        "name": "TB-500",
        "ratioMg": 5,
        "percentageOfTotal": 50
      }
    ],
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 45 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "500 mcg total blend daily (Yields 250 mcg BPC-157 + 250 mcg TB-500)",
      "standardDoseMcg": 500,
      "cadence": "1x Daily (SubQ)",
      "halfLife": "Dual kinetics: BPC-157 (~4h), TB-500 (~24–36h)",
      "typicalProtocolDuration": "4 to 6 Weeks",
      "washoutPeriod": "3 to 4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Dual-Pathway Loading",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "500 mcg blend daily (250 mcg BPC / 250 mcg TB)",
          "doseMcg": 500,
          "cadence": "1x Daily (SubQ)",
          "focus": "Rapid eNOS activation, tendon fibroblast migration (BPC-157) combined with systemic actin upregulation and capillary sprouting (TB-500)",
          "notes": "10.0 units (0.10 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Musculoskeletal Consolidation",
          "timeframe": "Weeks 3–5",
          "doseDisplay": "500 mcg – 1,000 mcg blend daily",
          "doseMcg": 500,
          "cadence": "1x Daily",
          "focus": "Accelerated soft tissue repair, tendon-to-bone junction healing, and scar tissue reduction",
          "notes": "10.0 units (0.10 mL) on U-100 syringe (or 20.0 units for 1000 mcg)"
        },
        {
          "stage": "Phase 3: Matrix Washout",
          "timeframe": "Weeks 6–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of persistent collagen alignment and tensile strength",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "10.0 units (0.10 mL)",
      "graduations": [
        {
          "doseDisplay": "250 mcg blend (125 mcg BPC / 125 mcg TB)",
          "doseMcg": 250,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg blend (250 mcg BPC / 250 mcg TB)",
          "doseMcg": 500,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1,000 mcg blend (500 mcg BPC / 500 mcg TB)",
          "doseMcg": 1000,
          "volumeMl": 0.2,
          "syringeIU": 20,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 21030672",
        "notes": "BPC-157 in soft tissue healing and angiogenesis."
      },
      {
        "sourceReference": "PubMed PMID: 20536453",
        "notes": "Thymosin beta-4 active fragment in dermal and tendon repair."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**The Gold Standard Dual Healing Protocol**: BPC-157 and TB-500 combine localized capillary building with systemic cellular migration.",
      "**Accelerated Tendon & Ligament Regeneration**: Significantly speeds healing of Achilles, patellar, rotator cuff, and ACL injuries in preclinical models.",
      "**Prevents Disabling Scar Tissue & Fibrosis**: TB-500 ensures newly synthesized collagen is laid down in flexible, functional patterns rather than stiff scar lumps.",
      "**Muscle Tear & Joint Recovery**: Restores joint mobility, reduces stiffness, and accelerates functional return following traumatic strain.",
      "**Systemic Tissue Protection**: Protects gut lining, cardiovascular tissue, and peripheral nerves from chronic inflammation."
    ],
    "adverseObservations": [
      "**Mild Injection Site Redness**: Temporary redness or minor swelling at the subcutaneous administration site.",
      "**Transient Warmth or Lightheadedness**: Mild, temporary head rush reported within 15 minutes due to vascular shifts.",
      "**Consistent Dosing Cadence**: Typically researched daily (or twice-weekly loading for TB-500) over 4 to 6 weeks, followed by a 2-week rest.",
      "**Reconstitution Standard**: Gently add Bacteriostatic Water down the inner glass wall; swirl smoothly without shaking; store at 2°C–8°C."
    ]
  },
  {
    "id": "tri-heal-blend",
    "compoundName": "Tri-Heal Matrix Blend",
    "handles": [
      "tri-heal-blend",
      "tri-heal",
      "bpc-tb-kpv",
      "tri-heal-matrix"
    ],
    "subtitle": "Triple Regenerative & Mucosal Integrity (BPC-157 5mg + TB-500 5mg + KPV 5mg) Standard",
    "longDescription": "**What it is:** Tri-Heal Matrix Blend is an advanced triple-peptide formulation that combines BPC-157, TB-500, and KPV for maximum recovery and complete inflammatory control.\n\n**How it works:** It expands upon the Wolverine Blend by adding KPV's nuclear NF-kB inhibition. BPC-157 provides angiogenic blood flow, TB-500 drives rapid cell motility and tissue remodeling, and KPV instantly extinguishes acute and chronic inflammation at the cellular level. This tripartite approach prevents chronic inflammatory loops from stalling tissue repair.\n\n**Why researchers study it:** Studied for complex chronic injuries, severe tendon and ligament tears, arthritic joint inflammation, inflammatory bowel disease, and accelerated surgical recovery.",
    "category": "Multi-Peptide Blends",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "tri-heal-blend",
    "isBlend": true,
    "blendConstituents": [
      {
        "name": "BPC-157",
        "ratioMg": 5,
        "percentageOfTotal": 33.33
      },
      {
        "name": "TB-500",
        "ratioMg": 5,
        "percentageOfTotal": 33.33
      },
      {
        "name": "KPV",
        "ratioMg": 5,
        "percentageOfTotal": 33.33
      }
    ],
    "reconstitution": {
      "defaultVialNetMg": 15,
      "defaultDiluentMl": 3,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 3.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 45 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store strictly refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "600 mcg total blend daily (Yields 200 mcg BPC-157 + 200 mcg TB-500 + 200 mcg KPV)",
      "standardDoseMcg": 600,
      "cadence": "1x Daily (SubQ)",
      "halfLife": "Multi-peptide kinetics: KPV (~2h), BPC-157 (~4h), TB-500 (~24–36h)",
      "typicalProtocolDuration": "4 to 6 Weeks",
      "washoutPeriod": "3 to 4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initial Tolerance",
          "timeframe": "Days 1–7",
          "doseDisplay": "300 mcg blend daily (100 mcg each)",
          "doseMcg": 300,
          "cadence": "1x Daily",
          "focus": "NF-kappaB cytokine downregulation (KPV) combined with vascular endothelial activation (BPC/TB-500)",
          "notes": "6.0 units (0.06 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Tri-Heal Regeneration",
          "timeframe": "Weeks 2–5",
          "doseDisplay": "600 mcg blend daily (200 mcg each)",
          "doseMcg": 600,
          "cadence": "1x Daily",
          "focus": "Simultaneous gut mucosal healing, ligament remodeling, and cellular anti-inflammatory protection",
          "notes": "12.0 units (0.12 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 6–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Epithelial barrier and connective tissue stability assessment",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "12.0 units (0.12 mL)",
      "graduations": [
        {
          "doseDisplay": "300 mcg blend (100 mcg each)",
          "doseMcg": 300,
          "volumeMl": 0.06,
          "syringeIU": 6,
          "tickLabel": "6.0 units (0.06 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "600 mcg blend (200 mcg each)",
          "doseMcg": 600,
          "volumeMl": 0.12,
          "syringeIU": 12,
          "tickLabel": "12.0 units (0.12 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 28143741",
        "notes": "KPV peptide in intestinal barrier restoration."
      },
      {
        "sourceReference": "PubMed PMID: 21030672",
        "notes": "BPC-157 in gastrointestinal and musculoskeletal healing."
      },
      {
        "sourceReference": "PubMed PMID: 20536453",
        "notes": "TB-500 in tissue regeneration and cellular migration."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Tripartite Healing Synergy**: Coordinates microvascular repair (BPC-157), actin cellular migration (TB-500), and nuclear NF-kB shutoff (KPV).",
      "**Breaks Chronic Inflammatory Cycles**: Prevents lingering inflammatory cytokines from destroying newly formed connective tissues.",
      "**Superior Soft Tissue & Joint Repair**: Restores joint cushioning, repairs tendon micro-tears, and rebuilds muscular integrity.",
      "**Dual Gut & Systemic Protection**: Exceptionally effective in mucosal repair models, supporting intestinal lining and organ health.",
      "**Minimizes Scar Tissue Formation**: Encourages parallel, organized collagen alignment for optimal post-injury flexibility."
    ],
    "adverseObservations": [
      "**Mild Injection Point Irritation**: Minor subcutaneous redness that clears within 30 to 45 minutes.",
      "**Transient Digestive Sensitivity**: Occasional mild stomach queasiness during initial days if administered while fasting.",
      "**Refrigeration Mandatory**: Maintain reconstituted vial strictly between 2°C–8°C away from direct light."
    ]
  },
  {
    "id": "cjc-ipam-blend",
    "compoundName": "CJC-1295 + Ipamorelin Blend",
    "handles": [
      "cjc-ipam-blend",
      "cjc-ipam",
      "cjc-1295-ipamorelin",
      "cjc-1295-ipamorelin-blend"
    ],
    "subtitle": "Dual-Action Synergistic Somatotrope Pulse (CJC-1295 5mg + Ipamorelin 5mg) Standard",
    "longDescription": "**What it is:** CJC-1295 + Ipamorelin Blend is the most widely researched synergistic combination in growth hormone optimization, combining GHRH (Mod GRF 1-29) and a selective ghrelin secretagogue (Ipamorelin) in a 1:1 ratio.\n\n**How it works:** Natural growth hormone release requires two distinct signals: a GHRH signal to open the pituitary faucet, and a ghrelin signal to amplify the pulse while blocking somatostatin (the hormone that shuts off GH). By supplying CJC-1295 No DAC and Ipamorelin together, both pathways are activated simultaneously, generating a massive, 5x–10x amplification of natural growth hormone pulses without elevating cortisol or prolactin.\n\n**Why researchers study it:** Studied for deep restorative sleep, rapid fat loss, lean muscle tone, accelerated injury recovery, collagen synthesis, and reversing the biological signs of aging.",
    "category": "Multi-Peptide Blends",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "cjc-1295-ipamorelin",
    "isBlend": true,
    "blendConstituents": [
      {
        "name": "CJC-1295 No DAC",
        "ratioMg": 5,
        "percentageOfTotal": 50
      },
      {
        "name": "Ipamorelin",
        "ratioMg": 5,
        "percentageOfTotal": 50
      }
    ],
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.5 mL diluent slowly down the glass wall. Swirl gently horizontally for 45 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 4,
      "handlingRule": "Clear, colorless aqueous solution. Store strictly refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "200 mcg total blend daily (Yields 100 mcg CJC-1295 + 100 mcg Ipamorelin)",
      "standardDoseMcg": 200,
      "cadence": "1x to 2x Daily (Pre-Bed or Morning Fasted SubQ)",
      "halfLife": "CJC-1295 (~30 min) / Ipamorelin (~2h)",
      "typicalProtocolDuration": "8 to 12 Weeks",
      "washoutPeriod": "4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "200 mcg blend daily (100 mcg each)",
          "doseMcg": 200,
          "cadence": "1x Daily (Pre-Bed SubQ, 2h post-prandial)",
          "focus": "Amplification of nocturnal endogenous growth hormone pulse via dual GHRH/GHS-R1a synergy",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 4.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Somatotropic Pulsing",
          "timeframe": "Weeks 3–10",
          "doseDisplay": "200 mcg – 400 mcg blend daily",
          "doseMcg": 200,
          "cadence": "1x to 2x Daily (AM Fasted / PM Pre-Bed)",
          "focus": "Maximum physiologic somatotropic pulse magnitude, slow-wave sleep depth, and lean tissue preservation",
          "notes": "5.0 units (0.05 mL) per injection (or 10.0 units for 400 mcg)"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 11–12",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Pituitary somatotrope sensitivity reset",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "200 mcg blend (100 mcg CJC / 100 mcg Ipam)",
          "doseMcg": 200,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "400 mcg blend (200 mcg CJC / 200 mcg Ipam)",
          "doseMcg": 400,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 9849822",
        "notes": "Ipamorelin in selective growth hormone stimulation."
      },
      {
        "sourceReference": "PubMed PMID: 16352683",
        "notes": "CJC-1295 in sustained somatotropic release."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**5x–10x Synergistic Growth Hormone Pulse**: Dual-pathway activation produces an exponential increase in natural growth hormone release compared to either peptide alone.",
      "**Zero Cortisol or Prolactin Spikes**: Maintains selective growth hormone release without activating stress hormones or causing hormonal imbalance.",
      "**Restores Deep Delta-Wave Sleep**: Dramatically improves sleep quality and morning recovery by amplifying natural nocturnal GH bursts.",
      "**Accelerates Fat Oxidation & Lean Tone**: Enhances lipolysis and promotes nitrogen retention to preserve and tone lean muscle.",
      "**Upregulates Collagen & Joint Repair**: Elevates systemic IGF-1 to repair connective tissues, tendons, ligaments, and skin elasticity.",
      "**Preserves Natural Pituitary Feedback**: Works with the body's natural somatostatin controls, preventing pituitary shutdown or over-saturation."
    ],
    "adverseObservations": [
      "**Transient Facial Flushing & Warmth**: A warm, pleasant facial flush and mild head rush frequently occur 10–15 minutes post-injection as GH surges.",
      "**Must Be Administered Fasted**: Carbohydrates and dietary fats cause insulin/somatostatin spikes that blunt the GH pulse; administer at least 90–120 minutes away from food.",
      "**Mild Temporary Water Retention**: Minor fluid holding in fingers or ankles during initial weeks that normalizes with continued research.",
      "**Refrigeration Standard**: Keep reconstituted vial refrigerated at 2°C–8°C; use within 28 days for optimal molecular potency."
    ]
  },
  {
    "id": "neuro-sync-blend",
    "compoundName": "Neuro-Sync Blend",
    "handles": [
      "neuro-sync-blend",
      "neuro-sync",
      "semax-selank-blend",
      "selank-semax-combo",
      "neuro-sync-stack"
    ],
    "subtitle": "Dual Nootropic & Anxiolytic Synergistic Complex (Semax 5mg + Selank 5mg) Standard",
    "longDescription": "**What it is:** Neuro-Sync Blend is a cutting-edge dual-nootropic peptide formulation combining equal parts Semax and Selank to deliver comprehensive cognitive enhancement and emotional balance.\n\n**How it works:** Semax acts on BDNF and dopamine/serotonin pathways to drive laser-sharp mental focus, cognitive processing speed, and neuroplasticity. Meanwhile, Selank acts on GABA and enkephalin systems to completely extinguish anxiety, stress, and mental chatter without causing sedation. Together, they create a state of 'relaxed focus' or mental flow where the brain operates at peak cognitive capacity under zero anxiety.\n\n**Why researchers study it:** Studied for achieving peak executive cognitive performance, overcoming brain fog and burnout, anxiety-free mental focus, stress resilience, and long-term neuroprotection.",
    "category": "Multi-Peptide Blends",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "selank-semax-combo",
    "isBlend": true,
    "deliveryRoutes": [
      "nasal",
      "subq"
    ],
    "nasalGuide": {
      "pumpVolumeMl": 0.1,
      "recommendedDiluentMlOptions": [
        3.0,
        5.0,
        10.0
      ],
      "defaultDiluentMl": 5.0,
      "deviceLabel": "Amber nasal spray bottle (10 mL)",
      "notes": "Produces 50 sprays at 0.10 mL per metered actuation (100 mcg total blend per spray with 5.0 mL diluent)."
    },
    "blendConstituents": [
      {
        "name": "Semax",
        "ratioMg": 5,
        "percentageOfTotal": 50
      },
      {
        "name": "Selank",
        "ratioMg": 5,
        "percentageOfTotal": 50
      }
    ],
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP or Sterile Deionized Saline (Intranasal/SubQ)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 30 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store strictly refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "500 mcg total blend daily (Yields 250 mcg Semax + 250 mcg Selank)",
      "standardDoseMcg": 500,
      "cadence": "1x Daily (Morning SubQ or Intranasal)",
      "halfLife": "Semax (~1h) / Selank (~2h)",
      "typicalProtocolDuration": "4 to 8 Weeks",
      "washoutPeriod": "2 to 4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Days 1–7",
          "doseDisplay": "500 mcg blend daily (250 mcg each)",
          "doseMcg": 500,
          "cadence": "1x Daily (Morning)",
          "focus": "Simultaneous cognitive focus elevation (Semax TrkB activation) and stress/anxiety dampening (Selank GABA-A modulation)",
          "notes": "10.0 units (0.10 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Neuro-Cognitive Synergy",
          "timeframe": "Weeks 2–6",
          "doseDisplay": "500 mcg – 1,000 mcg blend daily",
          "doseMcg": 500,
          "cadence": "1x Daily (or 500 mcg BID)",
          "focus": "High-stress cognitive endurance, memory consolidation, and neurovascular resilience",
          "notes": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of long-term memory retrieval and emotional equilibrium",
          "notes": "2–4 week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "10.0 units (0.10 mL)",
      "graduations": [
        {
          "doseDisplay": "500 mcg blend (250 mcg Semax / 250 mcg Selank)",
          "doseMcg": 500,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1,000 mcg blend (500 mcg Semax / 500 mcg Selank)",
          "doseMcg": 1000,
          "volumeMl": 0.2,
          "syringeIU": 20,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 16996037",
        "notes": "Semax in TrkB receptor and BDNF upregulation."
      },
      {
        "sourceReference": "PubMed PMID: 11550013",
        "notes": "Selank in allosteric GABA-A modulation and anxiolysis."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**The Ultimate Brain Optimization Synergy**: Combines BDNF neurotrophic drive (Semax) with calming GABA/enkephalin anxiolysis (Selank).",
      "**Laser-Sharp Focus Without Jitteriness**: Delivers intense mental clarity, focus, and drive while completely eliminating physical restlessness or anxiety.",
      "**Drives Neuroplasticity & Memory Consolidation**: Stimulates hippocampal neurotrophic factors to dramatically improve learning speed and information retention.",
      "**Non-Addictive & Non-Sedating**: Promotes deep emotional calm and composure without mental sluggishness, addiction, or withdrawal.",
      "**Shields Brain Against Stress & Exhaustion**: Protects neural networks from oxidative stress, glutamate excitotoxicity, and mental burnout."
    ],
    "adverseObservations": [
      "**Restlessness if Administered Late**: Heightened cognitive alertness can interfere with sleep onset; administer in the morning or early afternoon.",
      "**Sensory Clarity Adjustment**: Enhanced sensory processing can make subjects more observant of environment and sounds.",
      "**Refrigeration & Light Shielding**: Both peptides are temperature-sensitive; store reconstituted solution strictly at 2°C–8°C away from heat and direct light."
    ]
  }
]
