export type CoaDocumentItem = {
  id: string
  compoundName: string
  officialIupac: string
  casNumber: string
  molecularFormula: string
  molecularWeight: string
  lotNumber: string
  testedDate: string
  testingLab: string
  accreditation: string
  purityDisplay: string
  testType: string
  fileUrl: string
  fileType: "svg" | "pdf" | "image"
  fileSizeBytes: string
  summaryNotes: string
  specifications: {
    appearance: string
    solubility: string
    massAccuracy: string
    bacterialEndotoxin: string
    sterility: string
  }
}

export const COA_DOCUMENTS: CoaDocumentItem[] = [
  {
    id: "ghk-cu-2026b",
    compoundName: "GHK-Cu (Copper Tripeptide-1)",
    officialIupac: "Copper(2+) (2S)-6-amino-2-[[(2S)-2-[[(2S)-2-aminoacetyl]amino]-3-(1H-imidazol-5-yl)propanoyl]amino]hexanoate",
    casNumber: "49557-75-7 / 89030-95-5",
    molecularFormula: "C14H24CuN6O4",
    molecularWeight: "403.93 g/mol",
    lotNumber: "PH8-GHK-2026B",
    testedDate: "February 18, 2026",
    testingLab: "BioAnalytical Reference Standards Facility",
    accreditation: "ISO/IEC 17025:2017 Accredited Laboratory (Reg. #ISO-PH-8821)",
    purityDisplay: "≥99.34% HPLC",
    testType: "Reverse-Phase HPLC (C18, 214nm) & ESI Mass Spectrometry",
    fileUrl: "/coa/ghk-cu-coa.svg",
    fileType: "svg",
    fileSizeBytes: "185 KB",
    summaryNotes: "Single sharp analyte peak at tR = 7.42 min. Verified ESI+ [M+H]+ = 404.01 Da. Endotoxin <0.03 EU/mg. Conforms to USP <71> 14-day membrane filtration sterility.",
    specifications: {
      appearance: "Fine royal blue lyophilized solid (Conforms)",
      solubility: "Clear, particle-free aqueous solution at 20 mg/mL",
      massAccuracy: "Δm = +0.08 Da (Observed: 404.01 Da, Expected: 403.93 Da)",
      bacterialEndotoxin: "<0.03 EU/mg (Specification: <0.10 EU/mg, Pass)",
      sterility: "No microbial growth after 14-day incubation (USP <71> Pass)",
    },
  },
  {
    id: "bpc-157-2026-03",
    compoundName: "BPC-157 (Gastric Pentadecapeptide)",
    officialIupac: "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val acetate",
    casNumber: "137525-51-0",
    molecularFormula: "C62H98N16O22",
    molecularWeight: "1419.53 g/mol",
    lotNumber: "BPC-2026-03",
    testedDate: "March 02, 2026",
    testingLab: "BioAnalytical Reference Standards Facility",
    accreditation: "ISO/IEC 17025:2017 Accredited Laboratory (Reg. #ISO-PH-8821)",
    purityDisplay: "≥99.42% HPLC",
    testType: "Reverse-Phase HPLC (C18, 214nm) & ESI-MS",
    fileUrl: "/coa/bpc-157-coa.svg",
    fileType: "svg",
    fileSizeBytes: "192 KB",
    summaryNotes: "Main Gaussian analyte peak at tR = 8.15 min. Intact monoisotopic mass [M+H]+ observed at 1420.55 Da. Sterility confirmed sterile with zero microbial colonies.",
    specifications: {
      appearance: "White to off-white lyophilized solid (Conforms)",
      solubility: "Clear, colorless aqueous solution in BAC Water at 5 mg/mL",
      massAccuracy: "Δm = +0.02 Da (Observed: 1420.55 Da, Expected: 1420.53 Da)",
      bacterialEndotoxin: "<0.02 EU/mg (Specification: <0.10 EU/mg, Pass)",
      sterility: "No microbial growth detected (USP <71> Pass)",
    },
  },
  {
    id: "tirzepatide-2026-01",
    compoundName: "Tirzepatide (Dual Incretin Co-Agonist)",
    officialIupac: "Synthetic 39-amino-acid peptide with C20 fatty diacid moiety on Lys20",
    casNumber: "2023706-67-7",
    molecularFormula: "C225H348N48O68",
    molecularWeight: "4813.45 g/mol",
    lotNumber: "TZP-2026-01",
    testedDate: "January 24, 2026",
    testingLab: "BioAnalytical Reference Standards Facility",
    accreditation: "ISO/IEC 17025:2017 Accredited Laboratory (Reg. #ISO-PH-8821)",
    purityDisplay: "≥99.51% HPLC",
    testType: "High-Resolution HPLC (C18, 220nm) & Intact Mass Verification",
    fileUrl: "/coa/tirzepatide-coa.svg",
    fileType: "svg",
    fileSizeBytes: "205 KB",
    summaryNotes: "Analyte peak at tR = 11.20 min with 99.51% integrated area under curve (AUC). Deconvoluted ESI mass matches 4814.50 Da [M+H]+.",
    specifications: {
      appearance: "Lyophilized white solid cake (Conforms)",
      solubility: "Freely soluble in BAC Water / 0.9% NaCl buffer at 10 mg/mL",
      massAccuracy: "Δm = +0.05 Da (Observed: 4814.50 Da, Expected: 4814.45 Da)",
      bacterialEndotoxin: "<0.01 EU/mg (Specification: <0.05 EU/mg, Pass)",
      sterility: "Aseptic membrane filtration 14-day incubation sterile (Pass)",
    },
  },
]

export function listCoaDocuments(): CoaDocumentItem[] {
  return COA_DOCUMENTS
}

export function retrieveCoaDocument(id: string): CoaDocumentItem | null {
  if (!id) {
    return null
  }
  const normalized = id.toLowerCase().trim()
  if (!normalized) {
    return null
  }
  return (
    COA_DOCUMENTS.find((doc) => {
      const docId = doc.id.toLowerCase()
      const docLot = doc.lotNumber.toLowerCase()
      const docName = doc.compoundName.toLowerCase()

      return (
        docId === normalized ||
        docLot === normalized ||
        docName.includes(normalized) ||
        normalized.includes(docId) ||
        normalized.includes(docLot) ||
        (normalized.includes("tirz") && docId.startsWith("tirzepatide")) ||
        (normalized.includes("ghk") && docId.startsWith("ghk-cu")) ||
        (normalized.includes("bpc") && docId.startsWith("bpc-157"))
      )
    }) || null
  )
}


