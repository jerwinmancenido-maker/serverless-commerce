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
  })
})
