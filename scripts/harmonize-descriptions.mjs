import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import createJiti from "jiti";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jiti = createJiti(__dirname);
const { getCompoundProtocol, ALL_COMPOUND_PROTOCOLS } = jiti("../apps/storefront/src/lib/data/compound-protocols.ts");

const CATALOG_PATH = path.resolve("apps/backend/data/unified-catalog.json");
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));

function formatMonograph(prod, proto) {
  if (proto && proto.id !== "generic-peptide" && proto.longDescription && proto.longDescription.includes("**What it is:**")) {
    const titleHeader = `<p><strong>${proto.compoundName}</strong> – ${proto.subtitle}</p>`;
    const paragraphs = proto.longDescription
      .split(/\n\n+/)
      .map(p => {
        const cleaned = p.trim().replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return `<p>${cleaned}</p>`;
      })
      .join("");
    return titleHeader + paragraphs;
  }

  // Handle supply items
  if (prod.handle === "bacteriostatic-water") {
    return `<p><strong>Bacteriostatic Water USP</strong> – Sterile Laboratory Diluent Standard</p><p><strong>What it is:</strong> Sterile non-pyrogenic water containing 0.9% (9 mg/mL) benzyl alcohol added as a bacteriostatic preservative, designed specifically for multiple aseptic needle penetrations.</p><p><strong>How it works:</strong> The 0.9% benzyl alcohol preservative inhibits microbial proliferation, ensuring stability and sterility of reconstituted lyophilized research compounds for up to 28 days at 2°C–8°C.</p><p><strong>Why researchers study it:</strong> Universal laboratory diluent for aseptic reconstitution, stoichiometric dilution, and extended refrigeration of peptide standards.</p>`;
  }

  return prod.description;
}

let updated = 0;
for (const prod of catalog) {
  const proto = getCompoundProtocol(prod.handle);
  const newDesc = formatMonograph(prod, proto);
  
  if (newDesc && newDesc !== prod.description) {
    prod.description = newDesc;
    updated++;
    console.log(`[+] Harmonized description for ${prod.title} (${prod.handle})`);
  }
}

fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), "utf-8");
console.log(`\nSuccessfully harmonized ${updated} product descriptions to 3-part monograph standard.`);
