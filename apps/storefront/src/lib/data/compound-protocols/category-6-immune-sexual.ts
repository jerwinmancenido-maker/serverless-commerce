import type { CompoundAnalyticalProtocol } from "./types"

export const CATEGORY_6_IMMUNE_SEXUAL_PROTOCOLS: CompoundAnalyticalProtocol[] = [
  {
    "id": "ll-37",
    "compoundName": "LL-37",
    "handles": [
      "ll-37",
      "ll37",
      "cathelicidin"
    ],
    "subtitle": "Human Cathelicidin Antimicrobial Peptide & Biofilm Disruption Standard",
    "longDescription": "**What it is:** LL-37 is a 37-amino-acid antimicrobial peptide (AMP) representing the active functional cleavage fragment of human cathelicidin (hCAP-18).\n\n**How it works:** LL-37 carries a strong net positive charge, allowing it to bind to negatively charged bacterial membranes and physically punch holes through them, causing rapid bacterial lysis. It destroys both Gram-positive and Gram-negative bacteria, dissolves protective bacterial biofilms, clears fungal pathogens, and recruits immune cells to wound sites.\n\n**Why researchers study it:** Researched as a powerful natural antibiotic alternative, for eradicating antibiotic-resistant bacteria (MRSA, Pseudomonas), destroying bacterial biofilms, and accelerating chronic non-healing wound recovery.",
    "category": "Antimicrobial & Immune",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "ll-37",
    "reconstitution": {
      "defaultVialNetMg": 5,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.5 mL diluent slowly down the glass wall. Swirl gently horizontally for 45 seconds until transparent. Avoid shaking to prevent peptide foaming.",
      "resultingConcentrationMgPerMl": 2,
      "handlingRule": "Clear, colorless aqueous solution. Store strictly refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "100 mcg daily",
      "standardDoseMcg": 100,
      "cadence": "1x Daily (SubQ)",
      "halfLife": "~2–3 Hours (Direct electrostatic pore formation in bacterial membranes and intracellular signaling)",
      "typicalProtocolDuration": "2 to 4 Weeks",
      "washoutPeriod": "2 to 4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Days 1–5",
          "doseDisplay": "50 mcg – 100 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily",
          "focus": "Electrostatic disruption of anionic bacterial membranes, persistent biofilm destabilization, and immune cell chemotaxis",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 2.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Antimicrobial Block",
          "timeframe": "Days 6–21",
          "doseDisplay": "100 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily",
          "focus": "Neutralization of lipopolysaccharide (LPS) endotoxins and wound bed angiogenesis promotion",
          "notes": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 4–5",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of host microbiome equilibrium post-administration",
          "notes": "2-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "50 mcg (Micro Initiation)",
          "doseMcg": 50,
          "volumeMl": 0.025,
          "syringeIU": 2.5,
          "tickLabel": "2.5 units (0.025 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "100 mcg (Standard Target)",
          "doseMcg": 100,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 21 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "154947-66-7",
      "pubchemCid": 16198951,
      "sequenceOrFormula": "Leu-Leu-Gly-Asp-Phe-Phe-Arg-Lys-Ser-Lys-Glu-Lys-Ile-Gly-Lys-Glu-Phe-Lys-Arg-Ile-Val-Gln-Arg-Ile-Lys-Asp-Phe-Leu-Arg-Asn-Leu-Val-Pro-Arg-Thr-Glu-Ser",
      "molecularWeightGPerMol": 4493.33
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 12782669",
        "notes": "Koczulla et al. An angiogenic role for the human peptide antibiotic LL-37/hCAP-18. J Clin Invest. 2003."
      },
      {
        "sourceReference": "PubMed PMID: 18840508",
        "notes": "Overhage et al. Human host defense peptide LL-37 prevents bacterial biofilm formation. Infect Immun. 2008."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Broad-Spectrum Antimicrobial Action**: Directly destroys Gram-positive and Gram-negative bacteria, fungi, and lipid-enveloped viruses.",
      "**Breaks Down Tough Bacterial Biofilms**: Penetrates and dissolves protective biofilm shields that make chronic infections resistant to standard antibiotics.",
      "**Zero Traditional Bacterial Resistance**: Physical membrane disruption makes it virtually impossible for bacteria to evolve biological resistance.",
      "**Accelerates Dermal Wound Healing**: Stimulates re-epithelialization, keratinocyte migration, and healthy microvascular blood vessel growth.",
      "**Immune Cell Recruitment**: Acts as a natural chemokine, attracting neutrophils and monocytes to clear cellular debris at infection sites."
    ],
    "adverseObservations": [
      "**Significant Injection Site Stinging**: Can cause noticeable localized stinging, redness, or a small welt due to immune mast cell activation.",
      "**Dilution Recommendation**: Using a larger volume of Bacteriostatic Water (e.g. 2–3 mL) substantially diminishes localized stinging.",
      "**Transient Joint Aches**: High systemic concentrations can trigger mild temporary flu-like sensations as immune pathways activate.",
      "**Gentle Reconstitution Required**: Large peptide chain; roll gently between palms without shaking and keep refrigerated."
    ]
  },
  {
    "id": "thymosin-alpha-1",
    "compoundName": "Thymosin Alpha-1",
    "handles": [
      "thymosin-alpha-1",
      "ta1",
      "zadaxin-component"
    ],
    "subtitle": "Synthetic 28-Amino Acid Thymic Peptide TLR9 & Cytotoxic T-Cell Modulator Standard",
    "longDescription": "**What it is:** Thymosin Alpha-1 (Talpha1) is a 28-amino-acid peptide naturally produced by the thymus gland, essential for programming, training, and regulating the human immune system.\n\n**How it works:** It acts as an immune system master-regulator. Through Toll-like receptors (TLR9 and TLR2), it ramps up underactive immune responses by stimulating cytotoxic T-cells, Natural Killer (NK) cells, and dendritic cells to attack viruses and infections. Simultaneously, it increases anti-inflammatory T-regulatory (Treg) cells, preventing the immune system from overreacting and attacking the body's own tissues.\n\n**Why researchers study it:** Studied worldwide for treating chronic viral infections (Hepatitis B/C, HIV), preventing respiratory illnesses, enhancing vaccine responsiveness, calming autoimmune flare-ups, and supporting immune recovery during chemotherapy.",
    "category": "Antimicrobial & Immune",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "thymosin-alpha-1",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 45 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "1.5 mg twice weekly (or 1.0 mg daily in acute assays)",
      "standardDoseMcg": 1500,
      "cadence": "2x Weekly (e.g., Mon / Thu SubQ)",
      "halfLife": "~2 Hours (Induces sustained transcription of TLR-7/9 and MHC Class I molecules for days)",
      "typicalProtocolDuration": "4 to 8 Weeks",
      "washoutPeriod": "4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Dendritic & T-Cell Priming",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "1.5 mg twice weekly (1500 mcg)",
          "doseMcg": 1500,
          "cadence": "2x Weekly (e.g., Mon / Thu)",
          "focus": "Toll-like receptor (TLR9/TLR7) signaling activation on dendritic cells and CD4+/CD8+ maturation induction",
          "notes": "30.0 units (0.30 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Cytotoxic Maturation",
          "timeframe": "Weeks 3–6",
          "doseDisplay": "1.5 mg twice weekly",
          "doseMcg": 1500,
          "cadence": "2x Weekly",
          "focus": "Natural killer (NK) cell cytotoxicity enhancement, interferon-gamma release, and antibody response optimization",
          "notes": "30.0 units (0.30 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of sustained memory T-cell frequency post-protocol",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "30.0 units (0.30 mL)",
      "graduations": [
        {
          "doseDisplay": "1.00 mg (Acute Protocol)",
          "doseMcg": 1000,
          "volumeMl": 0.2,
          "syringeIU": 20,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.50 mg (Standard Target)",
          "doseMcg": 1500,
          "volumeMl": 0.3,
          "syringeIU": 30,
          "tickLabel": "30.0 units (0.30 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "62304-98-7",
      "pubchemCid": 16130571,
      "sequenceOrFormula": "Ac-Ser-Asp-Ala-Ala-Val-Asp-Thr-Ser-Ser-Glu-Ile-Thr-Thr-Lys-Asp-Leu-Lys-Glu-Lys-Lys-Glu-Val-Val-Glu-Glu-Ala-Glu-Asn",
      "molecularWeightGPerMol": 3108.3
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 20146312",
        "notes": "Matteucci et al. Thymosin alpha 1 and cancer: personal experience and review of the literature."
      },
      {
        "sourceReference": "PubMed PMID: 17466858",
        "notes": "Garaci et al. Thymosin alpha 1 in the treatment of cancer: from bench to bedside."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Master Immune System Modulator**: Enhances weak immune defense against pathogens while calming dangerous autoimmune overreactions.",
      "**Boosts T-Cell and Natural Killer Cell Activity**: Substantially increases the count, maturity, and tumor/pathogen-killing capability of cytotoxic T-cells.",
      "**Toll-Like Receptor (TLR) Activation**: Enhances antigen presentation by dendritic cells, speeding up the detection of foreign invaders.",
      "**Broad Antiviral & Anti-Infection Defense**: Proven clinical record in reducing viral load and infection duration in respiratory and chronic viral conditions.",
      "**Balances Immune Tolerance (Treg Support)**: Increases regulatory T-cells to suppress harmful systemic inflammation and autoimmune attacks.",
      "**Improves Vaccine Responsiveness**: Significantly boosts antibody production following vaccinations in elderly or immunocompromised subjects."
    ],
    "adverseObservations": [
      "**Exceptional Safety & Tolerability**: Decades of clinical use in over 30 countries demonstrate an extraordinarily clean safety profile.",
      "**Mild Injection Site Redness**: Occasional slight redness or mild irritation at the subcutaneous injection point.",
      "**Temporary Joint Discomfort**: Rare, mild transient joint stiffness during initial immune activation.",
      "**Storage Standards**: Reconstitute with Bacteriostatic Water; store refrigerated at 2°C–8°C away from heat."
    ]
  },
  {
    "id": "melanotan-1",
    "compoundName": "Melanotan I",
    "handles": [
      "melanotan-1",
      "mt-1",
      "afamelanotide"
    ],
    "subtitle": "Selective Melanocortin MC1R Agonist Eumelanin Photoprotection Standard",
    "longDescription": "**What it is:** Melanotan I (Afamelanotide) is a synthetic 13-amino-acid peptide analogue of alpha-Melanocyte-Stimulating Hormone (alpha-MSH), engineered with two amino acid substitutions to resist enzyme degradation.\n\n**How it works:** It selectively binds to the Melanocortin-1 Receptor (MC1R) on melanocytes in the skin. This triggers eumelanin synthesis—the rich brown/black protective pigment that naturally absorbs and shields skin cells from damaging UV radiation. Crucially, because it is highly selective for MC1R, it promotes skin pigmentation without the severe nausea, blood pressure spikes, or sexual arousal caused by non-selective melanocortins.\n\n**Why researchers study it:** Studied for photoprotection in erythropoietic protoporphyria (EPP), preventing skin damage and sunburn in fair-skinned subjects, and generating natural, UV-free photoprotective pigmentation.",
    "category": "Photoprotection & Sexual Health",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "melanotan-1",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 30 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store protected from direct sunlight."
    },
    "dosing": {
      "standardDoseDisplay": "500 mcg – 1,000 mcg daily prior to UV exposure",
      "standardDoseMcg": 500,
      "cadence": "1x Daily (SubQ)",
      "halfLife": "~30 Minutes (Selective MC1R activation stimulates eumelanin synthesis for days without nausea)",
      "typicalProtocolDuration": "3 to 6 Weeks",
      "washoutPeriod": "4 to 8 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Melanogenesis Induction",
          "timeframe": "Days 1–5",
          "doseDisplay": "250 mcg – 500 mcg daily",
          "doseMcg": 500,
          "cadence": "1x Daily",
          "focus": "Selective MC1R binding on epidermal melanocytes, activating tyrosinase enzyme and photoprotective eumelanin synthesis",
          "notes": "10.0 units (0.10 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Photoprotective Matrix",
          "timeframe": "Weeks 2–4",
          "doseDisplay": "500 mcg – 1000 mcg daily (or on UV-exposed days)",
          "doseMcg": 1000,
          "cadence": "1x Daily",
          "focus": "Deep photoprotection, pyrimidine dimer reduction, and uniform pigmentation without systemic side effects",
          "notes": "20.0 units (0.20 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 5–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of natural epidermal turnover and pigmentation decay rate",
          "notes": "Pigmentation persists for 2–3 months following protocol"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "10.0 units (0.10 mL)",
      "graduations": [
        {
          "doseDisplay": "250 mcg (Micro Initiation)",
          "doseMcg": 250,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg (Standard Target)",
          "doseMcg": 500,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1000 mcg (Full Target)",
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
    "molecularDetails": {
      "casNumber": "75921-69-6",
      "pubchemCid": 16197727,
      "sequenceOrFormula": "Ac-Ser-Tyr-Ser-Nle-Glu-His-D-Phe-Arg-Trp-Gly-Lys-Pro-Val-NH2",
      "molecularWeightGPerMol": 1646.85
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 15262693",
        "notes": "Dorr et al. Effects of a superpotent melanotropic peptide in combination with solar UV radiation on tanning of the human skin."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Selective MC1R Receptor Tanning**: Stimulates natural, dark photoprotective eumelanin synthesis with high receptor selectivity.",
      "**Photoprotection Against UV Radiation**: Shields epidermal DNA from ultraviolet radiation, reducing sunburn severity and cellular damage.",
      "**Minimal Systemic Side Effects**: Does not trigger the intense nausea, facial flushing, or involuntary erections associated with Melanotan II.",
      "**Approved Clinical Track Record**: Clinically approved under the name Scenesse for treating severe light sensitivity disorders.",
      "**Natural, Long-Lasting Pigmentation**: Delivers smooth, even pigmentation that persists for weeks after research cycles conclude."
    ],
    "adverseObservations": [
      "**Mild Transient Nausea**: Occasional, mild nausea occurring 30–60 minutes after administration; administering before bedtime avoids this.",
      "**Darkening of Freckles & Moles**: Will darken existing freckles, beauty marks, and pigmentation spots; dermatological monitoring is recommended.",
      "**Facial Flushing**: Mild, brief flushing or warmth in the face shortly after injection.",
      "**Proper Titration**: Begin with micro-doses (250–500 mcg) to assess pigmentation response before advancing."
    ]
  },
  {
    "id": "melanotan-2",
    "compoundName": "Melanotan II",
    "handles": [
      "melanotan-2",
      "mt-2",
      "melanotan2"
    ],
    "subtitle": "Non-Selective Cyclic Lactam Melanocortin Agonist Pigmentation & Libido Standard",
    "longDescription": "**What it is:** Melanotan II (MT-2) is a synthetic cyclic lactam heptapeptide analogue of alpha-Melanocyte-Stimulating Hormone (alpha-MSH).\n\n**How it works:** Unlike Melanotan I, MT-2 is non-selective: it crosses the blood-brain barrier to bind to multiple melanocortin receptors, including MC1R (skin tanning), MC3R/MC4R (appetite suppression and metabolic regulation), and MC4R (sexual arousal and erectile response in the central nervous system).\n\n**Why researchers study it:** Studied for rapid, deep photoprotective skin tanning, treating erectile dysfunction and female sexual arousal disorder, and appetite suppression.",
    "category": "Photoprotection & Sexual Health",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "melanotan-2",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl in horizontal circular motions for 30 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store protected from direct sunlight."
    },
    "dosing": {
      "standardDoseDisplay": "250 mcg – 500 mcg every 2–3 days",
      "standardDoseMcg": 250,
      "cadence": "Every 2–3 Days (Pre-Bed SubQ)",
      "halfLife": "~1–2 Hours (Central MC3R/MC4R and peripheral MC1R activation with persistent multi-day effects)",
      "typicalProtocolDuration": "3 to 6 Weeks",
      "washoutPeriod": "4 to 8 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Micro Initiation",
          "timeframe": "Days 1–3",
          "doseDisplay": "100 mcg – 250 mcg pre-bed",
          "doseMcg": 250,
          "cadence": "1x Daily (Pre-Bed to blunt acute flush/nausea)",
          "focus": "Receptor acclimatization, central appetite suppression, and initial melanogenesis activation",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Maintenance",
          "timeframe": "Weeks 2–4",
          "doseDisplay": "250 mcg – 500 mcg every 2–3 days",
          "doseMcg": 250,
          "cadence": "Every 2 to 3 Days",
          "focus": "Sustained eumelanin pigmentation, libido enhancement, and metabolic rate stimulation",
          "notes": "5.0 to 10.0 units on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 5–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of persistent pigment retention and absence of hyperpigmented nevi",
          "notes": "Extended rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "100 mcg (Micro Initiation)",
          "doseMcg": 100,
          "volumeMl": 0.02,
          "syringeIU": 2,
          "tickLabel": "2.0 units (0.02 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "250 mcg (Standard Target)",
          "doseMcg": 250,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg (Full Target)",
          "doseMcg": 500,
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
    "molecularDetails": {
      "casNumber": "121062-08-6",
      "pubchemCid": 92432,
      "sequenceOrFormula": "Ac-cyclo[Nle4, Asp5, D-Phe7, Lys10]alpha-MSH-(4-10)-NH2",
      "molecularWeightGPerMol": 1024.18
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 11018622",
        "notes": "Dorr et al. Evaluation of melanotan-II, a superpotent cyclic melanotropic peptide, in a pilot phase-I clinical study."
      },
      {
        "sourceReference": "PubMed PMID: 17584130",
        "notes": "Wessells et al. Synthetic melanotropic peptide initiates erections in men with psychogenic erectile dysfunction."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Rapid, Deep Skin Tanning**: Dramatically accelerates eumelanin production for fast, dark skin tanning with minimal UV exposure.",
      "**Potent Central Sexual Arousal**: Strongly triggers MC4R pathways in the brain to stimulate spontaneous sexual arousal and robust erections.",
      "**Effective Appetite Suppression**: Activates central MC4R receptors in the hypothalamus, significantly reducing daily appetite and food cravings.",
      "**UV-Protective Melanin Production**: Shields dermal tissue from sunburn and cellular UV DNA damage."
    ],
    "adverseObservations": [
      "**Noticeable Nausea & Flushing**: Moderate nausea, facial flushing, and mild stomach queasiness are common for 1–2 hours post-dose; taking before sleep mitigates this.",
      "**Spontaneous Erections (Priapism Risk)**: Can cause strong, prolonged spontaneous erections; conservative micro-dosing is essential.",
      "**Mole and Freckle Darkening**: Darkens existing freckles and moles; subjects should track skin spots regularly.",
      "**Micro-Titration Rule**: Always initiate at a micro-dose (100–250 mcg) to gauge tolerance before escalating."
    ]
  },
  {
    "id": "pt-141",
    "compoundName": "PT-141",
    "handles": [
      "pt-141",
      "pt141",
      "bremelanotide",
      "vyleesi-component"
    ],
    "subtitle": "Central Melanocortin MC4R/MC1R Agonist Sexual Arousal & Libido Standard",
    "longDescription": "**What it is:** PT-141 (Bremelanotide) is a synthetic cyclic peptide derived from Melanotan II, specifically developed to treat sexual dysfunction without inducing skin pigmentation.\n\n**How it works:** Unlike PDE5 inhibitors (like Viagra) that only act locally on blood vessels in the genitals, PT-141 acts centrally in the brain. It crosses the blood-brain barrier to bind to Melanocortin-4 Receptors (MC4R) in the medial preoptic area and hypothalamus, activating natural neural pathways of sexual desire, arousal, and motivation in both men and women.\n\n**Why researchers study it:** Clinically approved and studied for hypoactive sexual desire disorder (HSDD) in premenopausal women, refractory erectile dysfunction in men, and boosting sexual intimacy.",
    "category": "Photoprotection & Sexual Health",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "pt-141",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 30 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store strictly refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "1.0 mg – 1.75 mg (As-needed, 45–60 min prior)",
      "standardDoseMcg": 1000,
      "cadence": "As-Needed (SubQ, maximum 2x per 7-day period)",
      "halfLife": "~2–3 Hours (Acts centrally in the medial preoptic area of the hypothalamus to stimulate dopamine release)",
      "typicalProtocolDuration": "As-Needed / Event-Driven Protocol",
      "washoutPeriod": "At least 72 Hours between administrations",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initial Calibration",
          "timeframe": "Initial Evaluation",
          "doseDisplay": "1.0 mg (1000 mcg)",
          "doseMcg": 1000,
          "cadence": "As-Needed (45–60 min prior)",
          "focus": "Central hypothalamic MC4R receptor activation without transient blood pressure elevation or nausea",
          "notes": "20.0 units (0.20 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Therapeutic Response",
          "timeframe": "Subsequent Trials",
          "doseDisplay": "1.5 mg – 1.75 mg",
          "doseMcg": 1750,
          "cadence": "As-Needed (max 2 doses/week)",
          "focus": "Peak medial preoptic dopamine efflux, subjective sexual desire enhancement, and autonomic arousal",
          "notes": "35.0 units (0.35 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Post-Administration",
          "doseDisplay": "Rest Window",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Minimum 72-hour rest window prevents melanocortin receptor desensitization",
          "notes": "Do not exceed 8 administrations in a 30-day window"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "20.0 units (0.20 mL)",
      "graduations": [
        {
          "doseDisplay": "1.00 mg (Standard Target)",
          "doseMcg": 1000,
          "volumeMl": 0.2,
          "syringeIU": 20,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.50 mg (Intermediate Target)",
          "doseMcg": 1500,
          "volumeMl": 0.3,
          "syringeIU": 30,
          "tickLabel": "30.0 units (0.30 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.75 mg (FDA Reference Target)",
          "doseMcg": 1750,
          "volumeMl": 0.35,
          "syringeIU": 35,
          "tickLabel": "35.0 units (0.35 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 30 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "189745-66-9",
      "pubchemCid": 9941379,
      "sequenceOrFormula": "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH",
      "molecularWeightGPerMol": 1025.18
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 31557088",
        "notes": "Kingsberg et al. Bremelanotide for the Treatment of Hypoactive Sexual Desire Disorder: Two Randomized, Phase 3 Trials (RECONNECT)."
      },
      {
        "sourceReference": "PubMed PMID: 14999221",
        "notes": "Diamond et al. Subcutaneous bremelanotide for the treatment of erectile dysfunction in men who failed PDE5 inhibitor therapy."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Central Brain-Mediated Sexual Desire**: Stimulates sexual desire and libido at the neurological level in the brain, rather than merely boosting local blood flow.",
      "**Effective for Both Men and Women**: Clinically proven to enhance sexual arousal, frequency of satisfying events, and orgasm intensity in both sexes.",
      "**Works Where PDE5 Inhibitors Fail**: Successfully restores erectile performance in men who do not respond to vascular medications (Viagra/Cialis).",
      "**Zero Direct Vascular Dilation**: Does not interact with nitric oxide pathways, avoiding systemic drops in blood pressure.",
      "**No Skin Tanning Effects**: Engineered specifically to minimize MC1R binding, eliminating tanning or skin darkening at recommended doses."
    ],
    "adverseObservations": [
      "**Transient Nausea & Stomach Queasiness**: The most common observation, occurring in ~30% of subjects within 30–60 minutes; pairing with anti-nausea protocols helps.",
      "**Temporary Blood Pressure Bump**: Can cause a transient, modest rise in blood pressure for 2–4 hours; monitor cardiovascular parameters.",
      "**Facial Flushing & Headache**: Mild facial warmth, brief headache, or nasal congestion post-administration.",
      "**Onset Timing Window**: Onset typically occurs within 2 to 4 hours post-subcutaneous injection and can remain active for 12 to 24 hours."
    ]
  },
  {
    "id": "kisspeptin-10",
    "compoundName": "Kisspeptin-10",
    "handles": [
      "kisspeptin-10",
      "kisspeptin",
      "kp-10"
    ],
    "subtitle": "GPR54 (KISS1R) Agonist Pulsatile Hypothalamic GnRH Secretion Standard",
    "longDescription": "**What it is:** Kisspeptin-10 is a natural 10-amino-acid peptide that represents the active functional core of kisspeptin, the master regulatory hormone of the human reproductive axis.\n\n**How it works:** In the brain, Kisspeptin-10 binds to GPR54 (KISS1R) receptors in the hypothalamus, directly triggering the pulsatile release of GnRH (Gonadotropin-Releasing Hormone). GnRH then prompts the pituitary gland to release Luteinizing Hormone (LH) and Follicle-Stimulating Hormone (FSH), which signal the body to produce natural testosterone, enhance fertility, and maintain endocrine balance without shutting down endogenous hormone glands.\n\n**Why researchers study it:** Studied for restoring natural hormone production during post-cycle recovery (PCT), boosting libido and mood, supporting fertility and sperm quality, and treating secondary hypogonadism.",
    "category": "Photoprotection & Sexual Health",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "kisspeptin-10",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl in horizontal circular motions for 30 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "100 mcg – 200 mcg daily or 3x weekly",
      "standardDoseMcg": 100,
      "cadence": "1x to 2x Daily (SubQ)",
      "halfLife": "~30 Minutes (Triggers immediate robust pulses of LH and FSH within 30–60 minutes)",
      "typicalProtocolDuration": "4 to 8 Weeks",
      "washoutPeriod": "4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "100 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily",
          "focus": "GPR54 receptor stimulation, pulsatile GnRH release without tachyphylaxis, and downstream LH elevation",
          "notes": "2.0 units (0.02 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Gonadotropic Pulsing",
          "timeframe": "Weeks 3–6",
          "doseDisplay": "100 mcg – 200 mcg daily (or 3x weekly)",
          "doseMcg": 200,
          "cadence": "1x Daily or 3x Weekly",
          "focus": "Leydig cell testosterone synthesis restoration, spermatogenesis maintenance, and ovulatory signaling assays",
          "notes": "4.0 units (0.04 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of endogenous hypothalamic-pituitary-gonadal (HPG) axis autonomy",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "2.0 units (0.02 mL)",
      "graduations": [
        {
          "doseDisplay": "100 mcg (Standard Target)",
          "doseMcg": 100,
          "volumeMl": 0.02,
          "syringeIU": 2,
          "tickLabel": "2.0 units (0.02 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "200 mcg (High Target)",
          "doseMcg": 200,
          "volumeMl": 0.04,
          "syringeIU": 4,
          "tickLabel": "4.0 units (0.04 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "374675-21-5",
      "pubchemCid": 25240297,
      "sequenceOrFormula": "Tyr-Asn-Trp-Asn-Ser-Phe-Gly-Leu-Arg-Phe-NH2 (YNWNSFGLRF-NH2)",
      "molecularWeightGPerMol": 1302.43
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 16174713",
        "notes": "Dhillo et al. Kisspeptin-10 stimulates luteinizing hormone and testosterone release in healthy men."
      },
      {
        "sourceReference": "PubMed PMID: 23153270",
        "notes": "George et al. Kisspeptin-10 stimulates a physiological pulse of luteinizing hormone in men with type 2 diabetes."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Stimulates Natural Testosterone Pulses**: Triggers natural LH and FSH release from the pituitary gland, prompting the body to produce its own natural testosterone.",
      "**Restores the Hypothalamic-Pituitary-Gonadal (HPG) Axis**: Widely researched in post-cycle recovery (PCT) models to restart natural hormone production after suppression.",
      "**Preserves Testicular Health & Size**: Because it stimulates endogenous gonadotropins rather than replacing testosterone directly, it prevents testicular shrinkage.",
      "**Enhances Libido & Mood**: Brain imaging research reveals that Kisspeptin-10 activates neural circuits responsible for sexual desire, romantic attraction, and positive mood.",
      "**Supports Fertility & Sperm Quality**: Documented to promote healthy sperm production and natural reproductive hormone signaling."
    ],
    "adverseObservations": [
      "**Temporary Facial Flushing**: A brief, warm flush or mild skin redness may occur shortly after administration due to temporary blood vessel relaxation.",
      "**Mild Headache**: Occasional mild headaches reported during peak LH hormone pulses; staying well-hydrated helps prevent this.",
      "**Injection Site Redness**: Mild, temporary redness or itching at the injection site that typically resolves within 30 to 60 minutes.",
      "**Receptor Desensitization Precautions**: Continuous, uninterrupted dosing can desensitize GPR54 receptors; intermittent schedules (2–3 times per week) are standard."
    ]
  },
  {
    "id": "oxytocin",
    "compoundName": "Oxytocin",
    "handles": [
      "oxytocin",
      "pitocin-component",
      "prosocial-peptide"
    ],
    "subtitle": "Nonapeptide Neurohypophysial Hormone Prosocial & Anxiolytic Standard",
    "longDescription": "**What it is:** Oxytocin is a natural 9-amino-acid neuropeptide hormone produced in the hypothalamus and stored in the posterior pituitary gland, famously known as the 'bonding and trust hormone.'\n\n**How it works:** In the central nervous system, Oxytocin acts as a powerful neuromodulator, dampening activity in the amygdala (the brain's fear and stress center) and boosting dopamine in social reward circuits. It promotes social bonding, deep empathy, trust, and emotional closeness, while also functioning in smooth muscle contraction and sexual climax.\n\n**Why researchers study it:** Studied for reducing social anxiety, autism spectrum social communication, healing emotional trauma and PTSD, enhancing marital intimacy, and reducing cortisol stress levels.",
    "category": "Photoprotection & Sexual Health",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "oxytocin",
    "reconstitution": {
      "defaultVialNetMg": 5,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP or Deionized Saline (Intranasal/SubQ)",
      "dissolutionMethod": "Add 2.5 mL diluent slowly down the glass wall. Swirl in horizontal circular motions for 30 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 2,
      "handlingRule": "Clear, colorless aqueous solution. Store strictly refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "100 mcg – 200 mcg (or 10–20 IU intranasal)",
      "standardDoseMcg": 100,
      "cadence": "1x to 2x Daily or As-Needed (SubQ or Intranasal)",
      "halfLife": "~3–5 Minutes in plasma (Central neurochemical effects in amygdala persist >2–3 hours)",
      "typicalProtocolDuration": "2 to 6 Weeks",
      "washoutPeriod": "2 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Days 1–7",
          "doseDisplay": "50 mcg – 100 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily (Morning or Event-Driven)",
          "focus": "Amygdala hyper-reactivity attenuation, cortisol suppression, and social trust/empathy enhancement",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 2.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Prosocial & Bonding",
          "timeframe": "Weeks 2–4",
          "doseDisplay": "100 mcg – 200 mcg daily",
          "doseMcg": 200,
          "cadence": "1x to 2x Daily",
          "focus": "Interpersonal attachment reinforcement, intimacy facilitation, and post-stress cardiovascular normalization",
          "notes": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 5–6",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of sustained social confidence and stress response equilibrium",
          "notes": "2-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "50 mcg (Micro Initiation)",
          "doseMcg": 50,
          "volumeMl": 0.025,
          "syringeIU": 2.5,
          "tickLabel": "2.5 units (0.025 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "100 mcg (Standard Target)",
          "doseMcg": 100,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "200 mcg (High Target)",
          "doseMcg": 200,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 21 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "50-56-6",
      "pubchemCid": 439302,
      "sequenceOrFormula": "Cys-Tyr-Ile-Gln-Asn-Cys-Pro-Leu-Gly-NH2 (Disulfide bridge Cys1-Cys6)",
      "molecularWeightGPerMol": 1007.19
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 15931222",
        "notes": "Kosfeld et al. Oxytocin increases trust in humans (Nature)."
      },
      {
        "sourceReference": "PubMed PMID: 16339042",
        "notes": "Kirsch et al. Oxytocin modulates neural circuitry for social cognition and fear in humans."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Reduces Social Anxiety & Fear Responses**: Calms hyperactive amygdala signaling, allowing subjects to feel relaxed, confident, and open in social settings.",
      "**Promotes Emotional Bonding & Trust**: Enhances feelings of affection, emotional warmth, pair bonding, and interpersonal connection.",
      "**Dampens Cortisol Stress Spikes**: Lowers systemic cortisol and sympathetic nervous system fight-or-flight responses under mental stress.",
      "**Enhances Sexual Climax & Orgasm Intensity**: Released naturally during orgasm, it deepens emotional satisfaction and physical climax intensity.",
      "**Assists in Autism & PTSD Research**: Researched for improving facial expression recognition, empathy, and social processing."
    ],
    "adverseObservations": [
      "**Dose-Dependent Emotional Sensitivity**: Can heighten emotional sensitivity or feelings of vulnerability in certain social environments.",
      "**Mild Headache or Drowsiness**: Occasional mild headache or relaxed drowsiness reported following administration.",
      "**Mild Blood Pressure Changes**: High doses can cause minor, temporary shifts in blood pressure.",
      "**Short Biological Half-Life**: Rapidly metabolized (half-life 3–5 minutes in blood); nasal spray or targeted subcutaneous timing is utilized."
    ]
  },
  {
    "id": "hmg-75iu",
    "compoundName": "HMG (Human Menopausal Gonadotropin 75 IU)",
    "handles": [
      "hmg-75iu",
      "hmg",
      "menotropins",
      "hmg-75iu-laboratory-handling"
    ],
    "subtitle": "Dual-Gonadotropin Standard (75 IU FSH + 75 IU LH Bioactivity) for Endocrine & Spermatogenic Pathway Studies",
    "longDescription": "**What it is:** Human Menopausal Gonadotropin (HMG / Menotropins) is a purified biological glycoprotein preparation standardized to contain equal biological activity of Follicle-Stimulating Hormone (FSH, 75 IU) and Luteinizing Hormone (LH, 75 IU). Both hormones are non-covalently linked heterodimers composed of a common 92-amino-acid alpha subunit non-covalently joined to hormone-specific beta subunits that confer specific receptor selectivity.\n\n**How it works:** Operates through dual, complementary endocrine mechanisms: The FSH fraction binds transmembrane FSH Receptors (FSHR) exclusively expressed on Sertoli cells, elevating intracellular cAMP to drive Androgen-Binding Protein (ABP) secretion, tight-junction maintenance, and the mitotic proliferation of spermatogonia. Concurrently, the LH fraction engages LH/Choriogonadotropin Receptors (LHCGR) on Leydig cells, activating the steroidogenic acute regulatory (StAR) pathway to sustain essential intratesticular testosterone (ITT) microenvironments. In contrast to hCG monotherapy (which activates only LH receptors), HMG provides necessary Sertoli cell stimulation to maintain complete germ cell maturation.\n\n**Why researchers study it:** Researched extensively in laboratory models of severe hypogonadotropic hypogonadism, reversal of suppressed spermatogenesis following exogenous androgenic saturation, preservation of Sertoli cell cytoarchitecture, and endocrine axis restoration.",
    "category": "Photoprotection & Sexual Health",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "hmg-75iu",
    "purityStandard": "Biological Activity Standard (75 IU FSH + 75 IU LH; Highly Purified Menotropins)",
    "reconstitution": {
      "defaultVialNetMg": 1,
      "defaultDiluentMl": 1,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol) or 0.9% Sodium Chloride USP",
      "dissolutionMethod": "Direct 1.0 mL diluent slowly down the inner glass vial wall. Allow natural liquid saturation, then swirl gently in horizontal circles for 30–45 seconds until optically clear. Avoid vigorous shaking.",
      "resultingConcentrationMgPerMl": 1,
      "handlingRule": "Clear, colorless aqueous solution. Store refrigerated at 2°C–8°C; use within 28 days if reconstituted with Bacteriostatic Water USP."
    },
    "dosing": {
      "standardDoseDisplay": "75 IU SubQ (2x–3x weekly)",
      "standardDoseMcg": 1000,
      "cadence": "2x to 3x Weekly (e.g. Mon / Wed / Fri SubQ)",
      "halfLife": "FSH beta-subunit clearance ~30–40 Hours; LH fraction distribution ~20–30 Minutes with terminal elimination ~4 Hours",
      "typicalProtocolDuration": "8 to 12 Weeks per analytical research block",
      "washoutPeriod": "4 Weeks between experimental cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Baseline Sertoli Cell & Receptor Priming",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "37.5 IU SubQ",
          "doseMcg": 500,
          "cadence": "3x Weekly (Mon/Wed/Fri)",
          "focus": "Evaluates receptor responsiveness, baseline gonadotropin priming, and estradiol response",
          "notes": "50.0 units (0.50 mL) on U-100 syringe at 75.0 IU/mL concentration"
        },
        {
          "stage": "Phase 2: Active Spermatogenic & Steroidogenic Induction",
          "timeframe": "Weeks 3–8",
          "doseDisplay": "75 IU SubQ",
          "doseMcg": 1000,
          "cadence": "2x to 3x Weekly (SubQ)",
          "focus": "Direct stimulation of Sertoli cell ABP secretion and active spermatogenesis",
          "notes": "100.0 units (1.00 mL) on U-100 syringe (full vial draw)"
        },
        {
          "stage": "Phase 3: High-Demand / Intensive Recovery Block",
          "timeframe": "Weeks 9–12",
          "doseDisplay": "75–150 IU SubQ",
          "doseMcg": 1500,
          "cadence": "3x Weekly",
          "focus": "Maximal germ cell maturation and Leydig/Sertoli dual signaling (often paired with hCG)",
          "notes": "Full vial or dual vial draw per scheduled session"
        },
        {
          "stage": "Phase 4: Endocrine Washout & Feedback Calibration",
          "timeframe": "Weeks 13+",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Endogenous pituitary gonadotropin autonomy verification",
          "notes": "4-week cessation window to assess natural HPTA axis recovery"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "100.0 units (1.00 mL)",
      "graduations": [
        {
          "doseDisplay": "25 IU (Low Calibration)",
          "doseMcg": 333,
          "volumeMl": 0.333,
          "syringeIU": 33.3,
          "tickLabel": "33.3 units (0.33 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "37.5 IU (Half-Vial Induction)",
          "doseMcg": 500,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "75 IU (Full Vial Target)",
          "doseMcg": 1000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "100.0 units (1.00 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "2°C–8°C refrigerated or -20°C in dry desiccator (24 months shelf-life)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days with Bacteriostatic Water USP",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "61489-71-2",
      "pubchemCid": 135331145,
      "sequenceOrFormula": "Purified Human Menotropins (FSH: 203 amino acids; LH: 213 amino acids; sharing alpha subunit)",
      "molecularWeightGPerMol": 30000
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 15713823",
        "notes": "Rastrelli et al. Recombinant LH versus human menopausal gonadotropin in gonadal stimulation."
      },
      {
        "sourceReference": "PubMed PMID: 10465691",
        "notes": "Schill WB. Treatment of male infertility with gonadotropins: HCG/HMG therapy in hypogonadotropic hypogonadism."
      },
      {
        "sourceReference": "PubMed PMID: 24344364",
        "notes": "Fraietta et al. Hypogonadotropic hypogonadism revisited: management with gonadotropins and GnRH."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Direct FSH Receptor Stimulation on Sertoli Cells**: Restores androgen-binding protein (ABP) synthesis and active spermatogenesis in preclinical models.",
      "**Dual LH Bioactivity for Intratesticular Testosterone**: Stimulates Leydig cell steroidogenesis while avoiding selective downregulation.",
      "**Preserves Testicular Cytoarchitecture**: Maintains blood-testis barrier integrity and tubular basement membrane health.",
      "**Complements Incomplete LH-Only Mimetic Regimens**: Supplies indispensable FSH signaling that hCG alone cannot stimulate.",
      "**Research Standard for Hypogonadotropic Signaling**: Widely referenced benchmark for endocrine and reproductive axis research."
    ],
    "adverseObservations": [
      "**Transient Local Erythema**: Mild, transient redness or sensitivity at injection site resolving within 15–30 minutes.",
      "**Dose-Dependent Aromatase Induction**: Requires baseline estradiol and hormonal balance monitoring in research protocols.",
      "**Quaternary Protein Fragility**: High-molecular-weight glycoprotein heterodimer; avoid violent vortexing or freeze-thaw cycles.",
      "**Storage Protocol**: Keep refrigerated at 2°C–8°C; protect from prolonged UV/light exposure."
    ],
    "calculator": {
      "enabled": true,
      "title": "HMG Reconstitution & Volumetric Calculator",
      "defaultCompoundMass": "75",
      "compoundMassUnit": "IU",
      "defaultFinalVolumeMl": "1",
      "defaultTargetAmount": "37.5",
      "targetAmountUnit": "IU",
      "iuPerMg": 75,
      "deviceVolumeMl": "1",
      "deviceLabel": "U-100 Syringe (mL)",
      "roundingPrecision": 2,
      "instructions": "Calibrated for 75 IU vial reconstituted with 1.0 mL Bacteriostatic Water USP (75.0 IU/mL; 50 units = 37.5 IU, 100 units = 75 IU)."
    }
  },
  {
    "id": "hcg",
    "compoundName": "HCG",
    "handles": [
      "hcg",
      "hcg-10000iu",
      "human-chorionic-gonadotropin",
      "pregnyl"
    ],
    "subtitle": "Human Chorionic Gonadotropin (10,000 IU) Luteinizing Hormone Receptor Agonist Standard",
    "longDescription": "**What it is:** HCG (Human Chorionic Gonadotropin) is a heterodimeric glycoprotein hormone composed of 237 amino acids across two non-covalently linked alpha and beta subunits, sharing structural homology with native pituitary Luteinizing Hormone (LH).\n\n**How it works:** HCG binds directly to the shared LH/choriogonadotropin receptor (LHCGR) on testicular Leydig cells in males and ovarian theca/granulosa cells in females. In males, it stimulates cyclic AMP and cholesterol desmolase (CYP11A1), driving intratesticular testosterone synthesis and maintaining spermatogenesis during gonadotropin suppression. Its biological half-life (~24–36 hours) is substantially longer than native LH (~20 minutes), providing steady physiological stimulation.\n\n**Why researchers study it:** Studied for post-cycle endocrine recovery, preserving testicular trophism and spermatogenesis during TRT, male hypogonadism research, fertility optimization, and neurosteroid pathway support.",
    "category": "Photoprotection & Sexual Health",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "hcg",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down inner vial wall. Swirl gently horizontally for 30 seconds until clear. Avoid shaking.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "250 IU – 500 IU (2x to 3x weekly)",
      "standardDoseMcg": 250,
      "cadence": "2x to 3x Weekly (SubQ)",
      "halfLife": "24–36 Hours (Extended biological activity compared to native LH)",
      "typicalProtocolDuration": "6 to 12 Weeks",
      "washoutPeriod": "4 Weeks between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Leydig Cell Priming",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "250 IU (2x weekly)",
          "doseMcg": 250,
          "cadence": "2x Weekly (Every 3.5 Days SubQ)",
          "focus": "Initial LHCGR receptor engagement and intratesticular steroidogenesis reactivation",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 5,000 IU/mL concentration"
        },
        {
          "stage": "Phase 2: Target Endocrine Maintenance",
          "timeframe": "Weeks 3–10",
          "doseDisplay": "250 IU – 500 IU (2x to 3x weekly)",
          "doseMcg": 500,
          "cadence": "2x to 3x Weekly SubQ",
          "focus": "Spermatogenesis maintenance, normal testicular volume preservation, and neurosteroid synthesis",
          "notes": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 11–12",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Monitoring endogenous pituitary LH/FSH pulse recovery without exogenous support",
          "notes": "4-week wash-out window"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "250 IU (Standard Dose)",
          "doseMcg": 250,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 IU (Higher Dose)",
          "doseMcg": 500,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1,000 IU (Clinical Assay Dose)",
          "doseMcg": 1000,
          "volumeMl": 0.2,
          "syringeIU": 20,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 30 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "9002-61-3",
      "molecularWeightGPerMol": 36700
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 15713727",
        "notes": "Coviello et al. Intratesticular testosterone is restored by low-dose human chorionic gonadotropin in normal men with gonadotropin suppression."
      },
      {
        "sourceReference": "PubMed PMID: 23260860",
        "notes": "Hsieh et al. Concomitant intramuscular human chorionic gonadotropin preserves spermatogenesis in men undergoing testosterone replacement therapy."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Direct LHCGR Leydig Cell Stimulation**: Reactivates intratesticular testosterone synthesis without requiring pituitary LH secretion.",
      "**Preserves Testicular Volume & Trophism**: Prevents testicular atrophy and morphological regression during endocrine suppression.",
      "**Spermatogenesis Support**: Sustains high localized intratesticular androgen levels required for healthy sperm maturation.",
      "**Neurosteroid Precursor Activation**: Stimulates conversion of cholesterol to pregnenolone, supporting downstream DHEA and neurosteroids.",
      "**Reliable Clinical Pharmacokinetics**: 24–36 hour biological half-life enables steady receptor engagement with twice-weekly schedules."
    ],
    "adverseObservations": [
      "**Aromatase Upregulation at High Doses**: Excessive dosing (>1,000 IU per injection) can stimulate intratesticular aromatase, elevating estradiol.",
      "**Downregulation from Chronic Overdosing**: Massive continuous doses can desensitize Leydig LHCGR receptors; conservative physiological dosing is optimal.",
      "**Strict Cold Storage**: Reconstituted solution must be kept continuously refrigerated at 2°C–8°C to prevent peptide bond cleavage."
    ],
    "calculator": {
      "enabled": true,
      "title": "HCG Reconstitution & Volumetric Calculator",
      "defaultCompoundMass": "10000",
      "compoundMassUnit": "IU",
      "defaultFinalVolumeMl": "2",
      "defaultTargetAmount": "250",
      "targetAmountUnit": "IU",
      "iuPerMg": 1000,
      "deviceVolumeMl": "1",
      "deviceLabel": "U-100 Syringe (mL)",
      "roundingPrecision": 2,
      "instructions": "Calibrated for 10,000 IU vial reconstituted with 2.0 mL Bacteriostatic Water USP (5,000 IU/mL; 5 units = 250 IU, 10 units = 500 IU)."
    }
  }
]
