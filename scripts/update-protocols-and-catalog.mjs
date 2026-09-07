import fs from "fs";
import path from "path";

// 1. Purge Purity claims from unified-catalog.json
const catalogPath = path.resolve("apps/backend/data/unified-catalog.json");
if (fs.existsSync(catalogPath)) {
  let catalogRaw = fs.readFileSync(catalogPath, "utf8");
  const beforeCount = (catalogRaw.match(/<p>• <strong>HPLC Chromatographic Purity:<\/strong>[^<]*<\/p>/g) || []).length;
  catalogRaw = catalogRaw.replace(/<p>• <strong>HPLC Chromatographic Purity:<\/strong>[^<]*<\/p>/g, "");
  fs.writeFileSync(catalogPath, catalogRaw, "utf8");
  console.log(`[unified-catalog.json] Removed ${beforeCount} HPLC Purity claims.`);
}

// 2. Process all-compound-protocols.json
const protocolsJsonPath = path.resolve("apps/backend/data/all-compound-protocols.json");
if (fs.existsSync(protocolsJsonPath)) {
  let protocolsRaw = fs.readFileSync(protocolsJsonPath, "utf8");
  let protocols = JSON.parse(protocolsRaw);

  protocols = protocols.map((p) => {
    // Delete purityStandard
    delete p.purityStandard;

    // Standardize mcg to mg in metabolic / incretin dosing
    const isMetabolic = p.category === "Metabolic Signaling & Incretins" || 
      ["tirzepatide", "semaglutide", "retatrutide", "cagrilintide"].some(k => p.id.toLowerCase().includes(k));

    if (isMetabolic && p.dosing && Array.isArray(p.dosing.titrationSteps)) {
      p.dosing.titrationSteps = p.dosing.titrationSteps.map((step) => {
        // Strip (XXXX mcg) or (XXXXX mcg) from doseDisplay
        let display = step.doseDisplay.replace(/\s*\(\d+\s*mcg\)/gi, "");
        return {
          ...step,
          doseDisplay: display,
        };
      });
      if (p.dosing.standardDoseDisplay) {
        p.dosing.standardDoseDisplay = p.dosing.standardDoseDisplay.replace(/\s*\(\d+\s*mcg\)/gi, "");
      }
    }

    return p;
  });

  fs.writeFileSync(protocolsJsonPath, JSON.stringify(protocols, null, 2), "utf8");
  console.log(`[all-compound-protocols.json] Updated ${protocols.length} protocols: removed purityStandard and cleaned incretin mcg display.`);
}

// 3. Process category files in apps/storefront/src/lib/data/compound-protocols/
const categoryFiles = [
  "category-1-tissue-repair.ts",
  "category-2-metabolic.ts",
  "category-3-gh-axis.ts",
  "category-4-longevity.ts",
  "category-5-neuro.ts",
  "category-6-immune-sexual.ts",
  "category-7-blends.ts",
];

for (const file of categoryFiles) {
  const filePath = path.resolve("apps/storefront/src/lib/data/compound-protocols", file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf8");

  // Remove "purityStandard": "...", lines
  content = content.replace(/\s*"purityStandard":\s*"[^"]*",?\n?/g, "\n");

  // For category-2-metabolic.ts, clean up "(XXXX mcg)" in doseDisplay
  if (file === "category-2-metabolic.ts") {
    content = content.replace(/"doseDisplay":\s*"([^"]+)\s*\(\d+\s*mcg\)"/g, '"doseDisplay": "$1"');
    content = content.replace(/"standardDoseDisplay":\s*"([^"]+)\s*\(\d+\s*mcg\)"/g, '"standardDoseDisplay": "$1"');
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`[${file}] Cleaned purityStandard and units.`);
}

console.log("Data updates completed successfully.");
