import type { CompoundAnalyticalProtocol } from "./types.ts"

/**
 * CATEGORY 8: Laboratory Supplies, Diluents & Storage Labware
 * 
 * Peer-reviewed laboratory handling, aseptic protocols, material specifications,
 * and standard operating procedures (SOPs) for non-peptide research consumables.
 * Grounded in /Users/m5/Projects/Peptides/scripts/template_engine/data/*.json.
 */
export const CATEGORY_8_SUPPLIES_PROTOCOLS: CompoundAnalyticalProtocol[] = [
  // -------------------------------------------------------------------------
  // 1. Bacteriostatic Water 10 mL USP
  // -------------------------------------------------------------------------
  {
    id: "bacteriostatic-water",
    compoundName: "Bacteriostatic Water 10 mL USP",
    handles: ["bacteriostatic-water", "bac-water", "bac-water-10ml", "bacteriostatic-water-10ml"],
    subtitle: "Multi-Dose Sterile Preserved Reconstitution Diluent",
    longDescription:
      "Bacteriostatic Water for Injection USP is a sterile, non-pyrogenic aqueous solvent containing 0.9% (9 mg/mL) benzyl alcohol NF as an antimicrobial preservative. Formulated specifically for multi-dose reconstitution and dilution of lyophilized research peptides and proteins, it inhibits microbiological proliferation upon repeated aseptic septum punctures. The solution is prepared with high-purity water for injection, filtered through a 0.22 µm membrane, and packaged in neutral Type I borosilicate glass vials to maintain physicochemical stability and prevent alkaline leaching over standard 28-day laboratory research protocols.",
    category: "Laboratory Supplies",
    catalogStatus: "in_catalog",
    storeProductHandle: "bacteriostatic-water",
    purityStandard: "USP Sterile Standard (SWFI · 0.9% Benzyl Alcohol NF)",
    isSupply: true,
    supplyGuide: {
      physicalState: "Aqueous Sterile Diluent Solution",
      sterilityStandard: "0.22 µm Membrane Filtered · Non-Pyrogenic · USP",
      material: "Type I USP Borosilicate Glass Vial",
      specs: {
        "Preservative": "0.9% (9 mg/mL) Benzyl Alcohol NF",
        "Base Solvent": "Sterile Water for Injection USP (SWFI)",
        "Osmolarity & pH": "305 mOsmol/L (Isotonic) · pH 4.5 – 7.0",
        "Closure System": "20mm Chlorobutyl Rubber Septum & Aluminum Flip-Cap",
        "Container Volume": "10 mL Multi-Dose Borosilicate Vial",
        "Endotoxin Limit": "< 0.25 EU/mL (USP Non-Pyrogenic)",
      },
      protocolSteps: [
        {
          stepNumber: 1,
          title: "Aseptic Septum Preparation",
          instruction: "Firmly sanitize the rubber stopper with a sterile 70% isopropyl alcohol swab and allow to air dry completely.",
        },
        {
          stepNumber: 2,
          title: "Atmospheric Equalization",
          instruction: "Draw the exact target diluent volume of air into a sterile syringe prior to inserting the needle through the septum.",
        },
        {
          stepNumber: 3,
          title: "Smooth Solvent Withdrawal",
          instruction: "Invert the vial, inject equalizing air into the headspace, and smoothly withdraw the measured volume of diluent.",
        },
        {
          stepNumber: 4,
          title: "Multi-Dose Refrigerated Storage",
          instruction: "Store punctured vial at 2°C–8°C refrigerated. Preservative provides microbial protection for 28 days post-piercing.",
        },
      ],
      features: [
        {
          title: "0.9% Benzyl Alcohol Preserved",
          desc: "Bacteriostatic agent halts microbiological proliferation, permitting safe repeated withdrawals over a full 28-day research cycle.",
        },
        {
          title: "Type I Borosilicate Glass",
          desc: "Pharmaceutical-grade neutral glass prevents alkali leaching, preserving solution pH and peptide chemical stability.",
        },
        {
          title: "Self-Sealing Butyl Septum",
          desc: "High-integrity elastomeric stopper reseals instantly upon needle retraction without coring, particulate shedding, or vacuum loss.",
        },
        {
          title: "USP Sterile & Non-Pyrogenic",
          desc: "Endotoxin-tested water for injection ensures pure, uncompromised solvation for sensitive molecular binding and analytical assays.",
        },
      ],
      inclusions: [
        ["1x 10 mL Borosilicate Vial", "Type I USP Glass Vial with 0.9% Benzyl Alcohol SWFI"],
        ["1x Chlorobutyl Stopper", "Self-Sealing 20mm Piercing Septum with Flip-Off Cap"],
      ],
    },
    reconstitution: {
      defaultVialNetMg: 0,
      defaultDiluentMl: 10.0,
      solvent: "Sterile Water for Injection USP (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Aseptic solvent ready for transfer. Direct slowly against lyophilized powder vial walls.",
      resultingConcentrationMgPerMl: 0,
      handlingRule: "Inspect for clarity before withdrawal. Discard after 28 days post initial septum puncture.",
    },
    dosing: {
      standardDoseDisplay: "Solvent Diluent Standard",
      standardDoseMcg: 0,
      cadence: "As required per compound reconstitution stoichiometry",
      halfLife: "Stable 28 days refrigerated post puncture",
      typicalProtocolDuration: "Multi-Dose Laboratory Use",
      washoutPeriod: "N/A",
      titrationSteps: [
        {
          stage: "Standard Dilution",
          timeframe: "Immediate",
          doseDisplay: "1.0 mL – 5.0 mL Solvent",
          doseMcg: 0,
          cadence: "As required",
          focus: "Volumetric reconstitution",
          notes: "Aseptic technique required",
        },
        {
          stage: "Multi-Dose Phase",
          timeframe: "Days 1–28",
          doseDisplay: "Refrigerated 2°C–8°C",
          doseMcg: 0,
          cadence: "As required",
          focus: "Preserved integrity",
          notes: "Store upright",
        },
        {
          stage: "Retirement",
          timeframe: "Day 29+",
          doseDisplay: "Discard after 28 days",
          doseMcg: 0,
          cadence: "Cycle completion",
          focus: "Microbial protection limit",
          notes: "GLP stability window standard",
        },
      ],
    },
    syringeGuide: {
      syringeType: "Sterile Large-Volume Reconstitution Syringe (3cc – 5cc)",
      standardIUDisplay: "Volumetric Diluent (mL)",
      graduations: [
        {
          doseDisplay: "1.0 mL Diluent",
          doseMcg: 0,
          volumeMl: 1.0,
          syringeIU: 100,
          tickLabel: "1.0 mL solvent transfer",
        },
        {
          doseDisplay: "2.0 mL Diluent",
          doseMcg: 0,
          volumeMl: 2.0,
          syringeIU: 200,
          tickLabel: "2.0 mL standard reconstitution volume",
        },
        {
          doseDisplay: "3.0 mL Diluent",
          doseMcg: 0,
          volumeMl: 3.0,
          syringeIU: 300,
          tickLabel: "3.0 mL large-volume solvent transfer",
        },
      ],
    },
    storage: {
      lyophilized: "Store unpunctured vials at 15°C–30°C controlled room temperature.",
      reconstituted: "Store punctured vial at 2°C–8°C refrigerated; use within 28 days.",
      lightProtection: false,
    },
    citations: [
      {
        sourceReference: "GLP Laboratory Handling Guidelines — Sterile & Aseptic Preparations",
        notes: "Establishes sterility, multi-dose vial puncture standards, and 28-day beyond-use dating (BUD).",
      },
      {
        sourceReference: "United States Pharmacopeia: Bacteriostatic Water for Injection Monograph",
        notes: "Specifies 0.9% benzyl alcohol content, pH limits (4.5–7.0), and non-pyrogenic endotoxin thresholds.",
      },
    ],
    disclaimer: "Synthesized strictly for in-vitro laboratory research, analytical dilution, and scientific evaluation. Not for direct human or veterinary administration without secondary pharmaceutical preparation.",
  },

  // -------------------------------------------------------------------------
  // 2. Peptide Reconstitution Set
  // -------------------------------------------------------------------------
  {
    id: "peptide-reconstitution-set",
    compoundName: "Peptide Reconstitution Set",
    handles: ["peptide-reconstitution-set", "reconstitution-set", "reconstitution-kit"],
    subtitle: "Aseptic Peptide Preparation & Volumetric Transfer Kit",
    longDescription:
      "The Peptide Reconstitution Set is a consolidated laboratory consumable kit engineered for sterile reconstitution, precision volumetric dilution, and controlled transfer of lyophilized research compounds. The kit integrates ultra-clear U-100 insulin syringes with low dead-space needle hubs, a high-volume 5cc diluent syringe for initial solvent addition, and individual 70% isopropyl prep pads, ensuring GLP compliant aseptic protocol execution without external particulate contamination.",
    category: "Laboratory Supplies",
    catalogStatus: "in_catalog",
    storeProductHandle: "peptide-reconstitution-set",
    purityStandard: "ETO Sterilized · Individually Blister-Packed",
    isSupply: true,
    supplyGuide: {
      isHardware: true,
      physicalState: "Sterile Consumables & Volumetric Transfer Kit",
      sterilityStandard: "ETO Sterilized · Medical-Grade Blister Packaging",
      material: "Medical-Grade Polypropylene & Chlorobutyl Rubber",
      specs: {
        "SubQ Syringes": "6x 1cc (1.0 mL) Sterile U-100 Syringes (29G–31G)",
        "Transfer Syringe": "1x 5cc (5.0 mL) Sterile Diluent Syringe",
        "Antiseptic Swabs": "10x Sterile 70% Isopropyl Alcohol Pads",
        "Dead Space": "Ultra-Low Dead-Space Needle Hub Design",
        "Packaging": "Individually Sealed Hermetic Blister Packs",
        "Intended Use": "Controlled Laboratory Reconstitution & Transfer",
      },
      protocolSteps: [
        {
          stepNumber: 1,
          title: "Aseptic Septum Sanitization",
          instruction: "Wipe the rubber stoppers of both diluent and lyophilized peptide vials with 70% isopropyl prep pads and allow to air dry.",
        },
        {
          stepNumber: 2,
          title: "Precise Diluent Withdrawal",
          instruction: "Attach transfer needle to the 5cc syringe, smoothly draw measured diluent volume, and expel residual air bubbles.",
        },
        {
          stepNumber: 3,
          title: "Slow Wall-Directed Injection",
          instruction: "Insert needle through vial septum and angle solvent stream against the glass wall to protect peptide tertiary structure.",
        },
        {
          stepNumber: 4,
          title: "Complete Dissolution & Storage",
          instruction: "Swirl vial gently in slow horizontal circles until fully dissolved. Store reconstituted solution at 2°C–8°C.",
        },
      ],
      features: [
        {
          title: "Complete Preparation Consumables Kit",
          desc: "Consolidates all essential laboratory consumables needed for accurate peptide reconstitution in a single sterile kit.",
        },
        {
          title: "Individually Blister-Packed Sterility",
          desc: "Each syringe and antiseptic swab is sealed in medical-grade blister packaging to eliminate particulate contamination.",
        },
        {
          title: "High-Precision Volumetric Graduation",
          desc: "Ultra-clear barrel markings with bold graduation lines ensure exact stoichiometric diluent measurement and transfer.",
        },
        {
          title: "Low Dead-Space Needle Design",
          desc: "Minimizes residual fluid holdup within the hub, preserving precious research solutions and reducing compound waste.",
        },
      ],
      inclusions: [
        ["6x 1cc Sterile SubQ Syringes", "Precision U-100 Low Dead-Space Laboratory Syringes"],
        ["1x 5cc Reconstitution Syringe", "Calibrated Large-Volume Solvent Transfer Syringe"],
        ["10x Sterile Alcohol Prep Pads", "Individually Sealed 70% Isopropyl Antiseptic Swabs"],
        ["1x Sterile Blister Packaging", "Medical-Grade Hermetic Seal for Contamination-Free Storage"],
        ["1x Reconstitution Protocol Guide", "Standard Laboratory Volumetric Reference & Dilution Chart"],
      ],
    },
    reconstitution: {
      defaultVialNetMg: 0,
      defaultDiluentMl: 0,
      solvent: "Compatible with Bacteriostatic Water USP & Sterile Saline",
      dissolutionMethod: "Hardware and consumables accessory kit. Follow 4-step aseptic technique.",
      resultingConcentrationMgPerMl: 0,
      handlingRule: "Do not touch exposed needle shafts or rubber stoppers post-sanitization.",
    },
    dosing: {
      standardDoseDisplay: "Consumables Accessory Standard",
      standardDoseMcg: 0,
      cadence: "Single-use sterile disposal per transfer protocol",
      halfLife: "Individually sealed sterile shelf life 36 months",
      typicalProtocolDuration: "Single Protocol Execution",
      washoutPeriod: "N/A",
      titrationSteps: [
        {
          stage: "Preparation",
          timeframe: "Step 1",
          doseDisplay: "Aseptic Sanitization",
          doseMcg: 0,
          cadence: "Prior to transfer",
          focus: "Contamination prevention",
          notes: "Use 70% IPA pads",
        },
        {
          stage: "Transfer",
          timeframe: "Step 2",
          doseDisplay: "Diluent Reconstitution",
          doseMcg: 0,
          cadence: "Volumetric transfer",
          focus: "Stoichiometric accuracy",
          notes: "5cc transfer syringe",
        },
        {
          stage: "Assay Execution",
          timeframe: "Step 3",
          doseDisplay: "Precision Aliquot Dispensing",
          doseMcg: 0,
          cadence: "Study dependent",
          focus: "Low dead-space delivery",
          notes: "1cc U-100 syringes",
        },
      ],
    },
    syringeGuide: {
      syringeType: "Low Dead-Space U-100 Syringes & 5cc Transfer Syringe",
      standardIUDisplay: "Graduated Units & Milliliters",
      graduations: [
        {
          doseDisplay: "1.0 mL Barrel",
          doseMcg: 0,
          volumeMl: 1.0,
          syringeIU: 100,
          tickLabel: "100 Units (U-100)",
        },
        {
          doseDisplay: "5.0 mL Barrel",
          doseMcg: 0,
          volumeMl: 5.0,
          syringeIU: 500,
          tickLabel: "5.0 mL transfer volume",
        },
      ],
    },
    storage: {
      lyophilized: "Store blister packs at 15°C–30°C in dry environment away from direct sunlight.",
      reconstituted: "Single-use disposable consumables. Dispose in puncture-resistant biohazard sharps container.",
      lightProtection: false,
    },
    citations: [
      {
        sourceReference: "ISO 7886-1: Sterile Hypodermic Syringes for Single Use",
        notes: "International standard for volumetric accuracy, dead space limits, and biocompatibility.",
      },
      {
        sourceReference: "GLP Clean-Bench Aseptic Handling Guidelines",
        notes: "Standards for sterile syringe handling and surface sanitization with 70% isopropanol.",
      },
    ],
    disclaimer: "Manufactured for laboratory and analytical research purposes. Single-use only. Do not reuse needles or syringes.",
  },

  // -------------------------------------------------------------------------
  // 3. Reusable Metal Insulin Pen
  // -------------------------------------------------------------------------
  {
    id: "reusable-metal-insulin-pen",
    compoundName: "Reusable Metal Insulin Pen",
    handles: ["reusable-metal-insulin-pen", "insulin-pen", "metal-insulin-pen"],
    subtitle: "High-Accuracy Reusable Volumetric Dispensing Pen",
    longDescription:
      "The Reusable Metal Insulin Pen is an ultra-precise dispensing instrument engineered from aviation-grade anodized aluminum alloy for consistent, micrometric micro-volume fluid administration. Equipped with a dual-direction ratcheting selector mechanism with tactile and audible clicks at each 0.01 mL (1 Unit) increment, it accommodates standard 3.0 mL liquid cartridges and universal disposable 29G–32G pen needles, reducing volumetric dosing variance in high-frequency laboratory research protocols.",
    category: "Laboratory Supplies",
    catalogStatus: "in_catalog",
    storeProductHandle: "reusable-metal-insulin-pen",
    purityStandard: "Precision Machined · Autoclavable / Wipeable Labware",
    isSupply: true,
    supplyGuide: {
      isHardware: true,
      physicalState: "Precision Mechanical Dispensing Instrument",
      sterilityStandard: "Wipeable / Autoclavable Anodized Metallic Housing",
      material: "Aviation-Grade Anodized Aluminum Alloy",
      specs: {
        "Construction": "Aviation-Grade Anodized Aluminum Alloy",
        "Cartridge Specification": "Standard 3.0 mL Liquid Cartridge Chamber",
        "Dosing Increment": "0.01 mL (1 Unit) Micro-Click Increments",
        "Needle Compatibility": "Universal 29G–32G Standard Pen Needles",
        "Dial Calibration": "Dual-Direction Dial Mechanism with Audible Click",
        "Disinfection": "Heavy-Duty Autoclavable / Wipeable Metallic Body",
      },
      protocolSteps: [
        {
          stepNumber: 1,
          title: "Cartridge Loading",
          instruction: "Unscrew pen barrel, reset internal threaded plunger rod, insert 3.0 mL cartridge, and screw barrel firmly closed.",
        },
        {
          stepNumber: 2,
          title: "Needle Attachment",
          instruction: "Peel protective seal from standard pen needle, screw firmly onto cartridge hub, and remove outer and inner protective caps.",
        },
        {
          stepNumber: 3,
          title: "Priming & Air Clearing",
          instruction: "Dial 1–2 test units, hold pen vertically with needle upright, and depress push-button until liquid droplet emerges.",
        },
        {
          stepNumber: 4,
          title: "Dose Dialing & Dispensing",
          instruction: "Dial target micro-dose using clicking selector. Depress push-button completely and hold for 5 seconds for full dispersion.",
        },
      ],
      features: [
        {
          title: "Aerospace-Grade Aluminum Casing",
          desc: "Engineered from precision-machined aluminum alloy providing extreme mechanical rigidity, drop resistance, and thermal stability.",
        },
        {
          title: "Micrometric Click-Dose Mechanism",
          desc: "Audible and tactile unit-by-unit ratcheting selector enables foolproof volumetric repeatability down to 0.01 mL.",
        },
        {
          title: "Universal Cartridge Compatibility",
          desc: "Accepts standard 3.0 mL research cartridges and commercially standardized disposable ultra-fine pen needles.",
        },
        {
          title: "Smooth Low-Force Actuation",
          desc: "Internal helical drive reduction gear requires minimal thumb pressure, preventing needle tremor during transfers.",
        },
      ],
      inclusions: [
        ["1x Reusable Metal Insulin Pen", "Anodized Aerospace Aluminum Body with Precision Dial"],
        ["1x 3.0 mL Reusable Glass Cartridge", "Type I Borosilicate Cartridge with Plunger & Septum"],
        ["1x Hard Protective Carrying Case", "Moulded Shock-Absorbent Laboratory Storage Case"],
        ["1x Cartridge Adapter Sleeve", "High-Precision Threaded Housing Assembly"],
        ["1x Calibration & Instruction Manual", "Complete Dial Reference, Priming Guide & Maintenance SOP"],
      ],
    },
    reconstitution: {
      defaultVialNetMg: 0,
      defaultDiluentMl: 0,
      solvent: "Compatible with Standard 3.0 mL Borosilicate Cartridges",
      dissolutionMethod: "Mechanical dispensing instrument. Load prepared 3.0 mL solution cartridge.",
      resultingConcentrationMgPerMl: 0,
      handlingRule: "Prime 1–2 units prior to each study session to ensure fluid continuity.",
    },
    dosing: {
      standardDoseDisplay: "0.01 mL (1 Unit) Micro-Click Increments",
      standardDoseMcg: 0,
      cadence: "Repeatable micro-dosing per research schedule",
      halfLife: "Instrument lifecycle: 5+ years laboratory service",
      typicalProtocolDuration: "Continuous Laboratory Deployment",
      washoutPeriod: "N/A",
      titrationSteps: [
        {
          stage: "Cartridge Priming",
          timeframe: "Pre-Trial",
          doseDisplay: "1–2 Units Air Purge",
          doseMcg: 0,
          cadence: "Initial setup",
          focus: "Eliminate fluid void",
          notes: "Needle vertical",
        },
        {
          stage: "Micro-Dose Dialing",
          timeframe: "Experimental",
          doseDisplay: "1 to 60 Units (0.01–0.60 mL)",
          doseMcg: 0,
          cadence: "Protocol cadence",
          focus: "High-precision volumetric release",
          notes: "Hold 5 seconds after click",
        },
        {
          stage: "Maintenance & Sanitization",
          timeframe: "Post-Trial",
          doseDisplay: "Clean with 70% IPA",
          doseMcg: 0,
          cadence: "Between cycles",
          focus: "Mechanical longevity",
          notes: "Store in hard case",
        },
      ],
    },
    syringeGuide: {
      syringeType: "Standard Pen Needle Hub (29G–32G)",
      standardIUDisplay: "1 Unit Click (0.01 mL)",
      graduations: [
        {
          doseDisplay: "1 Unit (0.01 mL)",
          doseMcg: 0,
          volumeMl: 0.01,
          syringeIU: 1.0,
          tickLabel: "1 click on dial",
        },
        {
          doseDisplay: "5 Units (0.05 mL)",
          doseMcg: 0,
          volumeMl: 0.05,
          syringeIU: 5.0,
          tickLabel: "5 clicks on dial",
        },
        {
          doseDisplay: "10 Units (0.10 mL)",
          doseMcg: 0,
          volumeMl: 0.10,
          syringeIU: 10.0,
          tickLabel: "10 clicks on dial",
        },
      ],
    },
    storage: {
      lyophilized: "Store clean pen at 15°C–30°C in provided protective carrying case.",
      reconstituted: "Store loaded cartridges at 2°C–8°C refrigerated; remove needle after each dispensing cycle.",
      lightProtection: true,
    },
    citations: [
      {
        sourceReference: "ISO 11608-1: Needle-based Injection Systems for Medical Use",
        notes: "International standard for dose accuracy and volumetric delivery repeatability in pen injectors.",
      },
    ],
    disclaimer: "Precision laboratory instrument intended strictly for analytical research and in-vitro fluid dispensing.",
  },

  // -------------------------------------------------------------------------
  // 4. 50-Slot Vial Organizer Box
  // -------------------------------------------------------------------------
  {
    id: "50-slot-vial-organizer-box",
    compoundName: "50-Slot Vial Organizer Box",
    handles: ["50-slot-vial-organizer-box", "50-slot-vial-box", "vial-organizer-50"],
    subtitle: "Heavy-Duty Medical Vial Storage & Refrigerator Organizer",
    longDescription:
      "The 50-Slot Vial Organizer Box is an impact-resistant cryo-grade labware container designed to safely organize, catalog, and protect up to fifty 2.0 mL to 3.0 mL research vials in ultra-low temperature and refrigerated laboratory environments. Molded with an integrated 10x5 alphanumeric coordinate grid (A–E, 1–10) and secured by heavy-duty dual snap-lock latches, it withstands thermal cycling from -80°C deep freezing to +121°C autoclave cycles without polymer embrittlement or dimensional warping.",
    category: "Laboratory Supplies",
    catalogStatus: "in_catalog",
    storeProductHandle: "50-slot-vial-organizer-box",
    purityStandard: "Cryo-Grade Autoclavable Polymer (-80°C to +121°C)",
    isSupply: true,
    supplyGuide: {
      isHardware: true,
      physicalState: "Cryogenic Storage & Sample Management Labware",
      sterilityStandard: "Autoclavable at 121°C · Cryo-Stable at -80°C",
      material: "High-Density Impact-Resistant Cryo Polymer",
      specs: {
        "Capacity": "50 Standard Laboratory Vials (2.0 mL – 3.0 mL)",
        "Grid Matrix": "10 x 5 Alphanumerically Indexed Compartments (A–E, 1–10)",
        "Temperature Range": "-80°C Deep Freeze to +121°C Autoclave Safe",
        "Closure Mechanism": "Reinforced Dual Snap-Lock Latches & Hinged Lid",
        "Stackability": "Interlocking Base & Lid Ribs for Non-Slip Freezer Stacking",
        "Chemical Resistance": "Resistant to Alcohols, Solvents & Cleaning Agents",
      },
      protocolSteps: [
        {
          stepNumber: 1,
          title: "Alphanumeric Inventory Indexing",
          instruction: "Utilize row (A–E) and column (1–10) coordinates to log vial lot numbers, compounds, and reconstitution dates.",
        },
        {
          stepNumber: 2,
          title: "Vertical Vial Insertion",
          instruction: "Insert vials upright into snug-fit grid slots to prevent liquid pooling against chlorobutyl rubber stoppers.",
        },
        {
          stepNumber: 3,
          title: "Secure Latch Engagement",
          instruction: "Close hinged lid and depress front snap latches until audible dual-clicks confirm airtight, dustproof sealing.",
        },
        {
          stepNumber: 4,
          title: "Laboratory Storage Management",
          instruction: "Place organizer into refrigerator (2°C–8°C) or ultra-low temperature freezer (-20°C / -80°C) without risk of cracking.",
        },
      ],
      features: [
        {
          title: "50-Slot High-Density Grid Matrix",
          desc: "Maximizes freezer space while securely isolating up to 50 individual research vials against impact and rattling.",
        },
        {
          title: "Alphanumeric Location Indexing",
          desc: "Laser-etched coordinate grid enables instant sample traceability, batch tracking, and audit-ready chain of custody.",
        },
        {
          title: "Cryo-Grade Thermal Stability",
          desc: "Engineered from specialized polymer withstanding extreme temperatures from -80°C deep freezing up to 121°C autoclave cycles.",
        },
        {
          title: "Dual Snap-Lock Closure",
          desc: "Heavy-duty locking latches maintain secure lid compression, preventing accidental openings during transit.",
        },
      ],
      inclusions: [
        ["1x 50-Slot Vial Organizer Box", "Cryo-Grade High-Density Polymer Case with Hinged Lid"],
        ["1x Integrated 10x5 Grid Matrix", "Snug-Fit Alphanumeric Indexed Internal Organizer"],
        ["2x Reinforced Snap-Lock Latches", "Integrated Heavy-Duty Latching Mechanism"],
        ["1x Waterproof Inventory Log Sheet", "Cryo-Safe Adhesive Grid Index Sheet for Sample Mapping"],
        ["1x Quality & Integrity Certificate", "Impact & Cryogenic Thermal Resistance Verified"],
      ],
    },
    reconstitution: {
      defaultVialNetMg: 0,
      defaultDiluentMl: 0,
      solvent: "Hardware storage container. Compatible with 2.0 mL – 3.0 mL vials.",
      dissolutionMethod: "Organize vials vertically in indexed grid positions.",
      resultingConcentrationMgPerMl: 0,
      handlingRule: "Ensure dual latches are firmly engaged prior to transport or inversion.",
    },
    dosing: {
      standardDoseDisplay: "50-Vial Grid Capacity",
      standardDoseMcg: 0,
      cadence: "Long-term specimen containment",
      halfLife: "Polymer service life: 10+ years thermal cycling",
      typicalProtocolDuration: "Permanent Laboratory Labware",
      washoutPeriod: "N/A",
      titrationSteps: [
        {
          stage: "Specimen Logging",
          timeframe: "Intake",
          doseDisplay: "Coordinate Mapping",
          doseMcg: 0,
          cadence: "Per sample receipt",
          focus: "Audit traceability",
          notes: "Log rows A–E and cols 1–10",
        },
        {
          stage: "Deep Freezing",
          timeframe: "Storage Phase",
          doseDisplay: "-20°C to -80°C Safe",
          doseMcg: 0,
          cadence: "Continuous",
          focus: "Molecular stability",
          notes: "No polymer embrittlement",
        },
        {
          stage: "Retrieval",
          timeframe: "Assay Phase",
          doseDisplay: "Targeted Aliquot Retrieval",
          doseMcg: 0,
          cadence: "Per trial",
          focus: "Rapid sample location",
          notes: "Prevents freezer thawing",
        },
      ],
    },
    syringeGuide: {
      syringeType: "Laboratory Specimen Storage Container",
      standardIUDisplay: "50 Indexed Cavities",
      graduations: [
        {
          doseDisplay: "10 Vials per Row",
          doseMcg: 0,
          volumeMl: 0,
          syringeIU: 0,
          tickLabel: "Columns 1 through 10",
        },
        {
          doseDisplay: "5 Rows per Box",
          doseMcg: 0,
          volumeMl: 0,
          syringeIU: 0,
          tickLabel: "Rows A through E",
        },
      ],
    },
    storage: {
      lyophilized: "Operating temperature range: -80°C to +121°C.",
      reconstituted: "Compatible with standard laboratory refrigeration (2°C–8°C) and -20°C / -80°C freezers.",
      lightProtection: true,
    },
    citations: [
      {
        sourceReference: "GLP Guidelines: Sample Storage, Identification and Chain of Custody",
        notes: "Standards for specimen traceability, coordinate indexing, and storage condition integrity.",
      },
    ],
    disclaimer: "Laboratory hardware labware. Clean with neutral lab detergent or 70% IPA prior to initial laboratory deployment.",
  },

  // -------------------------------------------------------------------------
  // 5. Custom Mixed Vial Organizer Box
  // -------------------------------------------------------------------------
  {
    id: "custom-mixed-vial-organizer-box",
    compoundName: "Custom Mixed Vial Organizer Box",
    handles: ["custom-mixed-vial-organizer-box", "mixed-vial-box", "custom-mixed-vial-box"],
    subtitle: "Multi-Diameter Custom Vial Organizer & Benchtop Case",
    longDescription:
      "The Custom Mixed Vial Organizer Box is a multi-diameter modular storage case designed for benchtop organization and refrigerated storage of heterogeneous research supplies. Engineered with dedicated rows for standard 2.0 mL and 5.0 mL peptide vials, wide-neck 10 mL diluent bottles, and solvent ampoules, its two-tone impact-resistant housing and smooth-pivot hinged lid provide dust protection and immediate visual sample segregation.",
    category: "Laboratory Supplies",
    catalogStatus: "in_catalog",
    storeProductHandle: "custom-mixed-vial-organizer-box",
    purityStandard: "Impact-Resistant High-Density Engineering Polymer",
    isSupply: true,
    supplyGuide: {
      isHardware: true,
      physicalState: "Modular Multi-Diameter Storage Labware",
      sterilityStandard: "Wipeable Surface · Refrigeration Safe",
      material: "High-Density Engineering Polymer (Two-Tone Finish)",
      specs: {
        "Configuration": "Multi-Size Hybrid Grid (10 mL, 5 mL, 2 mL Vials & Ampoules)",
        "External Dimensions": "119.5 mm x 107.5 mm x 52.6 mm (Closed Height: 77 mm)",
        "Protective Lid": "Hinged Matching Dust Cover (120.9 mm x 107.9 mm)",
        "Finish & Aesthetic": "Pastel Pink Base Insert with Soft White Protective Lid",
        "Fit Precision": "Anti-Rattle Vertical Orientation Snug Cavities",
        "Base Stability": "Integrated Anti-Slip Foot Pads for Benchtop Placement",
      },
      protocolSteps: [
        {
          stepNumber: 1,
          title: "Multi-Size Diameter Sorting",
          instruction: "Segregate vials by diameter: place larger 10 mL diluent bottles in perimeter slots; inner cavities for 2 mL–5 mL vials.",
        },
        {
          stepNumber: 2,
          title: "Vertical Compartment Loading",
          instruction: "Seat vials securely into calculated cavities. The snug floor perimeter prevents tilting and stopper damage.",
        },
        {
          stepNumber: 3,
          title: "Hinged Lid Closure",
          instruction: "Close matching lid smoothly over hinge pivot to guard against ambient dust, light degradation, and accidental spills.",
        },
        {
          stepNumber: 4,
          title: "Benchtop or Cold Deployment",
          instruction: "Organize on workstations, in refrigeration units (2°C–8°C), or pack securely into field transit containers.",
        },
      ],
      features: [
        {
          title: "Smart Hybrid Multi-Size Grid",
          desc: "Features dedicated multi-diameter rows perfectly fitting standard 2 mL, 5 mL, and wide 10 mL vials simultaneously.",
        },
        {
          title: "Heavy-Duty High-Density Build",
          desc: "Engineered with thick structural walls and reinforced ribbing for superior shock absorption and daily durability.",
        },
        {
          title: "Hinged Protective Shield",
          desc: "Ergonomic protective lid shields fragile glass vials from atmospheric dust, accidental spills, and UV exposure.",
        },
        {
          title: "Elegant Two-Tone Lab Aesthetic",
          desc: "Clean pastel pink base insert paired with soft white lid provides instant visual identification on busy workstations.",
        },
      ],
      inclusions: [
        ["1x Mixed Vial Box Base Organizer", "Multi-Diameter Hybrid Precision Storage Case"],
        ["1x Matching Hinged Protective Lid", "Impact-Resistant Dust & UV Protective Shield"],
        ["1x Precision Hinge Assembly", "Heavy-Duty Integrated Smooth-Action Pivot"],
        ["1x Anti-Slip Base Pads", "Desktop Stability & Vibration Dampening Feet"],
        ["1x Compatibility Specification Sheet", "Complete Slot Diameter & Capacity Blueprint Guide"],
      ],
    },
    reconstitution: {
      defaultVialNetMg: 0,
      defaultDiluentMl: 0,
      solvent: "Hardware storage container. Multi-diameter compatible.",
      dissolutionMethod: "Sort vials by diameter into designated cavities.",
      resultingConcentrationMgPerMl: 0,
      handlingRule: "Keep lid closed when not accessing vials to guard against light degradation.",
    },
    dosing: {
      standardDoseDisplay: "Multi-Diameter Hybrid Capacity",
      standardDoseMcg: 0,
      cadence: "Benchtop & refrigerated specimen organization",
      halfLife: "Durable polymer engineering labware",
      typicalProtocolDuration: "Continuous Laboratory Deployment",
      washoutPeriod: "N/A",
      titrationSteps: [
        {
          stage: "Sorting",
          timeframe: "Setup",
          doseDisplay: "Diameter Segregation",
          doseMcg: 0,
          cadence: "Intake",
          focus: "Format isolation",
          notes: "2 mL, 5 mL, and 10 mL rows",
        },
        {
          stage: "Storage",
          timeframe: "Active Study",
          doseDisplay: "Refrigerated 2°C–8°C",
          doseMcg: 0,
          cadence: "Daily access",
          focus: "Workstation efficiency",
          notes: "Dust and light shield",
        },
        {
          stage: "Cleaning",
          timeframe: "Maintenance",
          doseDisplay: "70% IPA Surface Wipe",
          doseMcg: 0,
          cadence: "Monthly",
          focus: "Aseptic upkeep",
          notes: "Do not submerge hinge in acid",
        },
      ],
    },
    syringeGuide: {
      syringeType: "Multi-Diameter Laboratory Specimen Organizer",
      standardIUDisplay: "Hybrid Cavity Grid",
      graduations: [
        {
          doseDisplay: "10 mL Perimeter Slots",
          doseMcg: 0,
          volumeMl: 0,
          syringeIU: 0,
          tickLabel: "Large diameter solvent slots",
        },
        {
          doseDisplay: "2 mL – 5 mL Inner Slots",
          doseMcg: 0,
          volumeMl: 0,
          syringeIU: 0,
          tickLabel: "Standard lyophilized vial slots",
        },
      ],
    },
    storage: {
      lyophilized: "Store at ambient room temperature (15°C–30°C) or inside laboratory refrigerator (2°C–8°C).",
      reconstituted: "Laboratory refrigeration safe.",
      lightProtection: true,
    },
    citations: [
      {
        sourceReference: "Laboratory Design & Ergonomics: Workstation Organization Standards",
        notes: "Recommendations for benchtop specimen segregation, dust protection, and sample handling ergonomics.",
      },
    ],
    disclaimer: "Laboratory accessory hardware. Inspect compartments before loading glass vials.",
  },

  // -------------------------------------------------------------------------
  // 6. Clear Nasal Spray Bottles
  // -------------------------------------------------------------------------
  {
    id: "clear-nasal-spray-bottles",
    compoundName: "Clear Nasal Spray Bottles",
    handles: ["clear-nasal-spray-bottles", "nasal-spray-bottles", "nasal-bottles", "clear-nasal-spray-bottle"],
    subtitle: "Precision Laboratory Dispensing Atomizer Accessories",
    longDescription:
      "Clear Nasal Spray Bottles are calibrated metered fine-mist atomizer containers manufactured from pharmaceutical-grade high-clarity PET polymer for non-invasive intranasal peptide research formulations. Each unit features an 18/410 threaded neck with an airtight silicone compression gasket and a metered internal pump mechanism calibrated to discharge exactly 0.10 mL per actuation with narrow droplet dispersion, accompanied by an overcap preventing orifice contamination.",
    category: "Laboratory Supplies",
    catalogStatus: "in_catalog",
    storeProductHandle: "clear-nasal-spray-bottles",
    purityStandard: "Medical-Grade High-Clarity PET (0.10 mL Calibrated Pump)",
    isSupply: true,
    supplyGuide: {
      isHardware: true,
      physicalState: "Metered Fine-Mist Atomizer Labware",
      sterilityStandard: "Airtight Hermetic Seal · Protective Overcap",
      material: "Medical-Grade High-Clarity PET & Polypropylene Pump",
      specs: {
        "Pump Output": "0.10 mL Calibrated Metered Fine-Mist Output",
        "Neck & Thread": "18/410 Thread with Airtight Silicone Gasket",
        "Material Clarity": "Optical Grade High-Clarity PET for Visual Solution Inspection",
        "Available Capacities": "5 mL, 8 mL, and 10 mL Container Form Factors",
        "Contamination Guard": "Protective Clear Hygienic Overcap Included",
        "Compatibility": "Validated with Intranasal Research Peptides & Aqueous Solutions",
      },
      protocolSteps: [
        {
          stepNumber: 1,
          title: "Peptide Solution Transfer",
          instruction: "Reconstitute peptide vial and smoothly transfer aqueous solution into clean bottle using a sterile transfer syringe.",
        },
        {
          stepNumber: 2,
          title: "Airtight Collar Tightening",
          instruction: "Screw the nozzle collar firmly clockwise until the internal silicone gasket is fully compressed.",
        },
        {
          stepNumber: 3,
          title: "Pump Priming & Clearing",
          instruction: "Hold upright and actuate the pump 2–3 times into a test receptacle until a uniform, fine mist is discharged.",
        },
        {
          stepNumber: 4,
          title: "Storage & Hygiene Management",
          instruction: "Store upright at 2°C–8°C refrigerated. Re-attach the protective hygienic overcap after every dispensing cycle.",
        },
      ],
      features: [
        {
          title: "Metered 0.10 mL Dispersion",
          desc: "Calibrated internal pump mechanism delivers consistent 0.10 mL volumetric output with narrow particle droplet distribution.",
        },
        {
          title: "High-Clarity PET Body",
          desc: "Transparent medical-grade polymer allows immediate visual inspection of peptide dissolution, volume level, and clarity.",
        },
        {
          title: "Airtight Leak-Proof Seal",
          desc: "Precision 18/410 threaded neck with silicone gasket prevents solvent evaporation, leakage, and atmospheric oxidation.",
        },
        {
          title: "Ergonomic Nozzle Actuator",
          desc: "Broad ribbed finger flanges ensure non-slip, balanced actuation force during laboratory formulation dispensing.",
        },
      ],
      inclusions: [
        ["1x High-Clarity PET Bottle", "Medical-Grade Transparent Intranasal Reservoir"],
        ["1x 0.10 mL Metered Pump Mechanism", "Precision Calibrated Fine-Mist Atomizer Assembly"],
        ["1x Airtight Silicone Gasket", "Leak-Proof Evaporation-Resistant Neck Seal"],
        ["1x Hygienic Protective Overcap", "Dust & Contamination Shield for Dispensing Orifice"],
        ["1x Intranasal Formulation Reference", "Volumetric Dilution & Metered Actuation Calculation Guide"],
      ],
    },
    reconstitution: {
      defaultVialNetMg: 0,
      defaultDiluentMl: 5.0,
      solvent: "Compatible with Bacteriostatic Saline & Distilled Aqueous Diluent",
      dissolutionMethod: "Atomizer accessory. Fill with reconstituted peptide solution via sterile transfer syringe.",
      resultingConcentrationMgPerMl: 0,
      handlingRule: "Ensure silicone gasket is correctly seated before torquing collar to prevent evaporation.",
    },
    dosing: {
      standardDoseDisplay: "0.10 mL Metered Mist per Actuation",
      standardDoseMcg: 0,
      cadence: "Intranasal protocol delivery based on compound monograph",
      halfLife: "Solution stability: Refer to specific reconstituted compound",
      typicalProtocolDuration: "Study-Specific Protocol",
      washoutPeriod: "N/A",
      titrationSteps: [
        {
          stage: "Solution Filling",
          timeframe: "Step 1",
          doseDisplay: "Aseptic Syringe Transfer",
          doseMcg: 0,
          cadence: "Initial fill",
          focus: "Precise volume loading",
          notes: "3 mL, 5 mL, or 10 mL volume",
        },
        {
          stage: "Actuator Priming",
          timeframe: "Step 2",
          doseDisplay: "2–3 Test Actuations",
          doseMcg: 0,
          cadence: "Pre-assay",
          focus: "Uniform mist chamber prime",
          notes: "Discharge into test vial",
        },
        {
          stage: "Dispensing Protocol",
          timeframe: "Step 3",
          doseDisplay: "0.10 mL / Spray Delivery",
          doseMcg: 0,
          cadence: "Protocol schedule",
          focus: "Narrow droplet distribution",
          notes: "Hold upright during spray",
        },
      ],
    },
    syringeGuide: {
      syringeType: "0.10 mL Metered Intranasal Atomizer Pump",
      standardIUDisplay: "0.10 mL (100 µL) per Actuation",
      graduations: [
        {
          doseDisplay: "1 Spray (0.10 mL)",
          doseMcg: 0,
          volumeMl: 0.10,
          syringeIU: 10.0,
          tickLabel: "1 actuation = 0.10 mL",
        },
        {
          doseDisplay: "2 Sprays (0.20 mL)",
          doseMcg: 0,
          volumeMl: 0.20,
          syringeIU: 20.0,
          tickLabel: "2 actuations = 0.20 mL",
        },
        {
          doseDisplay: "3 Sprays (0.30 mL)",
          doseMcg: 0,
          volumeMl: 0.30,
          syringeIU: 30.0,
          tickLabel: "3 actuations = 0.30 mL",
        },
      ],
    },
    storage: {
      lyophilized: "Store empty bottles at 15°C–30°C in clean, dust-free cabinet.",
      reconstituted: "Store filled atomizer upright at 2°C–8°C refrigerated with overcap firmly attached.",
      lightProtection: false,
    },
    citations: [
      {
        sourceReference: "EP & USP Metered-Dose Nasal Spray Standard Operating Guidelines",
        notes: "Specifies volumetric shot weight uniformity, spray pattern plume geometry, and droplet size distribution.",
      },
    ],
    disclaimer: "Non-sterile laboratory accessory. For analytical in-vitro evaluation and laboratory formulation dispensing only.",
  },
]
