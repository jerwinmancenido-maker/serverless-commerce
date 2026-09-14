import { createProtocol, createCatalogProduct } from "./builder.mjs"

export const LAB_SUPPLIES_PROTOCOLS = [
  createProtocol({
    id: "pes-syringe-filters-022um",
    compoundName: "0.22 µm PES Syringe Filters (25mm Sterile)",
    handles: ["pes-syringe-filters-022um", "pes-filters", "syringe-filters-022um"],
    subtitle: "Hydrophilic Polyethersulfone Membrane · 0.22 µm Sterilization Standard",
    longDescription: "**What it is:** These 0.22 µm PES (Polyethersulfone) syringe filters are gamma-irradiated sterile filtration units featuring a 25 mm diameter hydrophilic membrane engineered for analytical sample clarification and cold sterilization of peptide reconstitutions.\n\n**How it works:** The polyethersulfone membrane provides exceptionally low protein-binding characteristics (<0.1% peptide loss), ensuring that delicate peptide sequences pass through quantitatively while bacteria, particulates, and micro-contaminants are reliably captured.\n\n**Why researchers study it:** Essential laboratory hardware for sterilizing sensitive peptide solutions that cannot undergo thermal autoclave sterilization.",
    category: "Laboratory Supplies",
    defaultVialNetMg: 0,
    defaultDiluentMl: 0,
    isSupply: true,
    supplyGuide: {
      isHardware: true,
      physicalState: "Sterile Polyethersulfone Membrane Filter Units",
      sterilityStandard: "Gamma Irradiated · Certified Pyrogen-Free (<0.005 EU/mL)",
      material: "Medical Grade Polypropylene Housing with Hydrophilic PES Membrane",
      specs: {
        "Pore Size": "0.22 µm Absolute Filtration Rating",
        "Membrane Diameter": "25 mm High-Throughput Surface Area",
        "Hold-Up Volume": "< 0.05 mL Low Dead Volume Retention",
        "Inlet Connection": "Female Luer-Lok Standard",
        "Outlet Connection": "Male Luer Slip Fit",
        "Maximum Operating Pressure": "4.5 bar (65 psi)"
      },
      protocolSteps: [
        { stepNumber: 1, title: "Aseptic Package Opening", instruction: "Peel open individual sterile blister pack within a certified laminar flow hood or clean field." },
        { stepNumber: 2, title: "Luer-Lok Syringe Coupling", instruction: "Firmly thread the filter inlet onto the male Luer-Lok collar of the loaded diluent syringe." },
        { stepNumber: 3, title: "Slow Positive Displacement", instruction: "Gently depress plunger with smooth positive pressure to filter solution directly into receiving sterile vial." },
        { stepNumber: 4, title: "Safe Sharps/Filter Disposal", instruction: "Dispose of used single-use filter unit in designated laboratory biological waste receptacle." }
      ],
      features: [
        { title: "Ultra-Low Peptide Binding", desc: "Hydrophilic PES chemistry ensures minimal adsorptive loss of delicate peptide sequences during filtration." },
        { title: "Absolute 0.22 µm Sterilization", desc: "Excludes bacterial contaminants and particulate matter, ensuring pharmaceutical-grade optical clarity." },
        { title: "High Flow Surface Rate", desc: "25 mm filtration surface minimizes backpressure during manual syringe dispensing." },
        { title: "Burst-Resistant Housing", desc: "Reinforced polypropylene casing withstands up to 65 psi operating pressures without leaking." }
      ],
      inclusions: [
        ["50x PES Syringe Filters", "Individually Blister-Packed Gamma-Sterile Units"],
        ["1x Lot Verification Certificate", "Endotoxin & Bubble-Point Integrity Tested"]
      ]
    }
  }),

  createProtocol({
    id: "u100-lds-syringes-03ml-100ct",
    compoundName: "U-100 LDS Syringes 0.3 mL (31G x 5/16\" 100ct)",
    handles: ["u100-lds-syringes-03ml-100ct", "micro-barrel-syringes-03ml", "lds-syringes-03ml"],
    subtitle: "Micro-Dose 30-Unit Precision Syringe · Low Dead Space Plunger",
    longDescription: "**What it is:** Box of 100 high-precision 0.3 mL (30-unit) U-100 insulin syringes with integrated 31-gauge, 5/16\" (8 mm) ultra-fine lubricated stainless steel needles.\n\n**How it works:** Featuring a specialized micro-barrel diameter, this syringe expands unit tick marks by 300% relative to 1.0 mL syringes, eliminating visual parallax error and ensuring accurate micro-dosing (1–30 units) with dead space under 0.002 mL.\n\n**Why researchers study it:** Standard instrument for micro-dosing protocols (e.g. BPC-157, Semax, CJC-1295) where single-unit measurement errors represent a significant percentage of total target mass.",
    category: "Laboratory Supplies",
    defaultVialNetMg: 0,
    defaultDiluentMl: 0,
    isSupply: true,
    supplyGuide: {
      isHardware: true,
      physicalState: "Sterile Single-Use Micro-Barrel U-100 Syringes",
      sterilityStandard: "ETO Gas Sterilized · Non-Pyrogenic · Non-Toxic",
      material: "Surgical Grade Stainless Steel & Medical Polypropylene",
      specs: {
        "Barrel Capacity": "0.3 mL (30 U-100 International Units)",
        "Graduation Resolution": "Half-Unit Ticks (0.5 Unit / 0.005 mL Precision)",
        "Needle Gauge": "31 Gauge (0.25 mm Outer Diameter)",
        "Needle Length": "5/16 Inch (8 mm Subcutaneous Standard)",
        "Dead Space Volume": "< 0.002 mL Integrated Fixed Needle Standard",
        "Packaging Standard": "100 Syringes per Box (10 Sealed Polybags of 10)"
      },
      protocolSteps: [
        { stepNumber: 1, title: "Cap Decoupling & Inspection", instruction: "Remove white plunger cap and orange needle shield in a linear motion without twisting." },
        { stepNumber: 2, title: "Air Volume Pre-Draw", instruction: "Draw equivalent volume of air into the micro-barrel prior to penetrating the vial septum." },
        { stepNumber: 3, title: "Inverted Fluid Meniscus Alignment", instruction: "Invert vial, depress air, and withdraw fluid slowly, aligning plunger ring bottom with target tick mark." },
        { stepNumber: 4, title: "Single-Action Sharps Containment", instruction: "Immediately dispose of syringe into a rigid puncture-resistant sharps container without re-capping." }
      ],
      features: [
        { title: "Expanded 300% Graduation Pitch", desc: "Slim 0.3 mL barrel provides wide graduation spacing for flawless microgram dosing precision." },
        { title: "Zero Dead Space Plunger", desc: "Extended rubber tip displaces residual fluid completely from the needle hub, preventing compound waste." },
        { title: "Triple-Bevel Laser Polished", desc: "Lubricated needle bevel minimizes penetration force and tissue resistance during delivery." },
        { title: "Crystal-Clear Barrel Markings", desc: "High-contrast bold graduation lines remain smudge-proof against alcohol wipes." }
      ],
      inclusions: [
        ["100x 0.3 mL U-100 LDS Syringes", "Box of 100 Sterile Units (10 Packs of 10)"],
        ["1x Syringe Accuracy Calibration Guide", "Stoichiometric Tick Conversion Chart"]
      ]
    }
  }),

  createProtocol({
    id: "u100-lds-syringes-05ml-100ct",
    compoundName: "U-100 LDS Syringes 0.5 mL (30G x 1/2\" 100ct)",
    handles: ["u100-lds-syringes-05ml-100ct", "mid-barrel-syringes-05ml", "lds-syringes-05ml"],
    subtitle: "Mid-Barrel 50-Unit U-100 Syringe · Intermediate Volume Calibration",
    longDescription: "**What it is:** Box of 100 high-grade 0.5 mL (50-unit) U-100 insulin syringes with integrated 30-gauge, 1/2\" (12.7 mm) thin-wall surgical needles.\n\n**How it works:** The 0.5 mL mid-barrel format provides optimal ergonomic balance for intermediate volumes (15–50 units), offering smooth plunger travel, clear volumetric visibility, and low dead space.\n\n**Why researchers study it:** The primary standard syringe for incretin titration protocols (Tirzepatide 5–10mg, Semaglutide 1.0–1.7mg, Retatrutide 4–6mg) and high-volume peptide reconstitution models.",
    category: "Laboratory Supplies",
    defaultVialNetMg: 0,
    defaultDiluentMl: 0,
    isSupply: true,
    supplyGuide: {
      isHardware: true,
      physicalState: "Sterile Single-Use Mid-Barrel U-100 Syringes",
      sterilityStandard: "ETO Gas Sterilized · Non-Pyrogenic · CE Certified",
      material: "Surgical Stainless Steel & Polypropylene Barrel",
      specs: {
        "Barrel Capacity": "0.5 mL (50 U-100 International Units)",
        "Graduation Resolution": "1-Unit Increments (0.01 mL per Tick)",
        "Needle Gauge": "30 Gauge Thin-Wall",
        "Needle Length": "1/2 Inch (12.7 mm Subcutaneous Standard)",
        "Dead Space Retention": "< 0.004 mL Low Dead Space Plunger",
        "Packaging Standard": "100 Syringes per Box (10 Multipacks of 10)"
      },
      protocolSteps: [
        { stepNumber: 1, title: "Sterility Verification", instruction: "Examine protective pack seals to verify integrity before peeling open package." },
        { stepNumber: 2, title: "Linear Plunger Retraction", instruction: "Uncap needle and draw fluid smoothly while monitoring fluid interface against unit lines." },
        { stepNumber: 3, title: "Bubble Tap & Expulsion", instruction: "Flick barrel gently to float any micro-bubbles to the apex and expel excess volume back into vial." },
        { stepNumber: 4, title: "Aseptic Disposal", instruction: "Deposit directly into biohazard sharps container immediately after laboratory procedure." }
      ],
      features: [
        { title: "Mid-Barrel Volumetric Balance", desc: "Calibrated for 10 to 50 unit dosing where 1.0 mL syringes lack resolution and 0.3 mL are insufficient." },
        { title: "Thin-Wall Lubricated Steel", desc: "Enlarged inner lumen ensures effortless flow with viscous or cold reconstituted solutions." },
        { title: "Double-Seal Plunger Stopper", desc: "Prevents fluid bypass and maintains vacuum hold during inverted vial aspiration." },
        { title: "High-Contrast Unit Scale", desc: "Black graduation markings on translucent barrel provide rapid visual verification." }
      ],
      inclusions: [
        ["100x 0.5 mL U-100 LDS Syringes", "Box of 100 Sterile Units (10 Packs of 10)"],
        ["1x Quality & Sterility Specification Sheet", "Conforms to ISO 8537 Standards"]
      ]
    }
  }),

  createProtocol({
    id: "blunt-fill-filter-needles-18g",
    compoundName: "18G Blunt Fill Filter Needles (18G x 1.5\" 5µm Filter 100ct)",
    handles: ["blunt-fill-filter-needles-18g", "blunt-fill-needles", "filter-needles-18g"],
    subtitle: "5 µm Particulate Disc Filter · Rubber Stopper Core Prevention Standard",
    longDescription: "**What it is:** Box of 100 sterile 18-gauge, 1.5\" (38 mm) blunt-fill transfer needles incorporating an integrated 5-micron particulate membrane disc within the needle hub.\n\n**How it works:** The 45° blunt tip requires 10x less piercing force to traverse vial septa without coring rubber stoppers, while the 5 µm membrane prevents glass ampoule particles or rubber fragments from being drawn into the reconstitution syringe.\n\n**Why researchers study it:** Recommended under USP <797> compounding guidelines for diluent reconstitution draws and ampoule fluid transfer.",
    category: "Laboratory Supplies",
    defaultVialNetMg: 0,
    defaultDiluentMl: 0,
    isSupply: true,
    supplyGuide: {
      isHardware: true,
      physicalState: "Sterile Reconstitution & Diluent Transfer Needles",
      sterilityStandard: "Gamma-Sterilized · Pyrogen-Free · Individually Packaged",
      material: "Surgical Stainless Steel Cannula with Red Polypropylene Hub",
      specs: {
        "Needle Gauge": "18 Gauge (Large Bore for Rapid Fluid Transfer)",
        "Cannula Length": "1.5 Inch (38 mm Deep-Vial Reach)",
        "Tip Geometry": "45° Blunt Bevel (Anti-Coring Standard)",
        "Internal Membrane Filter": "5 µm Porous Disc (Particulate & Glass Trap)",
        "Color Code": "Vibrant Red Hub for Rapid Identification",
        "Connection Interface": "Universal Luer-Lok & Luer-Slip Compatible"
      },
      protocolSteps: [
        { stepNumber: 1, title: "Transfer Needle Coupling", instruction: "Attach blunt filter needle hub securely onto a 3 mL or 5 mL Luer-Lok diluent syringe." },
        { stepNumber: 2, title: "Vertical Septum Penetration", instruction: "Insert blunt tip vertically through the center of the decontaminated vial rubber septum." },
        { stepNumber: 3, title: "Aspiration & Particulate Trap", instruction: "Aspirate diluent; the integrated 5 µm membrane traps any glass fragments or rubber cores." },
        { stepNumber: 4, title: "Needle Exchange for Injection", instruction: "Decouple blunt needle, discard into sharps container, and attach sterile injection needle." }
      ],
      features: [
        { title: "Anti-Coring 45° Blunt Bevel", desc: "Eliminates rubber plug fragments from entering peptide solutions during transfer." },
        { title: "Integrated 5 µm Membrane Filter", desc: "Guarantees particulate-free diluent draws from glass ampoules and multi-dose vials." },
        { title: "High-Flow 18G Bore", desc: "Enables rapid, effortless transfer of 2 to 10 mL diluent volumes without resistance." },
        { title: "Red Color Identification", desc: "High-visibility red hub alerts personnel that this instrument is for transfer, not patient administration." }
      ],
      inclusions: [
        ["100x 18G Blunt Fill Filter Needles", "Individually Peel-Packed Sterile Units"],
        ["1x USP Compounding SOP Reference Guide", "Aseptic Transfer Instructions"]
      ]
    }
  }),

  createProtocol({
    id: "sterile-amber-vials-10ml",
    compoundName: "Sterile Amber Vials 10 mL (Type 1 Borosilicate 20-Pack)",
    handles: ["sterile-amber-vials-10ml", "amber-vials-10ml", "sterile-vials-amber"],
    subtitle: "UV-Blocking Type 1 Borosilicate · Chlorobutyl Rubber Stoppers 20ct",
    longDescription: "**What it is:** Pack of 20 pre-sterilized, crimped 10 mL amber glass vials manufactured from pharmaceutical Type 1 USP borosilicate glass with chlorobutyl rubber stoppers and aluminum flip-off seals.\n\n**How it works:** Amber borosilicate glass filters out >99% of actinic light (wavelengths 290–450 nm), protecting photo-labile peptide sequences (such as GHK-Cu, Melanotan-2, and Retatrutide) from photochemical degradation and oxidative cleavage.\n\n**Why researchers study it:** The golden standard storage container for laboratory compounding, light-sensitive peptide aliquoting, and long-term aqueous sample stability.",
    category: "Laboratory Supplies",
    defaultVialNetMg: 0,
    defaultDiluentMl: 0,
    isSupply: true,
    supplyGuide: {
      isHardware: true,
      physicalState: "Pre-Sterilized Amber Glass Vials with Vacuum Sealed Septa",
      sterilityStandard: "Autoclaved at 121°C · Depyrogenated · Cleanroom Packed",
      material: "USP Type 1 Amber Borosilicate Glass & Chlorobutyl Rubber",
      specs: {
        "Nominal Volume": "10.0 mL Working Capacity (12.5 mL Overflow)",
        "Glass Composition": "USP Type 1 Hydrolytic Resistance Borosilicate",
        "Spectral Protection": "Filters 290 nm – 450 nm UV & Actinic Visible Light",
        "Septum Material": "Teflon-Coated Chlorobutyl Self-Sealing Rubber",
        "Closure Cap": "20 mm Aluminum Crimp with Royal Blue Flip-Off Top",
        "Internal Atmosphere": "Sterile Air (Slight Negative Pressure Vacuum)"
      },
      protocolSteps: [
        { stepNumber: 1, title: "Cap Flip-Off Decrimping", instruction: "Flip upward on the blue plastic cap to expose the sterile center of the rubber septum." },
        { stepNumber: 2, title: "Septum Disinfection", instruction: "Wipe rubber septum with a sterile 70% IPA swab in a unidirectional motion and air dry 30s." },
        { stepNumber: 3, title: "Aliquoting Reagent Transfer", instruction: "Introduce reconstituted peptide solution using sterile syringe; self-sealing rubber maintains closure." },
        { stepNumber: 4, title: "Light-Proof Cold Storage", instruction: "Label vial with concentration and date, then store at 2°C–8°C refrigerated." }
      ],
      features: [
        { title: "Broad-Spectrum UV Filtering", desc: "Amber glass prevents photo-oxidation and bond cleavage in light-sensitive peptide bonds." },
        { title: "Type 1 Hydrolytic Resistance", desc: "Neutral glass chemistry prevents alkaline leaching into aqueous solutions during long storage." },
        { title: "Self-Sealing Chlorobutyl Septum", desc: "Reseals securely over 50+ multiple needle punctures without coring or leaking." },
        { title: "Pre-Sterilized Cleanroom Ready", desc: "Depyrogenated and pre-crimped under sterile laminar airflow, ready for immediate use." }
      ],
      inclusions: [
        ["20x Sterile 10 mL Amber Vials", "Depyrogenated & Sealed Type 1 Glass Containers"],
        ["20x Cryo-Proof Adhesive Labels", "Chemical-Resistant Sample Labeling Sheets"]
      ]
    }
  }),

  createProtocol({
    id: "alcohol-prep-swabs-200ct",
    compoundName: "Alcohol Prep Swabs (70% Isopropyl Alcohol 200ct)",
    handles: ["alcohol-prep-swabs-200ct", "ipa-prep-swabs", "alcohol-swabs-200ct"],
    subtitle: "2-Ply Non-Woven Medical Grade · 70% Isopropanol Disinfection 200ct",
    longDescription: "**What it is:** Box of 200 individually foil-sealed, saturated alcohol prep pads saturated with USP medical-grade 70% Isopropyl Alcohol (IPA) and 30% purified water.\n\n**How it works:** 70% IPA optimizes bacterial cell-wall penetration before evaporation occurs, denaturing microbial proteins, lysing lipid membranes, and achieving broad-spectrum disinfection of vial rubber septa and laboratory injection sites within 30 seconds of contact.\n\n**Why researchers study it:** Mandatory baseline consumable for USP <797> aseptic compounding and subcutaneous administration protocols.",
    category: "Laboratory Supplies",
    defaultVialNetMg: 0,
    defaultDiluentMl: 0,
    isSupply: true,
    supplyGuide: {
      isHardware: true,
      physicalState: "Hermetically Sealed Foil Packets with IPA-Saturated Pads",
      sterilityStandard: "Gamma-Sterilized Non-Woven Substrate · Medical Grade",
      material: "2-Ply Non-Woven Rayon/Polyester Saturated with 70% Isopropanol",
      specs: {
        "Active Ingredient": "70% v/v Isopropyl Alcohol USP",
        "Inactive Ingredient": "30% Purified Water USP",
        "Pad Construction": "2-Ply Non-Woven Embossed Texture",
        "Dimensions": "30 mm x 60 mm Unfolded Contact Area",
        "Packaging Standard": "Individual Hermetic Foil Sachets (200 Units per Box)",
        "Antimicrobial Efficacy": "Broad-Spectrum Bactericidal & Antiviral Action"
      },
      protocolSteps: [
        { stepNumber: 1, title: "Sachet Notch Tearing", instruction: "Tear open foil packet at pre-cut notch immediately prior to sanitizing surface." },
        { stepNumber: 2, title: "Vial Septum Swabbing", instruction: "Rub rubber septum firmly in a circular motion for 10 seconds with clean pad." },
        { stepNumber: 3, title: "30-Second Air Drying", instruction: "Allow alcohol to fully evaporate for 30 seconds to achieve full antimicrobial sterilization." },
        { stepNumber: 4, title: "Dry Waste Disposal", instruction: "Discard used pad into standard laboratory waste stream." }
      ],
      features: [
        { title: "Optimal 70% Concentration", desc: "Ideal hydration ratio prevents rapid evaporation, allowing complete microbial cell lysis." },
        { title: "Airtight Foil Hermetic Seal", desc: "Multi-layer aluminum laminate prevents drying out during extended storage." },
        { title: "Lint-Free 2-Ply Texture", desc: "Non-shedding synthetic fibers prevent particle deposition on vial rubber stoppers." },
        { title: "Rapid 30-Second Disinfection", desc: "Provides high-log microbial kill rate against common laboratory surface pathogens." }
      ],
      inclusions: [
        ["200x Sterile Alcohol Prep Pads", "Individually Foil-Sealed 2-Ply Swabs"],
        ["1x Dispenser Box", "Convenient Tear-Top Laboratory Storage Box"]
      ]
    }
  }),

  createProtocol({
    id: "bacteriostatic-sodium-chloride-30ml",
    compoundName: "Bacteriostatic 0.9% NaCl 30 mL (USP Multi-Dose)",
    handles: ["bacteriostatic-sodium-chloride-30ml", "bac-nacl-30ml", "bacteriostatic-saline-30ml"],
    subtitle: "Isotonic 0.9% Saline + 0.9% Benzyl Alcohol · Multi-Dose Diluent 30mL",
    longDescription: "**What it is:** Bacteriostatic 0.9% Sodium Chloride is a sterile, non-pyrogenic isotonic aqueous solution containing 9 mg/mL NaCl and 0.9% (9 mg/mL) benzyl alcohol preservative in a 30 mL multi-dose borosilicate glass vial.\n\n**How it works:** Isotonic saline provides physiological osmolarity (~308 mOsmol/L), while benzyl alcohol suppresses bacterial and fungal proliferation, enabling repeated draws from the vial over a 28-day beyond-use window without contamination.\n\n**Why researchers study it:** Recommended for peptides that require isotonic physiological conditions or have reduced solubility/stability in unbuffered pure sterile water.",
    category: "Laboratory Supplies",
    defaultVialNetMg: 0,
    defaultDiluentMl: 0,
    isSupply: true,
    supplyGuide: {
      isHardware: false,
      physicalState: "Clear, Colorless Sterile Aqueous Isotonic Solution",
      sterilityStandard: "Autoclaved USP Sterility Standard · Non-Pyrogenic",
      material: "Type 1 Borosilicate Glass Vial with Rubber Stopper",
      specs: {
        "Nominal Volume": "30.0 mL Multi-Dose Vial Capacity",
        "Active Electrolyte": "0.9% w/v Sodium Chloride (NaCl) USP",
        "Preservative Agent": "0.9% w/v Benzyl Alcohol NF",
        "Osmolarity": "Approx. 308 mOsmol/L (Isotonic Standard)",
        "pH Range": "4.5 to 7.0 (USP Monograph Compliant)",
        "Beyond-Use Date": "28 Days after initial septum puncture"
      },
      protocolSteps: [
        { stepNumber: 1, title: "Flip-Off Cap Removal", instruction: "Remove protective plastic dust cover to expose sterile rubber stopper." },
        { stepNumber: 2, title: "Septum Decontamination", instruction: "Swab rubber stopper thoroughly with 70% IPA pad and allow 30s to air dry." },
        { stepNumber: 3, title: "Equal Volume Air Injection", instruction: "Inject equivalent volume of sterile air into vial before drawing diluent volume." },
        { stepNumber: 4, title: "Controlled Diluent Transfer", instruction: "Slowly transfer measured saline volume down the vial wall of lyophilized peptide." }
      ],
      features: [
        { title: "Physiological 308 mOsmol/L Isotonicity", desc: "Prevents osmotic cell lysis and tissue irritation compared to hypotonic sterile water." },
        { title: "28-Day Multi-Dose Antimicrobial", desc: "0.9% benzyl alcohol prevents bacterial and fungal proliferation across repeated draws." },
        { title: "Type 1 USP Glass Vial", desc: "Pharmaceutical glass prevents sodium leaching and maintains chemical stability." },
        { title: "30 mL Economical Volume", desc: "Reconstitutes up to 15 standard peptide vials from a single multi-dose container." }
      ],
      inclusions: [
        ["1x 30 mL Bacteriostatic Saline Vial", "Sealed Multi-Dose Type 1 Glass Container"],
        ["1x Lot Analysis Certificate", "Osmolarity & Sterility Assay Documentation"]
      ]
    }
  }),

  createProtocol({
    id: "cold-chain-transport-case",
    compoundName: "Cold-Chain Digital Transport Cooler Case (2°C–8°C)",
    handles: ["cold-chain-transport-case", "peltier-cooler-case", "peptide-transport-case"],
    subtitle: "Active Thermoelectric Peltier Cooler · Real-Time LCD Telemetry (2°C–8°C)",
    longDescription: "**What it is:** The Cold-Chain Digital Transport Cooler Case is a specialized active refrigeration travel container utilizing semiconductor Peltier cooling to maintain an internal temperature of 2°C–8°C indefinitely on USB/battery power.\n\n**How it works:** Dual brushless fans and an aircraft-grade aluminum cold-well conduct heat away from the storage compartment, while an integrated microcontroller reads internal ambient temperature sensors to modulate cooling power and display real-time telemetry on an external OLED screen.\n\n**Why researchers study it:** Eliminates freeze-thaw cycles and temperature spikes during transit, safeguarding fragile reconstituted peptides against structural denaturation.",
    category: "Laboratory Supplies",
    defaultVialNetMg: 0,
    defaultDiluentMl: 0,
    isSupply: true,
    supplyGuide: {
      isHardware: true,
      physicalState: "Active Semiconductor Peltier Refrigeration Case",
      sterilityStandard: "Shock-Resistant · Dustproof · Anodized Cleanable Chamber",
      material: "Aviation-Grade Anodized Aluminum & Polycarbonate Chassis",
      specs: {
        "Target Temperature": "2°C to 8°C Constant Refrigerated Range",
        "Cooling Differential": "Up to 30°C Below Ambient Room Temperature",
        "Vial Capacity": "Holds up to 6 Standard 10 mL Vials or 12 Syringes",
        "Battery Life": "Up to 10 Hours on Internal 10,200 mAh Lithium Pack",
        "Power Interface": "USB Type-C (5V/2A) & 12V Automotive Adapter Compatible",
        "Telemetry Display": "Digital OLED Live Temperature & Battery Monitor"
      },
      protocolSteps: [
        { stepNumber: 1, title: "Power Activation & Pre-Cool", instruction: "Turn on unit 15 minutes before loading to allow internal chamber to reach 4°C." },
        { stepNumber: 2, title: "Vial Placement in Cold-Well", instruction: "Seat vials vertically into custom silicone sleeve inserts to prevent transit vibration." },
        { stepNumber: 3, title: "Lid Compression & Lock", instruction: "Close insulated thermal lid and secure dual magnetic latches." },
        { stepNumber: 4, title: "Telemetry Monitoring", instruction: "Check external OLED display periodically to ensure temperature remains within 2°C–8°C." }
      ],
      features: [
        { title: "Peltier Active Refrigeration", desc: "No messy melting ice packs; maintains precise 2°C–8°C continuous thermal control." },
        { title: "Live OLED Telemetry HUD", desc: "Displays exact chamber temperature, battery percentage, and cooling status at a glance." },
        { title: "10-Hour Internal Lithium Pack", desc: "Enables compliant cold-chain transport through flights, transit, and fieldwork." },
        { title: "Aviation Aluminum Cold-Well", desc: "Conducts cooling evenly around all stored vials, eliminating hot spots." }
      ],
      inclusions: [
        ["1x Digital Peltier Refrigerated Case", "Complete Unit with Internal Aluminum Chamber"],
        ["1x 10,200 mAh Rechargeable Battery", "High-Capacity Lithium-Ion Power Pack"],
        ["1x USB Type-C Fast Charging Cable", "Braided High-Current Power Cable"],
        ["1x Automotive 12V DC Adapter", "In-Vehicle Transport Power Connector"],
        ["1x Padded Ballistic Nylon Travel Bag", "Shock-Absorbing Shoulder Carrying Case"]
      ]
    }
  })
]

export const LAB_SUPPLIES_PRODUCTS = [
  createCatalogProduct({
    id: "pes-syringe-filters-022um",
    title: "0.22 µm PES Syringe Filters (Pack of 50)",
    category: "Laboratory Supplies",
    netContentDisplay: "50 UNITS",
    priceVialOnly: 1850,
    priceVialBac: 1850,
    priceSubqKit: 1850,
    descriptionSummary: "Hydrophilic PES 25mm 0.22 µm syringe filters for cold sterilization of peptide reconstitutions.",
    isHardware: true,
    customVariants: [
      {
        title: "Pack of 50 Filters",
        sku: "PES-FILTERS-50CT",
        pepstack_code: "PESFL",
        price_php: 1850,
        lazada_benchmark_price: 2150,
        options: { "Packaging": "Box of 50", "Inclusion": "Standard Pack" },
        allow_backorder: true,
        manage_inventory: false,
        inventory_quantity: 1000
      }
    ]
  }),
  createCatalogProduct({
    id: "u100-lds-syringes-03ml-100ct",
    title: "U-100 LDS Syringes 0.3 mL 31G (Box of 100)",
    category: "Laboratory Supplies",
    netContentDisplay: "100 UNITS",
    priceVialOnly: 1450,
    priceVialBac: 1450,
    priceSubqKit: 1450,
    descriptionSummary: "Low dead space 0.3 mL micro-barrel U-100 insulin syringes with 31G 5/16\" needle for micro-dosing.",
    isHardware: true,
    customVariants: [
      {
        title: "Box of 100 Syringes",
        sku: "SYR-LDS-03ML-100CT",
        pepstack_code: "SYR03",
        price_php: 1450,
        lazada_benchmark_price: 1750,
        options: { "Packaging": "Box of 100", "Inclusion": "Standard Pack" },
        allow_backorder: true,
        manage_inventory: false,
        inventory_quantity: 1000
      }
    ]
  }),
  createCatalogProduct({
    id: "u100-lds-syringes-05ml-100ct",
    title: "U-100 LDS Syringes 0.5 mL 30G (Box of 100)",
    category: "Laboratory Supplies",
    netContentDisplay: "100 UNITS",
    priceVialOnly: 1450,
    priceVialBac: 1450,
    priceSubqKit: 1450,
    descriptionSummary: "Low dead space 0.5 mL mid-barrel U-100 insulin syringes with 30G 1/2\" needle.",
    isHardware: true,
    customVariants: [
      {
        title: "Box of 100 Syringes",
        sku: "SYR-LDS-05ML-100CT",
        pepstack_code: "SYR05",
        price_php: 1450,
        lazada_benchmark_price: 1750,
        options: { "Packaging": "Box of 100", "Inclusion": "Standard Pack" },
        allow_backorder: true,
        manage_inventory: false,
        inventory_quantity: 1000
      }
    ]
  }),
  createCatalogProduct({
    id: "blunt-fill-filter-needles-18g",
    title: "18G Blunt Fill Filter Needles 5µm (Box of 100)",
    category: "Laboratory Supplies",
    netContentDisplay: "100 UNITS",
    priceVialOnly: 1650,
    priceVialBac: 1650,
    priceSubqKit: 1650,
    descriptionSummary: "18-gauge 1.5\" blunt-fill needles with 5 µm membrane filter for diluent aspiration and transfer.",
    isHardware: true,
    customVariants: [
      {
        title: "Box of 100 Needles",
        sku: "BLUNT-FLT-18G-100CT",
        pepstack_code: "BLN18",
        price_php: 1650,
        lazada_benchmark_price: 1950,
        options: { "Packaging": "Box of 100", "Inclusion": "Standard Pack" },
        allow_backorder: true,
        manage_inventory: false,
        inventory_quantity: 1000
      }
    ]
  }),
  createCatalogProduct({
    id: "sterile-amber-vials-10ml",
    title: "Sterile Amber Vials 10 mL (Pack of 20)",
    category: "Laboratory Supplies",
    netContentDisplay: "20 VIALS",
    priceVialOnly: 1250,
    priceVialBac: 1250,
    priceSubqKit: 1250,
    descriptionSummary: "Pre-sterilized 10 mL Type 1 borosilicate amber glass vials with chlorobutyl rubber stoppers.",
    isHardware: true,
    customVariants: [
      {
        title: "Pack of 20 Vials",
        sku: "VIALS-AMBER-10ML-20CT",
        pepstack_code: "AMB10",
        price_php: 1250,
        lazada_benchmark_price: 1550,
        options: { "Packaging": "Pack of 20", "Inclusion": "Standard Pack" },
        allow_backorder: true,
        manage_inventory: false,
        inventory_quantity: 1000
      }
    ]
  }),
  createCatalogProduct({
    id: "alcohol-prep-swabs-200ct",
    title: "Alcohol Prep Swabs 70% IPA (Box of 200)",
    category: "Laboratory Supplies",
    netContentDisplay: "200 UNITS",
    priceVialOnly: 650,
    priceVialBac: 650,
    priceSubqKit: 650,
    descriptionSummary: "Individually foil-sealed 2-ply non-woven swabs saturated with 70% Isopropyl Alcohol USP.",
    isHardware: true,
    customVariants: [
      {
        title: "Box of 200 Swabs",
        sku: "SWAB-IPA-70-200CT",
        pepstack_code: "SWB70",
        price_php: 650,
        lazada_benchmark_price: 850,
        options: { "Packaging": "Box of 200", "Inclusion": "Standard Pack" },
        allow_backorder: true,
        manage_inventory: false,
        inventory_quantity: 1000
      }
    ]
  }),
  createCatalogProduct({
    id: "bacteriostatic-sodium-chloride-30ml",
    title: "Bacteriostatic 0.9% NaCl (30 mL Multi-Dose Vial)",
    category: "Laboratory Supplies",
    netContentDisplay: "30 ML",
    priceVialOnly: 950,
    priceVialBac: 950,
    priceSubqKit: 950,
    descriptionSummary: "Isotonic 0.9% sodium chloride preserved with 0.9% benzyl alcohol in 30 mL multi-dose vial.",
    isHardware: true,
    customVariants: [
      {
        title: "Single 30 mL Vial",
        sku: "BAC-NACL-30ML-VIAL",
        pepstack_code: "BACNC",
        price_php: 950,
        lazada_benchmark_price: 1200,
        options: { "Volume": "30 mL", "Inclusion": "Single Vial" },
        allow_backorder: true,
        manage_inventory: false,
        inventory_quantity: 1000
      }
    ]
  }),
  createCatalogProduct({
    id: "cold-chain-transport-case",
    title: "Cold-Chain Digital Peltier Cooler Case (2°C–8°C)",
    category: "Laboratory Supplies",
    netContentDisplay: "1 UNIT",
    priceVialOnly: 4950,
    priceVialBac: 4950,
    priceSubqKit: 4950,
    descriptionSummary: "Active semiconductor Peltier refrigeration case with OLED telemetry display for cold-chain peptide transit.",
    isHardware: true,
    customVariants: [
      {
        title: "Complete Cooler Case Kit",
        sku: "COLD-CHAIN-CASE-1UNIT",
        pepstack_code: "CLDCH",
        price_php: 4950,
        lazada_benchmark_price: 5800,
        options: { "Model": "Digital Peltier", "Inclusion": "Complete Kit" },
        allow_backorder: true,
        manage_inventory: false,
        inventory_quantity: 1000
      }
    ]
  })
]
