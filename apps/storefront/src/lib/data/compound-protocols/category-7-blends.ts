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
  },
  {
    "id": "cuv100-ghk-cu-kpv",
    "compoundName": "CUV-100 (GHK-Cu + KPV Blend)",
    "handles": [
      "cuv100",
      "cuv-100",
      "cuv100-ghk-cu-kpv",
      "cuv100-100mg",
      "cuv100-ghk-cu-50mg-kpv-50mg-inj"
    ],
    "subtitle": "Copper-Tripeptide & Anti-Inflammatory Dual Complex (GHK-Cu 50mg + KPV 50mg) Standard",
    "longDescription": "**What it is:** CUV-100 is an advanced dual-action research peptide formulation combining high-purity GHK-Cu (Copper Tripeptide-1, 50mg) and KPV (Lysine-Proline-Valine, 50mg) in an exact 1:1 ratio (100mg total lyophilized material per vial).\n\n**How it works:** CUV-100 achieves synergistic tissue remodeling and cytoprotection through complementary biochemical cascades: GHK-Cu upregulates pro-collagen I/III synthesis, elastin expression, and stimulates decorin and proteoglycan production while normalizing matrix metalloproteinases (MMPs). Concurrently, KPV acts as a potent tripeptide anti-inflammatory agent via the PepT1 transporter, directly blocking NF-κB nuclear translocation and suppressing pro-inflammatory cytokines (IL-1β, IL-6, TNF-α) without steroidal side effects.\n\n**Why researchers study it:** Investigated for accelerated dermal and soft-tissue wound repair, severe inflammatory tissue model resolution, extracellular matrix (ECM) reorganization, anti-fibrotic remodeling, and post-procedural tissue healing.",
    "category": "Multi-Peptide Blends",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "cuv100-ghk-cu-kpv",
    "isBlend": true,
    "blendConstituents": [
      {
        "name": "GHK-Cu (Copper Tripeptide-1)",
        "ratioMg": 50,
        "percentageOfTotal": 50.0
      },
      {
        "name": "KPV (Lys-Pro-Val)",
        "ratioMg": 50,
        "percentageOfTotal": 50.0
      }
    ],
    "reconstitution": {
      "defaultVialNetMg": 100,
      "defaultDiluentMl": 5.0,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Introduce 5.0 mL diluent slowly down the glass vial wall. The solution immediately displays a characteristic brilliant azure blue tint from the chelated copper peptide complex. Swirl gently horizontally for 60 seconds until completely clear and particulate-free. Do not shake vigorously.",
      "resultingConcentrationMgPerMl": 20.0,
      "handlingRule": "Clear, deep blue aqueous solution. Each 1.0 mL contains 10.0 mg GHK-Cu and 10.0 mg KPV (20.0 mg total peptide mass). Store strictly refrigerated at 2°C–8°C and shield from direct ultraviolet light."
    },
    "dosing": {
      "standardDoseDisplay": "2,000 mcg total blend daily (Yields 1,000 mcg GHK-Cu + 1,000 mcg KPV)",
      "standardDoseMcg": 2000,
      "cadence": "1x Daily (SubQ, preferably morning or localized to target tissue quadrant)",
      "halfLife": "Multi-phase: GHK-Cu (~2 to 4 Hours) / KPV (~1 to 2 Hours central, sustained local tissue binding)",
      "typicalProtocolDuration": "30 to 60 Days",
      "washoutPeriod": "30 Days between cycles for physiological copper homeostasis",
      "titrationSteps": [
        {
          "stage": "Phase 1: Baseline Anti-Inflammatory Calibration",
          "timeframe": "Days 1–7",
          "doseDisplay": "1,000 mcg total blend daily (500 mcg GHK-Cu + 500 mcg KPV)",
          "doseMcg": 1000,
          "cadence": "1x Daily (SubQ)",
          "focus": "Establishment of baseline tissue tolerability, initial cytokine normalization, and endothelial cell priming",
          "notes": "5.0 units (0.05 mL) on standard U-100 syringe at 20.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Dual-Matrix Remodeling",
          "timeframe": "Days 8–45",
          "doseDisplay": "2,000 mcg total blend daily (1,000 mcg GHK-Cu + 1,000 mcg KPV)",
          "doseMcg": 2000,
          "cadence": "1x Daily (SubQ)",
          "focus": "Maximal pro-collagen I/III synthesis, MMP regulation, and rapid localized tissue remodeling",
          "notes": "10.0 units (0.10 mL) on standard U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout & Homeostasis",
          "timeframe": "Days 46–75",
          "doseDisplay": "Observation & Rest Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Serum copper re-equilibration and longitudinal monitoring of extracellular matrix tensile integrity",
          "notes": "Mandatory 30-day cessation window"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "10.0 units (0.10 mL)",
      "graduations": [
        {
          "doseDisplay": "1,000 mcg blend (500 mcg GHK / 500 mcg KPV)",
          "doseMcg": 1000,
          "volumeMl": 0.05,
          "syringeIU": 5.0,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "2,000 mcg blend (1,000 mcg GHK / 1,000 mcg KPV)",
          "doseMcg": 2000,
          "volumeMl": 0.10,
          "syringeIU": 10.0,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "4,000 mcg blend (2,000 mcg GHK / 2,000 mcg KPV)",
          "doseMcg": 4000,
          "volumeMl": 0.20,
          "syringeIU": 20.0,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C desiccated and protected from moisture (24 months shelf life)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days. Protect strictly from direct UV/light exposure.",
      "lightProtection": true
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 26236730",
        "notes": "Pickart et al. Regenerative and protective actions of the GHK-Cu peptide in light of the new gene data."
      },
      {
        "sourceReference": "PubMed PMID: 18451174",
        "notes": "Dalmasso et al. PepT1-mediated transport of the tripeptide KPV and its anti-inflammatory effects in intestinal inflammation."
      },
      {
        "sourceReference": "PubMed PMID: 12513904",
        "notes": "Luger et al. Alpha-MSH and its C-terminal tripeptide KPV in immunomodulation and inflammation control."
      }
    ],
    "disclaimer": "Synthesized strictly for laboratory research and analytical calibration. Not approved for human, veterinary, or clinical use.",
    "investigatedBenefits": [
      "**Dual Matrix Remodeling & Anti-Inflammatory Synergy**: Simultaneously upregulates structural collagen while suppressing systemic and localized inflammatory cytokines.",
      "**Enhanced Extracellular Matrix Synthesis**: Promotes collagen I/III, elastin, and proteoglycan gene expression while balancing tissue metalloproteinases.",
      "**Targeted NF-κB Pathway Inhibition**: Downregulates acute inflammatory signaling via PepT1 transporter-mediated cellular uptake.",
      "**Accelerated Soft-Tissue Wound Healing**: Stimulates localized microvascular perfusion and enhances fibroblast migration in damaged tissue models.",
      "**Antioxidant & Free Radical Scavenging**: Copper-chelation activity increases superoxide dismutase (SOD) expression, reducing oxidative cellular stress."
    ],
    "adverseObservations": [
      "Localized injection site erythema or mild stinging due to high copper concentration (mitigated by slow SubQ administration).",
      "Excessive un-cycled administration may elevate systemic copper levels; mandatory 30-day washout recommended."
    ]
  },
  {
    "id": "ghk-cu-glutathione-bundle",
    "compoundName": "GHK-Cu + Glutathione Bundle",
    "handles": [
      "ghk-cu-glutathione-bundle",
      "ghk-glutathione-stack",
      "copper-glutathione-bundle"
    ],
    "subtitle": "Dual-Vial Extracellular Matrix Remodeling & Systemic Redox Detoxification Protocol",
    "longDescription": "**What it is:** A dual-vial research stack pairing GHK-Cu (100mg) and Reduced L-Glutathione (1500mg) as distinct, separately reconstituted analytical standards.\n\n**How it works:** GHK-Cu activates systemic tissue remodeling, collagen synthesis, and stem cell migration, while Glutathione acts as the master intracellular antioxidant buffer, quenching free radicals and supporting Phase II hepatic and cellular detoxification.\n\n**CRITICAL CLINICAL HANDLING:** Prepare each vial in separate sterile Bacteriostatic Water. NEVER combine dry cakes or aqueous solutions into a single vial; copper ions (Cu2+) catalyze the immediate oxidation and precipitation of glutathione thiols.",
    "category": "Multi-Peptide Blends",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "ghk-cu-glutathione-bundle",
    "purityStandard": "\u226599.0% Individual Lyophilized Assay Standards",
    "investigatedBenefits": [
      "Synergistic cellular detoxification and reactive oxygen species (ROS) neutralization",
      "Accelerated connective tissue and dermal extracellular matrix remodeling",
      "Mitochondrial membrane potential preservation and cellular longevity enhancement",
      "Comprehensive skin vitality, elasticity, and anti-senescence signaling"
    ],
    "adverseObservations": [
      "Injection site discomfort if GHK-Cu or Glutathione are inadequately diluted",
      "Transient sulfur odor or taste following high-volume glutathione administration",
      "Mild flushing or headache if administered too rapidly"
    ],
    "reconstitution": {
      "defaultVialNetMg": 1600,
      "defaultDiluentMl": 10.0,
      "solvent": "Bacteriostatic Water USP (2x Separate Dilution Vials Required)",
      "dissolutionMethod": "Reconstitute each vial SEPARATELY. Add 5.0 mL BAC water to GHK-Cu 100mg vial (yields 20 mg/mL). Add 5.0 mL BAC water to Glutathione 1500mg vial (yields 300 mg/mL). Swirl gently until clear. Do not mix together.",
      "resultingConcentrationMgPerMl": 160.0,
      "handlingRule": "Maintain 2 separate refrigerated vials. Inspect both for optical clarity prior to sampling."
    },
    "dosing": {
      "standardDoseDisplay": "GHK-Cu: 1.0\u20132.0 mg daily; Glutathione: 150\u2013300 mg (2\u20133x weekly)",
      "standardDoseMcg": 2000,
      "cadence": "GHK-Cu daily SubQ; Glutathione 2\u20133x weekly SubQ/IM",
      "halfLife": "GHK-Cu: ~1\u20132 Hours; Glutathione: ~10\u201315 Minutes (intracellular buffering ~24\u201348h)",
      "typicalProtocolDuration": "6 to 8 Weeks per analytical research block",
      "washoutPeriod": "2 to 4 Weeks between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Dual-Compound Calibration",
          "timeframe": "Week 1",
          "doseDisplay": "GHK: 1.0 mg | GSH: 150 mg",
          "doseMcg": 1000,
          "cadence": "GHK daily; GSH 2x weekly",
          "focus": "Systemic tolerance assessment and baseline antioxidant equilibration",
          "notes": "GHK: 5 units (0.05 mL); GSH: 50 units (0.5 mL) via separate syringes"
        },
        {
          "stage": "Phase 2: Target Therapeutic Synergy",
          "timeframe": "Weeks 2\u20136",
          "doseDisplay": "GHK: 2.0 mg | GSH: 300 mg",
          "doseMcg": 2000,
          "cadence": "GHK daily; GSH 3x weekly",
          "focus": "Full extracellular matrix remodeling and heavy cellular redox defense",
          "notes": "GHK: 10 units (0.10 mL); GSH: 100 units (1.0 mL) via separate injections"
        },
        {
          "stage": "Phase 3: Taper & Consolidation",
          "timeframe": "Weeks 7\u20138",
          "doseDisplay": "GHK: 1.0 mg | GSH: 150 mg",
          "doseMcg": 1000,
          "cadence": "GHK alternate days; GSH 1x weekly",
          "focus": "Consolidation of cellular repair and oxidative reserve evaluation",
          "notes": "Maintain strict site rotation"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Dual Syringe Protocol: U-100 Insulin (GHK-Cu) & 1.0 mL/3.0 mL Luer-Lock (GSH)",
      "standardIUDisplay": "GHK: 10 units (0.1 mL) | GSH: 50\u2013100 units (0.5\u20131.0 mL)",
      "graduations": [
        {
          "doseDisplay": "GHK 1.0 mg (0.05 mL)",
          "doseMcg": 1000,
          "volumeMl": 0.05,
          "syringeIU": 5.0,
          "tickLabel": "5.0 units on U-100 syringe (GHK-Cu vial)"
        },
        {
          "doseDisplay": "GHK 2.0 mg (0.10 mL)",
          "doseMcg": 2000,
          "volumeMl": 0.1,
          "syringeIU": 10.0,
          "tickLabel": "10.0 units on U-100 syringe (GHK-Cu vial)"
        },
        {
          "doseDisplay": "GSH 150 mg (0.50 mL)",
          "doseMcg": 150000,
          "volumeMl": 0.5,
          "syringeIU": 50.0,
          "tickLabel": "50.0 units on syringe (Glutathione vial)"
        },
        {
          "doseDisplay": "GSH 300 mg (1.00 mL)",
          "doseMcg": 300000,
          "volumeMl": 1.0,
          "syringeIU": 100.0,
          "tickLabel": "100.0 units (1.0 mL full syringe)"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20\u00b0C in desiccated dark storage (24 months shelf life)",
      "reconstituted": "2\u00b0C\u20138\u00b0C refrigerated; GHK-Cu stable 30 days; Glutathione use within 21 days",
      "lightProtection": true
    },
    "citations": [
      {
        "sourceReference": "PMID: 22666519",
        "notes": "Pickart L. GHK peptide as a natural modulator of multiple cellular pathways. Oxid Med Cell Longev. 2012;2012:648108."
      },
      {
        "sourceReference": "PMID: 18796312",
        "notes": "Forman HJ, Zhang H, Rinna A. Glutathione: overview of its protective roles, measurement, and biosynthesis. Mol Aspects Med. 2009;30(1-2):1-12."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and scientific evaluation. Not for human or veterinary administration.",
    "evidenceTier": "Tier 1: Clinical Synergy Protocol",
    "bundleVials": [
      {
        "compoundName": "GHK-Cu (Copper Tripeptide-1)",
        "vialNetMass": "100 mg",
        "diluentMl": 5.0,
        "concMgMl": 20.0,
        "solvent": "Bacteriostatic Water USP",
        "reconstitutionInstructions": "Add 5.0 mL BAC water slowly down vial wall. Swirl gently for 30s until deep royal blue.",
        "targetDose": "1.0 mg \u2013 2.0 mg daily",
        "cadence": "1x Daily SubQ",
        "syringeUnits": "5 to 10 units (0.05\u20130.10 mL) on U-100 syringe"
      },
      {
        "compoundName": "Glutathione Reduced (L-gamma-glutamyl-L-cysteinylglycine)",
        "vialNetMass": "1500 mg",
        "diluentMl": 5.0,
        "concMgMl": 300.0,
        "solvent": "Bacteriostatic Water USP",
        "reconstitutionInstructions": "Add 5.0 mL BAC water slowly. Allow 2\u20133 minutes for complete hydration. Swirl gently until water-clear.",
        "targetDose": "150 mg \u2013 300 mg per dose",
        "cadence": "2\u20133x Weekly SubQ or IM",
        "syringeUnits": "50 to 100 units (0.50\u20131.00 mL)"
      }
    ]
  },
  {
    "id": "epithalon-glutathione-bundle",
    "compoundName": "Epithalon + Glutathione Bundle",
    "handles": [
      "epithalon-glutathione-bundle",
      "epithalon-glutathione-stack",
      "longevity-redox-bundle"
    ],
    "subtitle": "Dual-Vial Telomerase Upregulation & Intracellular Redox Longevity Standard",
    "longDescription": "**What it is:** A dual-action anti-senescence research stack combining Epithalon (10mg pineal tetrapeptide) and Reduced L-Glutathione (1500mg) in two separate analytical vials.\n\n**How it works:** Epithalon reactivates the telomerase reverse transcriptase (TERT) catalytic subunit to elongate telomeres and remodel chromatin, while Glutathione protects nuclear and mitochondrial DNA from mutagenic reactive oxygen species and environmental oxidative insults.\n\n**CRITICAL CLINICAL HANDLING:** Prepare each vial in its dedicated BAC water volume. Administer via separate injection sites.",
    "category": "Multi-Peptide Blends",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "epithalon-glutathione-bundle",
    "purityStandard": "\u226599.0% (HPLC Analytical Standard)",
    "investigatedBenefits": [
      "Telomeric repeat addition and chromosomal integrity preservation",
      "Normalization of pineal neuroendocrine circadian rhythms and melatonin synthesis",
      "High-capacity intracellular free-radical scavenging and lipid peroxidation inhibition",
      "In-vitro attenuation of cellular senescence markers (beta-galactosidase)"
    ],
    "adverseObservations": [
      "Mild transient site reaction at Glutathione injection site",
      "Occasional vivid dreams during active Epithalon cycles",
      "Temporary fatigue during initial detoxification phase"
    ],
    "reconstitution": {
      "defaultVialNetMg": 1510,
      "defaultDiluentMl": 7.0,
      "solvent": "Bacteriostatic Water USP (2x Separate Dilution Vials Required)",
      "dissolutionMethod": "Reconstitute Epithalon (10mg) with 2.0 mL BAC water (5.0 mg/mL). Reconstitute Glutathione (1500mg) with 5.0 mL BAC water (300.0 mg/mL). Swirl both vials gently. Keep separate.",
      "resultingConcentrationMgPerMl": 215.7,
      "handlingRule": "Two distinct clear solutions. Store strictly refrigerated at 2\u00b0C\u20138\u00b0C."
    },
    "dosing": {
      "standardDoseDisplay": "Epithalon: 5.0\u201310.0 mg daily (pulse); Glutathione: 150\u2013300 mg (2\u20133x weekly)",
      "standardDoseMcg": 5000,
      "cadence": "Epithalon 10\u201320 day cycle; Glutathione ongoing 2\u20133x weekly",
      "halfLife": "Epithalon: ~20\u201330 Minutes (biological epigenetic resets persist months); GSH: ~15 Minutes",
      "typicalProtocolDuration": "10 to 20 Days for Epithalon; 4 to 8 Weeks for Glutathione",
      "washoutPeriod": "4 to 6 Months between Epithalon pulse cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Pulse Activation Stage",
          "timeframe": "Days 1\u201310",
          "doseDisplay": "Epithalon: 5.0 mg daily | GSH: 150 mg 3x/wk",
          "doseMcg": 5000,
          "cadence": "Epithalon daily; GSH alternate days",
          "focus": "Telomerase elongation induction and systemic oxidative buffering",
          "notes": "Epithalon: 100 units (1.0 mL) from 5 mg/mL vial; GSH: 50 units (0.5 mL)"
        },
        {
          "stage": "Phase 2: High-Intensity Longevity Cycle",
          "timeframe": "Days 11\u201320",
          "doseDisplay": "Epithalon: 10.0 mg daily | GSH: 300 mg 3x/wk",
          "doseMcg": 10000,
          "cadence": "Epithalon daily; GSH alternate days",
          "focus": "Maximal TERT transcription and intracellular glutathione pool saturation",
          "notes": "Epithalon: 2x 1.0 mL draws; GSH: 100 units (1.0 mL)"
        },
        {
          "stage": "Phase 3: Epithalon Rest & Glutathione Maintenance",
          "timeframe": "Weeks 4\u20138",
          "doseDisplay": "Epithalon: 0 mg (washout) | GSH: 200 mg 2x/wk",
          "doseMcg": 0,
          "cadence": "Glutathione 2x weekly",
          "focus": "Epigenetic consolidation during Epithalon washout window",
          "notes": "Maintain weekly glutathione redox support"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Dual Syringe Protocol: U-100 Insulin Syringe (Epithalon & Glutathione)",
      "standardIUDisplay": "Epithalon: 100 units (1.0 mL = 5.0 mg) | GSH: 50\u2013100 units (0.5\u20131.0 mL)",
      "graduations": [
        {
          "doseDisplay": "Epithalon 2.5 mg (0.50 mL)",
          "doseMcg": 2500,
          "volumeMl": 0.5,
          "syringeIU": 50.0,
          "tickLabel": "50.0 units on U-100 syringe (Epithalon vial)"
        },
        {
          "doseDisplay": "Epithalon 5.0 mg (1.00 mL)",
          "doseMcg": 5000,
          "volumeMl": 1.0,
          "syringeIU": 100.0,
          "tickLabel": "100.0 units (1.0 mL full syringe Epithalon)"
        },
        {
          "doseDisplay": "Glutathione 150 mg (0.50 mL)",
          "doseMcg": 150000,
          "volumeMl": 0.5,
          "syringeIU": 50.0,
          "tickLabel": "50.0 units on syringe (Glutathione vial)"
        },
        {
          "doseDisplay": "Glutathione 300 mg (1.00 mL)",
          "doseMcg": 300000,
          "volumeMl": 1.0,
          "syringeIU": 100.0,
          "tickLabel": "100.0 units (1.0 mL full syringe Glutathione)"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20\u00b0C desiccated (24 months shelf life)",
      "reconstituted": "2\u00b0C\u20138\u00b0C refrigerated; use Epithalon within 20 days; Glutathione within 21 days",
      "lightProtection": true
    },
    "citations": [
      {
        "sourceReference": "PMID: 15372138",
        "notes": "Khavinson VKh, et al. Peptide promotes overcoming of the division limit in human somatic cells. Bull Exp Biol Med. 2004;137(5):503-506."
      },
      {
        "sourceReference": "PMID: 19166318",
        "notes": "Ballatori N, et al. Glutathione dysregulation and the etiology and progression of human diseases. Biol Chem. 2009;390(3):191-214."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and scientific evaluation. Not for human or veterinary administration.",
    "evidenceTier": "Tier 1: Clinical Longevity Standard",
    "bundleVials": [
      {
        "compoundName": "Epithalon (Ala-Glu-Asp-Gly Synthetic Pineal Tetrapeptide)",
        "vialNetMass": "10 mg",
        "diluentMl": 2.0,
        "concMgMl": 5.0,
        "solvent": "Bacteriostatic Water USP",
        "reconstitutionInstructions": "Introduce 2.0 mL BAC water down inner glass wall. Swirl gently for 30s.",
        "targetDose": "5.0 mg \u2013 10.0 mg daily",
        "cadence": "Daily pulse for 10\u201320 days",
        "syringeUnits": "100 units (1.0 mL) = 5.0 mg"
      },
      {
        "compoundName": "Glutathione Reduced (L-Glutathione)",
        "vialNetMass": "1500 mg",
        "diluentMl": 5.0,
        "concMgMl": 300.0,
        "solvent": "Bacteriostatic Water USP",
        "reconstitutionInstructions": "Introduce 5.0 mL BAC water. Allow 2\u20133 minutes for complete hydration. Swirl gently.",
        "targetDose": "150 mg \u2013 300 mg per session",
        "cadence": "2\u20133x Weekly SubQ/IM",
        "syringeUnits": "50 to 100 units (0.50\u20131.00 mL)"
      }
    ]
  },
  {
    "id": "epithalon-glutathione-nad-bundle",
    "compoundName": "Epithalon + Glutathione + NAD+ Bundle",
    "handles": [
      "epithalon-glutathione-nad-bundle",
      "triple-longevity-bundle",
      "anti-aging-triad-bundle"
    ],
    "subtitle": "Triple-Vial Master Longevity Triad (Telomerase \u00b7 Sirtuin Activation \u00b7 Redox Defense)",
    "longDescription": "**What it is:** The premier multi-vial anti-senescence research suite combining three distinct physiological powerhouses: Epithalon (10mg), Glutathione Reduced (1500mg), and NAD+ (500mg).\n\n**How it works:** Tackles cellular aging through three non-overlapping hallmarks: Epithalon upregulates telomerase to preserve chromosomal length; NAD+ drives mitochondrial oxidative phosphorylation and activates SIRT1/SIRT3 deacylases; Glutathione prevents lipid peroxidation and maintains reduced intracellular thiol pools.\n\n**CRITICAL CLINICAL HANDLING:** Reconstitute each of the three vials independently in its own BAC water volume. Never combine liquids into one vial.",
    "category": "Multi-Peptide Blends",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "epithalon-glutathione-nad-bundle",
    "purityStandard": "\u226599.0% (Triple HPLC Verified Standards)",
    "investigatedBenefits": [
      "Comprehensive cellular rejuvenation across telomeric, mitochondrial, and redox pathways",
      "Mitochondrial ATP replenishment and Sirtuin (SIRT1/SIRT3) longevity pathway activation",
      "Telomeric repeat addition and protection against replicative cellular exhaustion",
      "Systemic quenching of reactive nitrogen and oxygen species (RNS/ROS)"
    ],
    "adverseObservations": [
      "Subcutaneous stinging or local warmth if NAD+ is injected too rapidly",
      "Temporary chest tightness or flushing with high-dose NAD+",
      "Injection site fatigue requiring quadrant rotation"
    ],
    "reconstitution": {
      "defaultVialNetMg": 2010,
      "defaultDiluentMl": 12.0,
      "solvent": "Bacteriostatic Water USP (3x Separate Dilution Vials Required)",
      "dissolutionMethod": "Reconstitute Epithalon 10mg with 2.0 mL BAC (5 mg/mL). Reconstitute Glutathione 1500mg with 5.0 mL BAC (300 mg/mL). Reconstitute NAD+ 500mg with 5.0 mL BAC (100 mg/mL). Store in 3 separate sterile vials.",
      "resultingConcentrationMgPerMl": 167.5,
      "handlingRule": "Three distinct aqueous preparations. Inspect all against dark background. Keep refrigerated at 2\u00b0C\u20138\u00b0C."
    },
    "dosing": {
      "standardDoseDisplay": "Epithalon: 5mg daily (pulse); GSH: 150\u2013300mg (2x/wk); NAD+: 50\u2013100mg (2\u20133x/wk)",
      "standardDoseMcg": 5000,
      "cadence": "Multi-cadence scheduled protocol",
      "halfLife": "Epithalon: ~30m; GSH: ~15m; NAD+: ~15\u201330m (circulating)",
      "typicalProtocolDuration": "10 to 20 Days (Epithalon) / 6 to 8 Weeks (NAD+ & GSH)",
      "washoutPeriod": "4 to 6 Months between Epithalon pulses",
      "titrationSteps": [
        {
          "stage": "Phase 1: Triad System Equilibration",
          "timeframe": "Week 1",
          "doseDisplay": "Epithalon: 5mg | GSH: 150mg | NAD+: 50mg",
          "doseMcg": 5000,
          "cadence": "Epithalon daily; NAD+ & GSH alternate days",
          "focus": "Initial mitochondrial and redox equilibration without injection discomfort",
          "notes": "Epithalon: 100u; GSH: 50u; NAD+: 50u via separate injections"
        },
        {
          "stage": "Phase 2: Peak Synergistic Longevity Pulse",
          "timeframe": "Weeks 2\u20133",
          "doseDisplay": "Epithalon: 10mg | GSH: 300mg | NAD+: 100mg",
          "doseMcg": 10000,
          "cadence": "Epithalon daily (10d); NAD+ 3x/wk; GSH 2x/wk",
          "focus": "Maximal TERT induction, sirtuin deacetylation, and glutathione saturation",
          "notes": "Epithalon: 2.0 mL; GSH: 1.0 mL; NAD+: 1.0 mL"
        },
        {
          "stage": "Phase 3: Cellular Consolidation & Maintenance",
          "timeframe": "Weeks 4\u20138",
          "doseDisplay": "Epithalon: Washout | GSH: 150mg 2x/wk | NAD+: 50mg 2x/wk",
          "doseMcg": 0,
          "cadence": "NAD+ & GSH maintenance twice weekly",
          "focus": "Long-term cellular bioenergetics maintenance post-Epithalon pulse",
          "notes": "Rotate abdominal injection quadrants"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Triple Syringe Protocol: U-100 Insulin Syringes for each constituent",
      "standardIUDisplay": "Epithalon: 100u (1.0 mL) | GSH: 50\u2013100u | NAD+: 50\u2013100u",
      "graduations": [
        {
          "doseDisplay": "Epithalon 5.0 mg (1.00 mL)",
          "doseMcg": 5000,
          "volumeMl": 1.0,
          "syringeIU": 100.0,
          "tickLabel": "100.0 units (1.0 mL full syringe Epithalon)"
        },
        {
          "doseDisplay": "Glutathione 150 mg (0.50 mL)",
          "doseMcg": 150000,
          "volumeMl": 0.5,
          "syringeIU": 50.0,
          "tickLabel": "50.0 units on syringe (Glutathione vial)"
        },
        {
          "doseDisplay": "Glutathione 300 mg (1.00 mL)",
          "doseMcg": 300000,
          "volumeMl": 1.0,
          "syringeIU": 100.0,
          "tickLabel": "100.0 units (1.0 mL full syringe Glutathione)"
        },
        {
          "doseDisplay": "NAD+ 50 mg (0.50 mL)",
          "doseMcg": 50000,
          "volumeMl": 0.5,
          "syringeIU": 50.0,
          "tickLabel": "50.0 units on syringe (NAD+ vial)"
        },
        {
          "doseDisplay": "NAD+ 100 mg (1.00 mL)",
          "doseMcg": 100000,
          "volumeMl": 1.0,
          "syringeIU": 100.0,
          "tickLabel": "100.0 units (1.0 mL full syringe NAD+)"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20\u00b0C dark desiccator (24 months shelf life)",
      "reconstituted": "2\u00b0C\u20138\u00b0C refrigerated; use Epithalon within 20d; GSH within 21d; NAD+ within 28d",
      "lightProtection": true
    },
    "citations": [
      {
        "sourceReference": "PMID: 14501183",
        "notes": "Anisimov VN, et al. Epitalon slows down aging and suppresses development of spontaneous tumors. Biogerontology. 2003;4(4):193-202."
      },
      {
        "sourceReference": "PMID: 29514072",
        "notes": "Rajman L, Chwalek K, Sinclair DA. Therapeutic Potential of NAD-Boosting Molecules: The In Vivo Evidence. Cell Metab. 2018;27(3):529-547."
      },
      {
        "sourceReference": "PMID: 26770127",
        "notes": "Pizzorno J. Glutathione! Integr Med (Encinitas). 2014;13(1):8-12."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and scientific evaluation. Not for human or veterinary administration.",
    "evidenceTier": "Tier 1: Master Longevity Suite",
    "bundleVials": [
      {
        "compoundName": "Epithalon (Telomerase Tetrapeptide)",
        "vialNetMass": "10 mg",
        "diluentMl": 2.0,
        "concMgMl": 5.0,
        "solvent": "Bacteriostatic Water USP",
        "reconstitutionInstructions": "Add 2.0 mL BAC water down vial wall. Swirl gently for 30 seconds.",
        "targetDose": "5.0 mg \u2013 10.0 mg daily",
        "cadence": "10\u201320 Day Pulse Cycle",
        "syringeUnits": "100 units (1.0 mL) = 5.0 mg"
      },
      {
        "compoundName": "Glutathione Reduced (Redox Buffer)",
        "vialNetMass": "1500 mg",
        "diluentMl": 5.0,
        "concMgMl": 300.0,
        "solvent": "Bacteriostatic Water USP",
        "reconstitutionInstructions": "Add 5.0 mL BAC water slowly. Allow 2\u20133 minutes to dissolve completely.",
        "targetDose": "150 mg \u2013 300 mg per dose",
        "cadence": "2\u20133x Weekly SubQ/IM",
        "syringeUnits": "50 to 100 units (0.50\u20131.00 mL)"
      },
      {
        "compoundName": "NAD+ (Beta-Nicotinamide Adenine Dinucleotide)",
        "vialNetMass": "500 mg",
        "diluentMl": 5.0,
        "concMgMl": 100.0,
        "solvent": "Bacteriostatic Water USP",
        "reconstitutionInstructions": "Add 5.0 mL BAC water. Swirl gently until clear and transparent.",
        "targetDose": "50 mg \u2013 100 mg per dose",
        "cadence": "2\u20133x Weekly SubQ",
        "syringeUnits": "50 to 100 units (0.50\u20131.00 mL)"
      }
    ]
  },
  {
    "id": "glutathione-nad-ghk-cu-bundle",
    "compoundName": "Glutathione + NAD+ + GHK-Cu Bundle",
    "handles": [
      "glutathione-nad-ghk-cu-bundle",
      "mitochondrial-matrix-bundle",
      "gsh-nad-ghk-stack"
    ],
    "subtitle": "Triple-Vial Cellular Bioenergetics, Detoxification & Matrix Remodeling Protocol",
    "longDescription": "**What it is:** A comprehensive multi-vial analytical stack pairing Reduced Glutathione (1500mg), NAD+ (500mg), and GHK-Cu (100mg) for multi-tiered cellular investigation.\n\n**How it works:** Coordinates three essential physiological axes: Glutathione maintains intracellular redox homeostasis; NAD+ replenishes mitochondrial electron transport efficiency and fuels sirtuin enzymes; GHK-Cu activates fibroblast gene transcription, tissue remodeling, and collagen deposition.\n\n**CRITICAL CLINICAL HANDLING:** Reconstitute all three vials separately. Do NOT combine GHK-Cu with Glutathione in the same container to avoid copper-mediated thiol oxidation.",
    "category": "Multi-Peptide Blends",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "glutathione-nad-ghk-cu-bundle",
    "purityStandard": "\u226599.0% (Triple Analytical HPLC Standards)",
    "investigatedBenefits": [
      "Coordinated mitochondrial biogenesis and ATP synthesis enhancement",
      "Extracellular matrix remodeling and collagen types I/III upregulation",
      "High-efficiency neutralization of free radicals and lipid peroxidation products",
      "Cellular longevity signaling through synergistic SIRT1 and TGF-beta cascades"
    ],
    "adverseObservations": [
      "Injection site stinging from NAD+ or concentrated GHK-Cu if injected rapidly",
      "Mild transient flushing following NAD+ administration",
      "Occasional sulfur aftertaste from high-dose glutathione"
    ],
    "reconstitution": {
      "defaultVialNetMg": 2100,
      "defaultDiluentMl": 15.0,
      "solvent": "Bacteriostatic Water USP (3x Separate Dilution Vials Required)",
      "dissolutionMethod": "Reconstitute Glutathione 1500mg with 5.0 mL BAC (300 mg/mL). Reconstitute NAD+ 500mg with 5.0 mL BAC (100 mg/mL). Reconstitute GHK-Cu 100mg with 5.0 mL BAC (20 mg/mL). Keep separate.",
      "resultingConcentrationMgPerMl": 140.0,
      "handlingRule": "Three distinct vials. Store refrigerated at 2\u00b0C\u20138\u00b0C."
    },
    "dosing": {
      "standardDoseDisplay": "GHK-Cu: 1.0\u20132.0mg daily; NAD+: 50\u2013100mg (2\u20133x/wk); GSH: 150\u2013300mg (2x/wk)",
      "standardDoseMcg": 2000,
      "cadence": "Scheduled multi-vial cadence",
      "halfLife": "GHK: ~1\u20132h; NAD+: ~15\u201330m; GSH: ~15m",
      "typicalProtocolDuration": "6 to 8 Weeks per analytical cycle",
      "washoutPeriod": "2 to 4 Weeks between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Bioenergetic Calibration",
          "timeframe": "Weeks 1\u20132",
          "doseDisplay": "GHK: 1.0mg daily | NAD+: 50mg 2x/wk | GSH: 150mg 2x/wk",
          "doseMcg": 1000,
          "cadence": "Scheduled across weekdays",
          "focus": "Establish baseline cellular tolerance and initiate mitochondrial support",
          "notes": "GHK: 5u; NAD+: 50u; GSH: 50u"
        },
        {
          "stage": "Phase 2: Full Matrix & Redox Optimization",
          "timeframe": "Weeks 3\u20136",
          "doseDisplay": "GHK: 2.0mg daily | NAD+: 100mg 3x/wk | GSH: 300mg 2x/wk",
          "doseMcg": 2000,
          "cadence": "High-intensity multi-pathway support",
          "focus": "Maximal mitochondrial respiration, sirtuin activation, and matrix remodeling",
          "notes": "GHK: 10u; NAD+: 100u; GSH: 100u"
        },
        {
          "stage": "Phase 3: Consolidation & Washout Transition",
          "timeframe": "Weeks 7\u20138",
          "doseDisplay": "GHK: 1.0mg alt days | NAD+: 50mg 2x/wk | GSH: 150mg 1x/wk",
          "doseMcg": 1000,
          "cadence": "Step-down maintenance",
          "focus": "Consolidation of mitochondrial and matrix gains prior to cycle rest",
          "notes": "Monitor systemic markers"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Triple Syringe Protocol: U-100 Insulin Syringes for each vial",
      "standardIUDisplay": "GHK: 10u (0.1 mL) | NAD+: 50\u2013100u | GSH: 50\u2013100u",
      "graduations": [
        {
          "doseDisplay": "GHK-Cu 1.0 mg (0.05 mL)",
          "doseMcg": 1000,
          "volumeMl": 0.05,
          "syringeIU": 5.0,
          "tickLabel": "5.0 units on U-100 syringe (GHK-Cu vial)"
        },
        {
          "doseDisplay": "GHK-Cu 2.0 mg (0.10 mL)",
          "doseMcg": 2000,
          "volumeMl": 0.1,
          "syringeIU": 10.0,
          "tickLabel": "10.0 units on U-100 syringe (GHK-Cu vial)"
        },
        {
          "doseDisplay": "NAD+ 50 mg (0.50 mL)",
          "doseMcg": 50000,
          "volumeMl": 0.5,
          "syringeIU": 50.0,
          "tickLabel": "50.0 units on syringe (NAD+ vial)"
        },
        {
          "doseDisplay": "NAD+ 100 mg (1.00 mL)",
          "doseMcg": 100000,
          "volumeMl": 1.0,
          "syringeIU": 100.0,
          "tickLabel": "100.0 units (1.0 mL full syringe NAD+)"
        },
        {
          "doseDisplay": "Glutathione 150 mg (0.50 mL)",
          "doseMcg": 150000,
          "volumeMl": 0.5,
          "syringeIU": 50.0,
          "tickLabel": "50.0 units on syringe (Glutathione vial)"
        },
        {
          "doseDisplay": "Glutathione 300 mg (1.00 mL)",
          "doseMcg": 300000,
          "volumeMl": 1.0,
          "syringeIU": 100.0,
          "tickLabel": "100.0 units (1.0 mL full syringe Glutathione)"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20\u00b0C desiccated (24 months shelf life)",
      "reconstituted": "2\u00b0C\u20138\u00b0C refrigerated; use GHK within 30d; NAD+ within 28d; GSH within 21d",
      "lightProtection": true
    },
    "citations": [
      {
        "sourceReference": "PMID: 24014316",
        "notes": "Sinclair DA, Guarente L. Small-molecule SIRT1 activators for the treatment of aging and age-related diseases. Methods Mol Biol. 2014;1077:3-19."
      },
      {
        "sourceReference": "PMID: 26264024",
        "notes": "Pickart L, Vasquez-Soltero JM, Margolina A. GHK-Cu may prevent oxidative stress and NF-kB activation. Biomolecules. 2015;5(4):2545-2561."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and scientific evaluation. Not for human or veterinary administration.",
    "evidenceTier": "Tier 1: High-Synergy Research Suite",
    "bundleVials": [
      {
        "compoundName": "Glutathione Reduced (Redox Buffer)",
        "vialNetMass": "1500 mg",
        "diluentMl": 5.0,
        "concMgMl": 300.0,
        "solvent": "Bacteriostatic Water USP",
        "reconstitutionInstructions": "Add 5.0 mL BAC water slowly. Allow 2\u20133 minutes to dissolve completely.",
        "targetDose": "150 mg \u2013 300 mg per dose",
        "cadence": "2x Weekly SubQ/IM",
        "syringeUnits": "50 to 100 units (0.50\u20131.00 mL)"
      },
      {
        "compoundName": "NAD+ (Coenzyme 1)",
        "vialNetMass": "500 mg",
        "diluentMl": 5.0,
        "concMgMl": 100.0,
        "solvent": "Bacteriostatic Water USP",
        "reconstitutionInstructions": "Add 5.0 mL BAC water. Swirl gently until completely clear.",
        "targetDose": "50 mg \u2013 100 mg per dose",
        "cadence": "2\u20133x Weekly SubQ",
        "syringeUnits": "50 to 100 units (0.50\u20131.00 mL)"
      },
      {
        "compoundName": "GHK-Cu (Tissue Remodeling Peptide)",
        "vialNetMass": "100 mg",
        "diluentMl": 5.0,
        "concMgMl": 20.0,
        "solvent": "Bacteriostatic Water USP",
        "reconstitutionInstructions": "Add 5.0 mL BAC water. Swirl gently until characteristic deep blue.",
        "targetDose": "1.0 mg \u2013 2.0 mg daily",
        "cadence": "1x Daily SubQ",
        "syringeUnits": "5 to 10 units (0.05\u20130.10 mL) on U-100 syringe"
      }
    ]
  },
  {
    "id": "nad-ghk-cu-bundle",
    "compoundName": "NAD+ + GHK-Cu Bundle",
    "handles": [
      "nad-ghk-cu-bundle",
      "nad-copper-bundle",
      "cellular-energy-matrix-bundle"
    ],
    "subtitle": "Dual-Vial Mitochondrial Bioenergetics & Extracellular Matrix Rejuvenation Standard",
    "longDescription": "**What it is:** A high-impact dual-vial analytical stack pairing high-purity Beta-Nicotinamide Adenine Dinucleotide (NAD+ 500mg) and Copper Tripeptide-1 (GHK-Cu 100mg).\n\n**How it works:** NAD+ fuels the Krebs cycle, mitochondrial electron transport chain complex I, and sirtuin longevity enzymes, while GHK-Cu stimulates fibroblast gene expression, matrix metalloproteinase regulation, and systemic tissue remodeling.\n\n**CRITICAL CLINICAL HANDLING:** Reconstitute both vials separately. Administer in separate injection sites.",
    "category": "Multi-Peptide Blends",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "nad-ghk-cu-bundle",
    "purityStandard": "\u226599.0% (HPLC Individual Assay Standards)",
    "investigatedBenefits": [
      "Mitochondrial respiratory capacity and intracellular NAD+/NADH ratio enhancement",
      "Accelerated collagen types I/III and glycosaminoglycan synthesis",
      "SIRT1 and PARP1 metabolic enzyme activation for DNA repair",
      "Systemic cellular vitality and microvascular health optimization"
    ],
    "adverseObservations": [
      "Injection site sting if NAD+ or GHK-Cu are administered too rapidly",
      "Mild transient flushing or warmth following NAD+ injection",
      "Occasional lightheadedness if injected while fasting"
    ],
    "reconstitution": {
      "defaultVialNetMg": 600,
      "defaultDiluentMl": 10.0,
      "solvent": "Bacteriostatic Water USP (2x Separate Dilution Vials Required)",
      "dissolutionMethod": "Reconstitute NAD+ 500mg with 5.0 mL BAC water (100.0 mg/mL). Reconstitute GHK-Cu 100mg with 5.0 mL BAC water (20.0 mg/mL). Swirl both vials gently. Keep separate.",
      "resultingConcentrationMgPerMl": 60.0,
      "handlingRule": "Two distinct vials (1 clear aqueous NAD+, 1 deep royal blue GHK-Cu). Store refrigerated at 2\u00b0C\u20138\u00b0C."
    },
    "dosing": {
      "standardDoseDisplay": "GHK-Cu: 1.0\u20132.0mg daily; NAD+: 50\u2013100mg (2\u20133x weekly)",
      "standardDoseMcg": 2000,
      "cadence": "GHK-Cu daily SubQ; NAD+ 2\u20133x weekly SubQ",
      "halfLife": "GHK: ~1\u20132h; NAD+: ~15\u201330m",
      "typicalProtocolDuration": "6 to 8 Weeks per analytical research block",
      "washoutPeriod": "2 to 4 Weeks between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Bioenergetic Initiation",
          "timeframe": "Weeks 1\u20132",
          "doseDisplay": "GHK: 1.0mg daily | NAD+: 50mg 2x/wk",
          "doseMcg": 1000,
          "cadence": "GHK daily; NAD+ Mon/Thu",
          "focus": "Baseline cellular adaptation and injection tolerance assessment",
          "notes": "GHK: 5 units (0.05 mL); NAD+: 50 units (0.5 mL)"
        },
        {
          "stage": "Phase 2: Target Therapeutic Synergy",
          "timeframe": "Weeks 3\u20136",
          "doseDisplay": "GHK: 2.0mg daily | NAD+: 100mg 3x/wk",
          "doseMcg": 2000,
          "cadence": "GHK daily; NAD+ Mon/Wed/Fri",
          "focus": "Full sirtuin pathway stimulation and maximal collagen matrix remodeling",
          "notes": "GHK: 10 units (0.10 mL); NAD+: 100 units (1.0 mL)"
        },
        {
          "stage": "Phase 3: Maintenance Phase",
          "timeframe": "Weeks 7\u20138",
          "doseDisplay": "GHK: 1.0mg alternate days | NAD+: 50mg 2x/wk",
          "doseMcg": 1000,
          "cadence": "Step-down maintenance",
          "focus": "Sustained cellular vigor prior to experimental cycle washout",
          "notes": "Alternate injection quadrants"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Dual Syringe Protocol: U-100 Insulin Syringes for each vial",
      "standardIUDisplay": "GHK: 10u (0.1 mL) | NAD+: 50\u2013100u (0.5\u20131.0 mL)",
      "graduations": [
        {
          "doseDisplay": "GHK-Cu 1.0 mg (0.05 mL)",
          "doseMcg": 1000,
          "volumeMl": 0.05,
          "syringeIU": 5.0,
          "tickLabel": "5.0 units on U-100 syringe (GHK-Cu vial)"
        },
        {
          "doseDisplay": "GHK-Cu 2.0 mg (0.10 mL)",
          "doseMcg": 2000,
          "volumeMl": 0.1,
          "syringeIU": 10.0,
          "tickLabel": "10.0 units on U-100 syringe (GHK-Cu vial)"
        },
        {
          "doseDisplay": "NAD+ 50 mg (0.50 mL)",
          "doseMcg": 50000,
          "volumeMl": 0.5,
          "syringeIU": 50.0,
          "tickLabel": "50.0 units on syringe (NAD+ vial)"
        },
        {
          "doseDisplay": "NAD+ 100 mg (1.00 mL)",
          "doseMcg": 100000,
          "volumeMl": 1.0,
          "syringeIU": 100.0,
          "tickLabel": "100.0 units (1.0 mL full syringe NAD+)"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20\u00b0C desiccated in dark storage (24 months shelf life)",
      "reconstituted": "2\u00b0C\u20138\u00b0C refrigerated; use GHK within 30 days; NAD+ within 28 days",
      "lightProtection": true
    },
    "citations": [
      {
        "sourceReference": "PMID: 33353981",
        "notes": "Covarrubias AJ, et al. NAD+ metabolism and its roles in cellular processes during ageing. Nat Rev Mol Cell Biol. 2021;22(2):119-141."
      },
      {
        "sourceReference": "PMID: 18644225",
        "notes": "Pickart L. The human tri-peptide GHK and tissue remodeling. J Biomater Sci Polym Ed. 2008;19(8):969-988."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and scientific evaluation. Not for human or veterinary administration.",
    "evidenceTier": "Tier 1: Bioenergetic Synergy Standard",
    "bundleVials": [
      {
        "compoundName": "NAD+ (Nicotinamide Adenine Dinucleotide)",
        "vialNetMass": "500 mg",
        "diluentMl": 5.0,
        "concMgMl": 100.0,
        "solvent": "Bacteriostatic Water USP",
        "reconstitutionInstructions": "Add 5.0 mL BAC water slowly down vial wall. Swirl gently until clear.",
        "targetDose": "50 mg \u2013 100 mg per session",
        "cadence": "2\u20133x Weekly SubQ",
        "syringeUnits": "50 to 100 units (0.50\u20131.00 mL)"
      },
      {
        "compoundName": "GHK-Cu (Copper Tripeptide-1)",
        "vialNetMass": "100 mg",
        "diluentMl": 5.0,
        "concMgMl": 20.0,
        "solvent": "Bacteriostatic Water USP",
        "reconstitutionInstructions": "Add 5.0 mL BAC water. Swirl gently until deep blue.",
        "targetDose": "1.0 mg \u2013 2.0 mg daily",
        "cadence": "1x Daily SubQ",
        "syringeUnits": "5 to 10 units (0.05\u20130.10 mL) on U-100 syringe"
      }
    ]
  }
]
