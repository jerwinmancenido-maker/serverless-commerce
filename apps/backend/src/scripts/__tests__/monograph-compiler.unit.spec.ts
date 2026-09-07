import {
  calculateConcentration,
  compileMonographHtml,
  diffPeptidesAndMonograph,
  parseMonographHtml,
  RUO_COMPLIANCE_NOTICE,
  sanitizeHtmlText,
  type PeptidesSkuData,
} from "../monograph-compiler"

describe("monograph-compiler", () => {
  describe("sanitizeHtmlText", () => {
    it("escapes dangerous HTML special characters", () => {
      expect(sanitizeHtmlText('<script>alert("xss")</script>')).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
      )
      expect(sanitizeHtmlText("A & B")).toBe("A &amp; B")
    })

    it("handles null or undefined safely", () => {
      expect(sanitizeHtmlText(null)).toBe("")
      expect(sanitizeHtmlText(undefined)).toBe("")
    })
  })

  describe("calculateConcentration", () => {
    it("calculates exact mg/mL ratio", () => {
      expect(calculateConcentration(10, 2)).toBe("5.0 mg/mL")
      expect(calculateConcentration(5, 1)).toBe("5.0 mg/mL")
      expect(calculateConcentration(15, 3)).toBe("5.0 mg/mL")
    })

    it("handles missing or zero diluent volume safely", () => {
      expect(calculateConcentration(10, 0)).toBe(
        "Standard Analytical Concentration",
      )
      expect(calculateConcentration(null, 2)).toBe(
        "Standard Analytical Concentration",
      )
    })
  })

  describe("compileMonographHtml", () => {
    const sampleSku: PeptidesSkuData = {
      name: "BPC-157",
      dosage: "10MG",
      dosage_mg: 10,
      subtitle: "Stable Gastric Pentadecapeptide",
      molecular: {
        cas: "137525-51-0",
        mw: "1419.53 g/mol",
        formula: "C62H98N16O22",
        sequence: "GEPPPGKPADDAGLV",
        purity: "≥99.0% (HPLC Certified)",
      },
      reconstitution: {
        diluent_ml: 2.0,
        solvent_name: "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      },
      benefits: [
        {
          title: "Tendon & Ligament Healing",
          desc: "Accelerates fibroblast outgrowth.",
        },
      ],
    }

    it("compiles structured data into standard Medusa HTML sections", () => {
      const html = compileMonographHtml(sampleSku)

      expect(html).toContain("<strong>Classification & Category</strong>")
      expect(html).toContain("<strong>Physicochemical & Molecular Specifications</strong>")
      expect(html).toContain("137525-51-0")
      expect(html).toContain("1419.53 g/mol")
      expect(html).toContain("<code>GEPPPGKPADDAGLV</code>")
      expect(html).toContain("<strong>Aseptic Reconstitution & Laboratory Handling Profile</strong>")
      expect(html).toContain("2.0 mL per 10MG (5.0 mg/mL)")
      expect(html).toContain("<strong>Key Analytical Research Observations</strong>")
      expect(html).toContain("Tendon &amp; Ligament Healing")
      expect(html).toContain(RUO_COMPLIANCE_NOTICE)
    })

    it("compiles laboratory supplies into technical labware monograph without lyophilized cake text", () => {
      const supplySku: PeptidesSkuData = {
        name: "50-SLOT VIAL BOX",
        dosage: "50-VIAL CAPACITY",
        category: "Laboratory Supplies",
        is_hardware: true,
        subtitle: "HEAVY-DUTY MEDICAL VIAL STORAGE & COLD-CHAIN ORGANIZER",
        specs: {
          capacity: "50 Standard Laboratory Vials (2.0 mL – 3.0 mL)",
          material: "High-Density Impact-Resistant Cryo Polymer",
          grid_matrix: "10 x 5 Alphanumerically Indexed Compartments",
          temperature_range: "-80°C Deep Freeze to +121°C Autoclave Safe",
        },
        protocol: {
          step1_title: "STEP 1: ALPHANUMERIC INVENTORY INDEXING",
          step1: "Utilize row (A–E) and column (1–10) coordinates to log vial lot numbers.",
          step2_title: "STEP 2: VERTICAL VIAL INSERTION",
          step2: "Insert vials upright into snug-fit grid slots.",
        },
        features: [
          {
            title: "CRYO-GRADE THERMAL STABILITY",
            desc: "Engineered from specialized polymer withstanding -80°C to +121°C.",
          },
        ],
        inclusions: [
          ["1x 50-SLOT VIAL ORGANIZER BOX", "Cryo-Grade High-Density Polymer Case"],
        ],
      }

      const html = compileMonographHtml(supplySku)

      expect(html).toContain("Laboratory Supplies & Precision Labware Standard | Technical Monograph")
      expect(html).toContain("Technical & Material Specifications")
      expect(html).toContain("High-Density Impact-Resistant Cryo Polymer")
      expect(html).toContain("-80°C Deep Freeze to +121°C Autoclave Safe")
      expect(html).toContain("Standard Operating Procedure (SOP)")
      expect(html).toContain("STEP 1: ALPHANUMERIC INVENTORY INDEXING")
      expect(html).toContain("Package Inclusions Manifest")
      expect(html).toContain("1x 50-SLOT VIAL ORGANIZER BOX")
      expect(html).toContain(RUO_COMPLIANCE_NOTICE)

      // Anti-hallucination assertion: NO lyophilized powder cake or syringe dilution instructions
      expect(html).not.toContain("Lyophilized Solid Powder")
      expect(html).not.toContain("Dissolution Technique")
      expect(html).not.toContain("Add diluent slowly down inner glass vial wall")
    })

    it("compiles metered nasal spray into metered nasal atomizer monograph", () => {
      const nasalSku: PeptidesSkuData = {
        name: "ADAMAX 1032",
        dosage: "10MG",
        dosage_mg: 10,
        subtitle: "ADAMANTANE-MODIFIED SEMAX NEUROPEPTIDE",
        administration_route: "nasal",
        kit_type: "nasal",
        pump_output_ml: 0.1,
        bottle_ml: 5.0,
        molecular: {
          cas: "2378396-85-3",
          mw: "1032.20 g/mol",
          sequence: "Ac-MEHFPGP-NH-Ad",
          purity: "≥99.0% (HPLC Certified)",
        },
        reconstitution: {
          bottle_ml: 5.0,
          diluent_ml: 5.0,
          pump_output_ml: 0.1,
          solvent_name: "Sterile 0.9% Sodium Chloride Saline USP",
        },
        benefits: [
          {
            title: "ENHANCED BBB PENETRATION",
            desc: "Facilitates blood-brain barrier transport.",
          },
        ],
      }

      const html = compileMonographHtml(nasalSku)

      expect(html).toContain("Research Grade Metered Nasal Atomizer Standard | Lab Monograph")
      expect(html).toContain("In-Vitro &amp; Intranasal Reference Grade")
      expect(html).toContain("Metered Pump Output:</strong> 0.10 mL per actuation")
      expect(html).toContain("5.0 mL per 10MG")
      expect(html).toContain("Sterile 0.9% Sodium Chloride Saline USP")
      expect(html).toContain("Priming & Mist Technique")
      expect(html).toContain("ENHANCED BBB PENETRATION")
      expect(html).toContain(RUO_COMPLIANCE_NOTICE)
    })

    it("compiles oral compounds into bioavailable oral solution monograph", () => {
      const oralSku: PeptidesSkuData = {
        name: "MK-677",
        dosage: "750MG",
        dosage_mg: 750,
        subtitle: "ORALLY BIOAVAILABLE GHRELIN RECEPTOR AGONIST",
        administration_route: "oral",
        kit_type: "oral",
        molecular: {
          cas: "159752-10-0",
          mw: "624.77 g/mol",
          purity: "≥99.0% (HPLC Certified)",
        },
        reconstitution: {
          diluent_ml: 30.0,
          solvent_name: "Oral Liquid Research Vehicle USP",
          concentration_display: "25.0 mg/mL Bioavailable Solution",
        },
        benefits: [
          {
            title: "100% ORAL BIOAVAILABILITY",
            desc: "Active non-peptidic oral solution.",
          },
        ],
      }

      const html = compileMonographHtml(oralSku)

      expect(html).toContain("Research Grade Bioavailable Oral Solution Standard | Lab Monograph")
      expect(html).toContain("Oral Bioavailable Reference Grade")
      expect(html).toContain("Oral Solution & Dropper Calibration Profile")
      expect(html).toContain("Oral Liquid Research Vehicle USP")
      expect(html).toContain("30.0 mL (25.0 mg/mL Bioavailable Solution)")
      expect(html).toContain("calibrated laboratory dropper")
      expect(html).toContain(RUO_COMPLIANCE_NOTICE)
    })
  })

  describe("parseMonographHtml & diffPeptidesAndMonograph", () => {
    const sampleHtml = `
      <p><strong>BPC-157 10MG – Research Grade Peptide Standard</strong></p>
      <p>• <strong>Chemical Sequence / Formula:</strong> <code>GEPPPGKPADDAGLV</code></p>
      <p>• <strong>CAS Registry Number:</strong> 137525-51-0</p>
      <p>• <strong>Molecular Weight:</strong> 1419.53 g/mol</p>
      <p>• <strong>Target Diluent:</strong> Bacteriostatic Water USP</p>
      <p>• <strong>Standard Reconstitution Ratio:</strong> 2.0 mL per 10MG</p>
    `

    it("extracts fields from HTML monograph correctly", () => {
      const parsed = parseMonographHtml(sampleHtml)
      expect(parsed.cas).toBe("137525-51-0")
      expect(parsed.mw).toBe("1419.53 g/mol")
      expect(parsed.diluentMl).toBe(2.0)
      expect(parsed.solvent).toBe("Bacteriostatic Water USP")
      expect(parsed.sequence).toBe("GEPPPGKPADDAGLV")
      expect(parsed.route).toBe("subq")
    })

    it("detects no differences when fields match", () => {
      const data: PeptidesSkuData = {
        name: "BPC-157",
        dosage: "10MG",
        molecular: { cas: "137525-51-0", mw: "1419.53 g/mol" },
        reconstitution: { diluent_ml: 2.0, solvent_name: "Bacteriostatic Water USP" },
      }
      const diff = diffPeptidesAndMonograph("bpc-157", data, sampleHtml)
      expect(diff.hasChanges).toBe(false)
      expect(diff.differences).toHaveLength(0)
    })

    it("flags changes when diluent or CAS number differs", () => {
      const updatedData: PeptidesSkuData = {
        name: "BPC-157",
        dosage: "10MG",
        molecular: { cas: "137525-51-0", mw: "1419.53 g/mol" },
        reconstitution: { diluent_ml: 2.5, solvent_name: "Bacteriostatic Water USP" }, // changed to 2.5 mL
      }
      const diff = diffPeptidesAndMonograph("bpc-157", updatedData, sampleHtml)
      expect(diff.hasChanges).toBe(true)
      expect(diff.differences).toHaveLength(1)
      expect(diff.differences[0].field).toBe("Diluent Volume")
      expect(diff.differences[0].currentValue).toBe("2 mL")
      expect(diff.differences[0].newValue).toBe("2.5 mL")
    })

    it("flags route difference when nasal compound has subq monograph", () => {
      const nasalData: PeptidesSkuData = {
        name: "Adamax",
        dosage: "10MG",
        administration_route: "nasal",
        kit_type: "nasal",
        pump_output_ml: 0.1,
      }
      const diff = diffPeptidesAndMonograph("adamax-1032", nasalData, sampleHtml)
      expect(diff.hasChanges).toBe(true)
      const routeDiff = diff.differences.find((d) => d.field === "Delivery Route / Classification")
      expect(routeDiff).toBeDefined()
      expect(routeDiff?.currentValue).toBe("subq")
      expect(routeDiff?.newValue).toBe("nasal")
    })

    it("flags route difference when supply item has subq monograph", () => {
      const supplyData: PeptidesSkuData = {
        name: "50-Slot Vial Box",
        dosage: "50-VIAL",
        category: "Laboratory Supplies",
        is_hardware: true,
      }
      const diff = diffPeptidesAndMonograph("50-slot-vial-organizer-box", supplyData, sampleHtml)
      expect(diff.hasChanges).toBe(true)
      const routeDiff = diff.differences.find((d) => d.field === "Delivery Route / Classification")
      expect(routeDiff).toBeDefined()
      expect(routeDiff?.currentValue).toBe("subq")
      expect(routeDiff?.newValue).toBe("supplies")
    })
  })
})

