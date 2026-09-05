import fs from "fs";
import path from "path";

const SCRAPED_DIR = path.resolve("apps/backend/data/scraped");
const STATIC_CATALOG_DIR = path.resolve("apps/backend/static/catalog");
fs.mkdirSync(STATIC_CATALOG_DIR, { recursive: true });

const lazadaProducts = JSON.parse(fs.readFileSync(path.join(SCRAPED_DIR, "lazada-products.json"), "utf-8"));
const pepstackProducts = JSON.parse(fs.readFileSync(path.join(SCRAPED_DIR, "pepstack-products.json"), "utf-8"));
const pepstackCoas = JSON.parse(fs.readFileSync(path.join(SCRAPED_DIR, "pepstack-coas.json"), "utf-8"));
const pepstackDosing = JSON.parse(fs.readFileSync(path.join(SCRAPED_DIR, "pepstack-dosing.json"), "utf-8"));
const pepstackComponents = JSON.parse(fs.readFileSync(path.join(SCRAPED_DIR, "pepstack-components.json"), "utf-8"));
const pepstackCompVariants = JSON.parse(fs.readFileSync(path.join(SCRAPED_DIR, "pepstack-component-variants.json"), "utf-8"));

const PHOTO_STAGING_DIR = "/Users/m5/Projects/Peptides/pepstack-photo-refresh/staging";
const PHOTO_LIBRARY_PEPSTACK = "/Users/m5/Projects/Peptides/START HERE - Photo Libraries/PepStack Photo Library";
const PHOTO_LIBRARY_RESEARCH = "/Users/m5/Projects/Peptides/START HERE - Photo Libraries/Research Compound Photo Library";

// 46 Individual Peptide Research Compounds + 1 Bacteriostatic Water = 47 Total Products
// Pure product names only (zero SEO fluff)
const COMPOUND_RULES = [
  // 1. Metabolic / Weight Management Peptides
  {
    canonicalName: "5-Amino-1MQ",
    handle: "5-amino-1mq",
    code: "50AM",
    category: "metabolic-weight-management-peptides",
    defaultStrength: "50MG",
    photoFolders: ["50AM", "5-AMINO-1MQ"],
    matchers: ["5-amino", "5 amino", "50am"]
  },
  {
    canonicalName: "AOD-9604",
    handle: "aod-9604",
    code: "AOD5",
    category: "metabolic-weight-management-peptides",
    defaultStrength: "5MG",
    photoFolders: ["AOD5", "AOD-9604", "AOD9604"],
    matchers: ["aod-9604", "aod 9604", "aod9604"]
  },
  {
    canonicalName: "Cagrilintide",
    handle: "cagrilintide",
    code: "CGL5",
    category: "metabolic-weight-management-peptides",
    defaultStrength: "5MG",
    photoFolders: ["CGL5", "CGL10", "Cagrilintide"],
    matchers: ["cagrilintide", "cgl5"]
  },
  {
    canonicalName: "Lemon Bottle",
    handle: "lemon-bottle",
    code: "LB10",
    category: "metabolic-weight-management-peptides",
    defaultStrength: "10ML",
    photoFolders: ["LEMON BOTTLE"],
    matchers: ["lemon bottle"]
  },
  {
    canonicalName: "Lipo-C + B12",
    handle: "lipo-c-b12",
    code: "LPC",
    category: "metabolic-weight-management-peptides",
    defaultStrength: "10ML",
    photoFolders: ["LIPO-C"],
    matchers: ["lipo-c", "lipo c"]
  },
  {
    canonicalName: "MOTS-C",
    handle: "mots-c",
    code: "MS10",
    category: "metabolic-weight-management-peptides",
    defaultStrength: "10MG",
    photoFolders: ["MS10", "MOTSC10", "MOTS-C"],
    matchers: ["mots-c", "mots c"]
  },
  {
    canonicalName: "Retatrutide",
    handle: "retatrutide",
    code: "RTT",
    category: "metabolic-weight-management-peptides",
    defaultStrength: "10MG",
    photoFolders: ["RTT", "Retatrutide", "RT10", "R10"],
    matchers: ["retatrutide", "reta lyophilized"]
  },
  {
    canonicalName: "RTT60",
    handle: "rtt60",
    code: "RTT60",
    category: "metabolic-weight-management-peptides",
    defaultStrength: "60MG",
    photoFolders: ["RTT60"],
    matchers: ["rtt60", "reta-trutide blend"]
  },
  {
    canonicalName: "Semaglutide",
    handle: "semaglutide",
    code: "SM5",
    category: "metabolic-weight-management-peptides",
    defaultStrength: "5MG",
    photoFolders: ["Semaglutide", "SM5"],
    matchers: ["semaglutide"]
  },
  {
    canonicalName: "Tirzepatide",
    handle: "tirzepatide",
    code: "TR",
    category: "metabolic-weight-management-peptides",
    defaultStrength: "10MG",
    photoFolders: ["Tirzepatide", "TR", "TR10"],
    matchers: ["tirzepatide", "tr – meta-bolic"]
  },

  // 2. Healing & Tissue Repair Peptides
  {
    canonicalName: "ARA-290",
    handle: "ara-290",
    code: "RA16",
    category: "healing-tissue-repair-peptides",
    defaultStrength: "16MG",
    photoFolders: ["RA16", "ARA290", "ARA-290"],
    matchers: ["ara-290", "ara 290", "ara290"]
  },
  {
    canonicalName: "BPC-157",
    handle: "bpc-157-vial",
    code: "BPC10",
    category: "healing-tissue-repair-peptides",
    defaultStrength: "10MG",
    photoFolders: ["BPC10", "BPC-157"],
    matchers: ["bpc-157", "bpc 157", "bpc157", "bpc10"]
  },

  // 3. Cognitive & Neuroprotective Peptides
  {
    canonicalName: "ADAMAX 1032",
    handle: "adamax-1032",
    code: "AD5",
    category: "cognitive-neuroprotective-peptides",
    defaultStrength: "10MG",
    photoFolders: ["AD5", "ADAMAX 1032", "ADAMAX"],
    matchers: ["adamax"]
  },
  {
    canonicalName: "DIHEXA",
    handle: "dihexa",
    code: "DH10",
    category: "cognitive-neuroprotective-peptides",
    defaultStrength: "10MG",
    photoFolders: ["DH10", "Dihexa", "DIHEXA"],
    matchers: ["dihexa"]
  },
  {
    canonicalName: "PE-22-28",
    handle: "pe-22-28",
    code: "P41",
    category: "cognitive-neuroprotective-peptides",
    defaultStrength: "5MG",
    photoFolders: ["P41", "PE-22-28"],
    matchers: ["pe 22 28", "pe-22-28", "pe2228"]
  },
  {
    canonicalName: "Pinealon",
    handle: "pinealon",
    code: "PIN10",
    category: "cognitive-neuroprotective-peptides",
    defaultStrength: "10MG",
    photoFolders: ["PIN10", "Pinealon"],
    matchers: ["pinealon"]
  },
  {
    canonicalName: "Selank",
    handle: "selank",
    code: "2S10",
    category: "cognitive-neuroprotective-peptides",
    defaultStrength: "10MG",
    photoFolders: ["2S10", "Selank"],
    matchers: ["selank – neuroregulatory", "selank"],
    excludeMatchers: ["semax", "xs20", "combo", "blend"]
  },
  {
    canonicalName: "Semax",
    handle: "semax",
    code: "SX10",
    category: "cognitive-neuroprotective-peptides",
    defaultStrength: "10MG",
    photoFolders: ["Semax", "SX10"],
    matchers: ["semax – cognitive", "semax"],
    excludeMatchers: ["selank", "xs20", "combo", "blend", "adamax"]
  },
  {
    canonicalName: "Selank + Semax Combo",
    handle: "selank-semax-combo",
    code: "SSCOMBO",
    category: "cognitive-neuroprotective-peptides",
    defaultStrength: "20MG",
    photoFolders: ["Selank + Semax", "XS20"],
    matchers: ["selank + semax combo", "xs20 semax + selank blend"]
  },

  // 4. Growth Hormone & Recovery Peptides
  {
    canonicalName: "CJC-1295 + Ipamorelin",
    handle: "cjc-1295-ipamorelin",
    code: "CP10",
    category: "growth-hormone-recovery-peptides",
    defaultStrength: "10MG",
    photoFolders: ["CP10", "CJC-1295 + Ipamorelin"],
    matchers: ["cjc-1295", "cjc 1295", "cp10"]
  },
  {
    canonicalName: "GHRP-2",
    handle: "ghrp-2",
    code: "G210",
    category: "growth-hormone-recovery-peptides",
    defaultStrength: "10MG",
    photoFolders: ["GHRP2", "GHRP-2"],
    matchers: ["ghrp-2", "ghrp 2"]
  },
  {
    canonicalName: "GHRP-6",
    handle: "ghrp-6",
    code: "G610",
    category: "growth-hormone-recovery-peptides",
    defaultStrength: "10MG",
    photoFolders: ["GHRP6", "GHRP-6"],
    matchers: ["ghrp-6", "ghrp 6"]
  },
  {
    canonicalName: "HGH",
    handle: "hgh-somatropin",
    code: "HGH24",
    category: "growth-hormone-recovery-peptides",
    defaultStrength: "24IU",
    photoFolders: ["HGH24", "HGH"],
    matchers: ["hgh – growth hormone", "somatropin", "hgh"]
  },
  {
    canonicalName: "IGF-1 LR3",
    handle: "igf-1-lr3",
    code: "IGF1",
    category: "growth-hormone-recovery-peptides",
    defaultStrength: "1MG",
    photoFolders: ["IGF-1 LR3", "IGF1"],
    matchers: ["igf-1 lr3", "igf 1 lr3"]
  },
  {
    canonicalName: "IGF-DES",
    handle: "igf-des",
    code: "IGFDES",
    category: "growth-hormone-recovery-peptides",
    defaultStrength: "2MG",
    photoFolders: ["IGF-DES", "IGFDES"],
    matchers: ["igf-des", "igf des"]
  },
  {
    canonicalName: "Ipamorelin",
    handle: "ipamorelin",
    code: "IPA10",
    category: "growth-hormone-recovery-peptides",
    defaultStrength: "10MG",
    photoFolders: ["IPA10", "Ipamorelin"],
    matchers: ["ipamorelin 10mg", "ipamorelin"],
    excludeMatchers: ["cjc", "ti15"]
  },
  {
    canonicalName: "Tesamorelin",
    handle: "tesamorelin",
    code: "TR10",
    category: "growth-hormone-recovery-peptides",
    defaultStrength: "10MG",
    photoFolders: ["TR10", "Tesamorelin"],
    matchers: ["tesamorelin 10mg", "tesamorelin"],
    excludeMatchers: ["ti15", "ipamorelin"]
  },
  {
    canonicalName: "TI15",
    handle: "ti15",
    code: "TI15",
    category: "growth-hormone-recovery-peptides",
    defaultStrength: "15MG",
    photoFolders: ["TI15"],
    matchers: ["ti15"]
  },

  // 5. Longevity & Cellular Health Peptides
  {
    canonicalName: "AICAR",
    handle: "aicar",
    code: "AR100",
    category: "longevity-cellular-health-peptides",
    defaultStrength: "100MG",
    photoFolders: ["AR100", "AICAR100", "AICAR"],
    matchers: ["aicar"]
  },
  {
    canonicalName: "Epithalon",
    handle: "epithalon",
    code: "ET10",
    category: "longevity-cellular-health-peptides",
    defaultStrength: "10MG",
    photoFolders: ["ET10", "Epithalon"],
    matchers: ["epithalon"],
    excludeMatchers: ["bundle"]
  },
  {
    canonicalName: "Glutathione",
    handle: "glutathione-1500mg",
    code: "GTT1500",
    category: "longevity-cellular-health-peptides",
    defaultStrength: "1500MG",
    photoFolders: ["GTT1500", "GLUTA1500"],
    matchers: ["glutathione", "gtt"],
    excludeMatchers: ["bundle"]
  },
  {
    canonicalName: "NAD+",
    handle: "nad-plus-500mg",
    code: "NAD500",
    category: "longevity-cellular-health-peptides",
    defaultStrength: "500MG",
    photoFolders: ["NAD500", "NADB500", "NAD+"],
    matchers: ["nad+ buffered", "nad+ 500mg lyophilized", "nad+"],
    excludeMatchers: ["bundle"]
  },
  {
    canonicalName: "SS-31",
    handle: "ss-31",
    code: "SS10",
    category: "longevity-cellular-health-peptides",
    defaultStrength: "10MG",
    photoFolders: ["SS-31", "SS31"],
    matchers: ["ss-31", "ss 31", "ss31"]
  },

  // 6. Skin, Hair & Cosmetic Peptides
  {
    canonicalName: "CUV100",
    handle: "cuv100-ghk-cu-kpv",
    code: "BBGK",
    category: "skin-hair-cosmetic-peptides",
    defaultStrength: "100MG",
    photoFolders: ["BBGK", "CUV100"],
    matchers: ["cuv100", "gkh-cu 50 mg + kpv", "ghk-cu 50mg + kpv"]
  },
  {
    canonicalName: "GHK-Cu",
    handle: "ghk-cu",
    code: "GHKCU",
    category: "skin-hair-cosmetic-peptides",
    defaultStrength: "50MG",
    photoFolders: ["GHK-CU", "GHKCU", "GHK50", "GHK100"],
    matchers: ["ghk-cu", "ghk cu"],
    excludeMatchers: ["serum", "cuv100", "klow80", "glow70", "bundle"]
  },
  {
    canonicalName: "GHK-Cu Anti-Aging Serum",
    handle: "ghk-cu-anti-aging-serum",
    code: "GHK-SERUM",
    category: "skin-hair-cosmetic-peptides",
    defaultStrength: "30ML",
    photoFolders: ["GHK-CU Anti-Aging Serum"],
    matchers: ["ghk-cu anti-aging serum"]
  },
  {
    canonicalName: "GLOW70",
    handle: "glow70",
    code: "GLOW70",
    category: "skin-hair-cosmetic-peptides",
    defaultStrength: "70MG",
    photoFolders: ["GLOW70"],
    matchers: ["glow70", "bbg70"]
  },
  {
    canonicalName: "SNAP-8",
    handle: "snap-8",
    code: "SN10",
    category: "skin-hair-cosmetic-peptides",
    defaultStrength: "10MG",
    photoFolders: ["SNAP-8", "SNAP8"],
    matchers: ["snap-8", "snap 8", "snap8"]
  },

  // 7. Immune & Inflammation Peptides
  {
    canonicalName: "KLOW80",
    handle: "klow80",
    code: "KLOW80",
    category: "immune-inflammation-research-peptides",
    defaultStrength: "80MG",
    photoFolders: ["KLOW80"],
    matchers: ["klow80"]
  },
  {
    canonicalName: "KPV",
    handle: "kpv",
    code: "KP10",
    category: "immune-inflammation-research-peptides",
    defaultStrength: "10MG",
    photoFolders: ["KP10", "KPV10", "KPV"],
    matchers: ["kpv 10mg", "kpv"],
    excludeMatchers: ["cuv100", "klow80"]
  },
  {
    canonicalName: "Thymosin Alpha-1",
    handle: "thymosin-alpha-1",
    code: "TA1",
    category: "immune-inflammation-research-peptides",
    defaultStrength: "10MG",
    photoFolders: ["Thymosin Alpha 1", "TA1"],
    matchers: ["thymosin alpha"]
  },

  // 8. Sexual & Reproductive Peptides
  {
    canonicalName: "HCG",
    handle: "hcg",
    code: "HCG5000",
    category: "sexual-reproductive-research-peptides",
    defaultStrength: "10000IU",
    photoFolders: ["HCG"],
    matchers: ["hcg", "hgc 10000", "gona-drophin"]
  },
  {
    canonicalName: "HMG",
    handle: "hmg-75iu",
    code: "HMG75",
    category: "sexual-reproductive-research-peptides",
    defaultStrength: "75IU",
    photoFolders: ["HMG"],
    matchers: ["hmg 75iu", "hmg"]
  },
  {
    canonicalName: "Kisspeptin-10",
    handle: "kisspeptin-10",
    code: "KS10",
    category: "sexual-reproductive-research-peptides",
    defaultStrength: "10MG",
    photoFolders: ["KS10", "Kisspeptin"],
    matchers: ["kisspeptin-10", "kisspeptin"]
  },
  {
    canonicalName: "PT-141",
    handle: "pt-141",
    code: "PT10",
    category: "sexual-reproductive-research-peptides",
    defaultStrength: "10MG",
    photoFolders: ["PT-141", "PT141"],
    matchers: ["pt-141", "pt 141", "bremelanotide"]
  },

  // 9. Sleep & Circadian Peptides
  {
    canonicalName: "DSIP",
    handle: "dsip",
    code: "DS5",
    category: "sleep-circadian-research-peptides",
    defaultStrength: "5MG",
    photoFolders: ["DS5", "DSIP"],
    matchers: ["dsip"]
  },

  // 10. Diluents & Laboratory Supplies / Accessories
  {
    canonicalName: "Bacteriostatic Water",
    handle: "bacteriostatic-water",
    code: "BAC",
    category: "research-supplies-accessories",
    defaultStrength: "10ML",
    photoFolders: ["BAC", "BAC WATER"],
    matchers: ["bacteriostatic water", "bac water"]
  },
  {
    canonicalName: "Peptide Reconstitution Set",
    handle: "peptide-reconstitution-set",
    code: "SYR-KIT",
    category: "research-supplies-accessories",
    defaultStrength: "Standard",
    photoFolders: ["peptide-reconstitution-set", "RECONSTITUTION SET"],
    matchers: ["peptide reconstitution set", "sterile mixing kit", "reconstitution set"]
  },
  {
    canonicalName: "Reusable Metal Insulin Pen",
    handle: "reusable-metal-insulin-pen",
    code: "INS-PEN",
    category: "research-supplies-accessories",
    defaultStrength: "Standard",
    photoFolders: ["reusable-insulin-pen", "reusable-metal-insulin-pen", "INSULIN PEN"],
    matchers: ["reusable metal insulin pen", "reusable insulin pen", "precision dosing device"]
  },
  {
    canonicalName: "50-Slot Vial Organizer Box",
    handle: "50-slot-vial-organizer-box",
    code: "BOX-3ML",
    category: "research-supplies-accessories",
    defaultStrength: "50-Slot",
    photoFolders: ["vial-organizer-box-3ml", "50-slot-vial-organizer-box", "VIAL ORGANIZER"],
    matchers: ["50-slot 3ml vial organizer box", "50-slot", "storage case for 3ml vials"]
  },
  {
    canonicalName: "Custom Mixed Vial Organizer Box",
    handle: "custom-mixed-vial-organizer-box",
    code: "BOX-MIX",
    category: "research-supplies-accessories",
    defaultStrength: "Multi-Size",
    photoFolders: ["vial-organizer-box-3ml", "custom-mixed-vial-organizer-box", "VIAL ORGANIZER"],
    matchers: ["custom mixed vial organizer box", "multi-size grid storage case"]
  },
  {
    canonicalName: "Clear Nasal Spray Bottles",
    handle: "clear-nasal-spray-bottles",
    code: "NSB",
    category: "research-supplies-accessories",
    defaultStrength: "10ML",
    photoFolders: ["nasal-spray-bottles", "clear-nasal-spray-bottles", "NASAL SPRAY BOTTLE"],
    matchers: ["clear nasal spray bottles", "nasal spray bottles"]
  },

  // 11. Multi-Compound Research Bundles (Curated Synergy Stacks)
  {
    canonicalName: "GHK-Cu + Glutathione Bundle",
    handle: "ghk-cu-glutathione-bundle",
    code: "BNDL-GG",
    category: "multi-compound-research-bundles",
    isBundle: true,
    bundleSpec: {
      components: [
        { handle: "ghk-cu", title: "GHK-Cu", strength: "100MG", quantity: 1, individualPrice: 1170 },
        { handle: "glutathione-1500mg", title: "Glutathione", strength: "1500MG", quantity: 1, individualPrice: 1620 }
      ],
      sumPrice: 2790,
      bundlePrice: 2500,
      savingsAmount: 290
    },
    defaultStrength: "100MG + 1500MG",
    photoFolders: ["ghk-cu-glutathione-bundle"],
    matchers: ["ghk cu 100mg glutathione 1500mg bundle", "ghk cu 100mg glutathione"]
  },
  {
    canonicalName: "Epithalon + Glutathione Bundle",
    handle: "epithalon-glutathione-bundle",
    code: "BNDL-EG",
    category: "multi-compound-research-bundles",
    isBundle: true,
    bundleSpec: {
      components: [
        { handle: "epithalon", title: "Epithalon", strength: "10MG", quantity: 1, individualPrice: 1440 },
        { handle: "glutathione-1500mg", title: "Glutathione", strength: "1500MG", quantity: 1, individualPrice: 1620 }
      ],
      sumPrice: 3060,
      bundlePrice: 2700,
      savingsAmount: 360
    },
    defaultStrength: "10MG + 1500MG",
    photoFolders: ["epithalon-glutathione-bundle"],
    matchers: ["epithalon 10mg + glutathione 1500mg peptide bundle", "epithalon 10mg + glutathione"]
  },
  {
    canonicalName: "Epithalon + Glutathione + NAD+ Bundle",
    handle: "epithalon-glutathione-nad-bundle",
    code: "BNDL-EGN",
    category: "multi-compound-research-bundles",
    isBundle: true,
    bundleSpec: {
      components: [
        { handle: "epithalon", title: "Epithalon", strength: "10MG", quantity: 1, individualPrice: 1440 },
        { handle: "glutathione-1500mg", title: "Glutathione", strength: "1500MG", quantity: 1, individualPrice: 1620 },
        { handle: "nad-plus-500mg", title: "NAD+", strength: "500MG", quantity: 1, individualPrice: 1620 }
      ],
      sumPrice: 4680,
      bundlePrice: 3960,
      savingsAmount: 720
    },
    defaultStrength: "10MG + 1500MG + 500MG",
    photoFolders: ["epithalon-glutathione-nad-bundle"],
    matchers: ["epithalon 10mg + glutathione 1500mg + nad+ 500mg"]
  },
  {
    canonicalName: "Glutathione + NAD+ + GHK-Cu Bundle",
    handle: "glutathione-nad-ghk-cu-bundle",
    code: "BNDL-GNG",
    category: "multi-compound-research-bundles",
    isBundle: true,
    bundleSpec: {
      components: [
        { handle: "glutathione-1500mg", title: "Glutathione", strength: "1500MG", quantity: 1, individualPrice: 1620 },
        { handle: "nad-plus-500mg", title: "NAD+", strength: "500MG", quantity: 1, individualPrice: 1620 },
        { handle: "ghk-cu", title: "GHK-Cu", strength: "100MG", quantity: 1, individualPrice: 1170 }
      ],
      sumPrice: 4410,
      bundlePrice: 3950,
      savingsAmount: 460
    },
    defaultStrength: "1500MG + 500MG + 100MG",
    photoFolders: ["glutathione-nad-ghk-cu-bundle"],
    matchers: ["glutathione 1500mg + nad+ 500mg + ghk-cu 100mg"]
  },
  {
    canonicalName: "NAD+ + GHK-Cu Bundle",
    handle: "nad-ghk-cu-bundle",
    code: "BNDL-NG",
    category: "multi-compound-research-bundles",
    isBundle: true,
    bundleSpec: {
      components: [
        { handle: "nad-plus-500mg", title: "NAD+", strength: "500MG", quantity: 1, individualPrice: 1620 },
        { handle: "ghk-cu", title: "GHK-Cu", strength: "100MG", quantity: 1, individualPrice: 1170 }
      ],
      sumPrice: 2790,
      bundlePrice: 2500,
      savingsAmount: 290
    },
    defaultStrength: "500MG + 100MG",
    photoFolders: ["nad-ghk-cu-bundle"],
    matchers: ["nad+ 500mg + ghk-cu 100mg peptide bundle", "nad+ 500mg + ghk-cu"]
  }
];

function resolveLocalPhotos(rule, matchedPepStack) {
  const images = [];
  const targetFolder = path.join(STATIC_CATALOG_DIR, rule.handle);
  fs.mkdirSync(targetFolder, { recursive: true });

  // 0. Check if targetFolder already has photos
  const existingFiles = fs.readdirSync(targetFolder).filter(x => x.startsWith("photo") && (x.endsWith(".png") || x.endsWith(".jpg") || x.endsWith(".jpeg"))).sort();
  if (existingFiles.length > 0) {
    for (const file of existingFiles) {
      images.push(`http://localhost:9000/static/catalog/${rule.handle}/${file}`);
      if (images.length >= 4) break;
    }
    return images;
  }

  // 0b. Check if another folder in STATIC_CATALOG_DIR has photos (e.g. from previous run or alias)
  for (const f of rule.photoFolders) {
    const staticAlias = path.join(STATIC_CATALOG_DIR, f);
    if (fs.existsSync(staticAlias)) {
      const aliasFiles = fs.readdirSync(staticAlias).filter(x => (x.endsWith(".png") || x.endsWith(".jpg") || x.endsWith(".jpeg"))).sort();
      if (aliasFiles.length > 0) {
        for (const file of aliasFiles) {
          const src = path.join(staticAlias, file);
          const destFileName = `photo${images.length + 1}${path.extname(file)}`;
          const dest = path.join(targetFolder, destFileName);
          fs.copyFileSync(src, dest);
          images.push(`http://localhost:9000/static/catalog/${rule.handle}/${destFileName}`);
          if (images.length >= 4) break;
        }
        if (images.length > 0) return images;
      }
    }
  }

  // 1. Check staging first
  for (const f of rule.photoFolders) {
    const stagingPath = path.join(PHOTO_STAGING_DIR, f);
    if (fs.existsSync(stagingPath)) {
      const files = fs.readdirSync(stagingPath);
      const sorted = files.filter(x => x.endsWith(".png") || x.endsWith(".jpg") || x.endsWith(".jpeg")).sort((a, b) => {
        if (a.includes("v2") && !b.includes("v2")) return -1;
        if (!a.includes("v2") && b.includes("v2")) return 1;
        return a.localeCompare(b);
      });
      for (const file of sorted) {
        const src = path.join(stagingPath, file);
        const destFileName = `photo${images.length + 1}${path.extname(file)}`;
        const dest = path.join(targetFolder, destFileName);
        fs.copyFileSync(src, dest);
        images.push(`http://localhost:9000/static/catalog/${rule.handle}/${destFileName}`);
        if (images.length >= 4) break;
      }
      if (images.length > 0) break;
    }
  }

  // 2. Fallback to PepStack photo library
  if (images.length === 0) {
    for (const f of rule.photoFolders) {
      const p1 = path.join(PHOTO_LIBRARY_PEPSTACK, f, "Photos");
      const p2 = path.join(PHOTO_LIBRARY_PEPSTACK, f);
      const searchPath = fs.existsSync(p1) ? p1 : (fs.existsSync(p2) ? p2 : null);
      if (searchPath) {
        const files = fs.readdirSync(searchPath).filter(x => x.endsWith(".jpg") || x.endsWith(".png") || x.endsWith(".jpeg"));
        for (const file of files) {
          const src = path.join(searchPath, file);
          const destFileName = `photo${images.length + 1}${path.extname(file)}`;
          const dest = path.join(targetFolder, destFileName);
          fs.copyFileSync(src, dest);
          images.push(`http://localhost:9000/static/catalog/${rule.handle}/${destFileName}`);
          if (images.length >= 4) break;
        }
        if (images.length > 0) break;
      }
    }
  }

  // 3. Fallback to Research Compound photo library
  if (images.length === 0) {
    for (const f of rule.photoFolders) {
      const p1 = path.join(PHOTO_LIBRARY_RESEARCH, f, "Photos");
      const p2 = path.join(PHOTO_LIBRARY_RESEARCH, f);
      const searchPath = fs.existsSync(p1) ? p1 : (fs.existsSync(p2) ? p2 : null);
      if (searchPath) {
        const files = fs.readdirSync(searchPath).filter(x => x.endsWith(".jpg") || x.endsWith(".png") || x.endsWith(".jpeg"));
        for (const file of files) {
          const src = path.join(searchPath, file);
          const destFileName = `photo${images.length + 1}${path.extname(file)}`;
          const dest = path.join(targetFolder, destFileName);
          fs.copyFileSync(src, dest);
          images.push(`http://localhost:9000/static/catalog/${rule.handle}/${destFileName}`);
          if (images.length >= 4) break;
        }
        if (images.length > 0) break;
      }
    }
  }

  return images;
}

function parseVariantOptions(rule, productTitle, variantName) {
  const v = (variantName || "").trim();

  // Handle Accessories
  if (rule.handle === "peptide-reconstitution-set") {
    return { net: "Standard", inc: "Sterile Mixing Kit" };
  }
  if (rule.handle === "reusable-metal-insulin-pen") {
    return { net: "Standard", inc: "Complete Set with Cartridge" };
  }
  if (rule.handle === "50-slot-vial-organizer-box") {
    const inc = v.toLowerCase().includes("silk") ? "Premium Silk Color" : "Basic Color";
    return { net: "50-Slot", inc };
  }
  if (rule.handle === "custom-mixed-vial-organizer-box") {
    const inc = v.toLowerCase().includes("silk") ? "Premium Silk Color" : "Basic Color";
    return { net: "Multi-Size", inc };
  }
  if (rule.handle === "clear-nasal-spray-bottles") {
    const vMatch = v.match(/([0-9]+)\s*ml/i);
    const net = vMatch ? `${vMatch[1]}ML` : (rule.defaultStrength || "10ML");
    return { net, inc: "With White Nozzle" };
  }

  // Handle Bundles
  if (rule.isBundle) {
    const count = rule.bundleSpec.components.length;
    return { net: rule.defaultStrength, inc: `${count}x Vials Stack` };
  }

  let net = "Standard";
  let inc = "Vial Only";

  // Check if variant name itself is numeric (e.g. "10", "15", "20", "30", "40", "50", "60", "5")
  if (/^[0-9]+(\.[0-9]+)?$/.test(v)) {
    net = `${v}MG`;
    inc = "Vial Only";
    return { net, inc };
  }

  // Check variant name for mg/iu/ml
  const vMatch = v.match(/([0-9]+(?:\.[0-9]+)?)\s*(mg|iu|ml)\b/i);
  if (vMatch) {
    net = `${vMatch[1]}${vMatch[2].toUpperCase()}`;
  } else {
    // Check product title for mg/iu/ml
    const tMatch = productTitle.match(/([0-9]+(?:\.[0-9]+)?)\s*(mg|iu|ml)\b/i);
    if (tMatch) {
      net = `${tMatch[1]}${tMatch[2].toUpperCase()}`;
    } else if (rule.defaultStrength) {
      net = rule.defaultStrength;
    }
  }

  // Parse Inclusion
  const lower = v.toLowerCase();
  if (lower.includes("subq")) inc = "SubQ Complete Set";
  else if (lower.includes("nasal set") || lower.includes("nasal complete")) inc = "Nasal Complete Set";
  else if (lower.includes("vial + bac") || lower.includes("vial+bac")) inc = "Vial + BAC Water";
  else if (lower.includes("glass vial")) inc = "Glass Vial";
  else if (lower.includes("ampoule")) inc = "Pharma Ampoule";
  else if (lower.includes("glass pharma")) inc = "Glass Pharma";
  else if (lower.includes("vial only") || lower === "vial") inc = "Vial Only";
  else if (lower.includes("kit") || lower.includes("set")) inc = "Complete Set";
  else if (v === "Default" || !v || /^[0-9]+(\.[0-9]+)?$/.test(v)) inc = "Vial Only";
  else inc = v;

  if (inc.toUpperCase() === net.toUpperCase() || inc.toLowerCase() === "standard vial") {
    inc = "Vial Only";
  }

  return { net, inc };
}

async function unify() {
  console.log("Starting Catalog Unification (46 Peptide Compounds + Bacteriostatic Water)...");
  const unifiedProducts = [];

  for (const rule of COMPOUND_RULES) {
    // 1. Find matching Lazada products
    const matchedLazada = lazadaProducts.filter(lp => {
      const titleLower = lp.title.toLowerCase();
      if (!rule.isBundle && titleLower.includes("bundle")) return false;
      if (rule.excludeMatchers && rule.excludeMatchers.some(em => titleLower.includes(em))) return false;
      return rule.matchers.some(m => titleLower.includes(m));
    });

    // 2. Find matching PepStack product
    const matchedPepStack = pepstackProducts
      .filter(pp => {
        const nameLower = pp.name.toLowerCase();
        return rule.matchers.some(m => nameLower.includes(m)) || (pp.sku && pp.sku.toLowerCase() === rule.code.toLowerCase());
      })
      .sort((a, b) => {
        const exactA = a.name.toLowerCase() === rule.canonicalName.toLowerCase() ? 1 : 0;
        const exactB = b.name.toLowerCase() === rule.canonicalName.toLowerCase() ? 1 : 0;
        return exactB - exactA;
      })[0];

    // 3. Find matching COAs
    let matchedCoas = pepstackCoas.filter(c => {
      const text = `${c.title} ${c.product_name || ""}`.toLowerCase();
      return rule.matchers.some(m => text.includes(m));
    });
    if (rule.isBundle && rule.bundleSpec) {
      matchedCoas = pepstackCoas.filter(c => {
        const text = `${c.title} ${c.product_name || ""}`.toLowerCase();
        return rule.bundleSpec.components.some(comp => text.includes(comp.title.toLowerCase()));
      });
    }

    // 4. Find matching dosing protocol
    let matchedDosing = pepstackDosing.find(d => {
      const nameLower = d.name.toLowerCase();
      return rule.matchers.some(m => nameLower.includes(m));
    });
    if (rule.isBundle && rule.bundleSpec) {
      matchedDosing = pepstackDosing.find(d => {
        const nameLower = d.name.toLowerCase();
        return rule.bundleSpec.components.some(comp => nameLower.includes(comp.title.toLowerCase()));
      });
    }

    // 5. Gather variants
    const rawVariants = [];
    if (matchedLazada.length > 0) {
      for (const lp of matchedLazada) {
        for (const lv of lp.variants) {
          // Check variant exclusion
          const vLower = lv.name.toLowerCase();
          if (rule.excludeMatchers && rule.excludeMatchers.some(em => vLower.includes(em))) continue;

          rawVariants.push({
            name: lv.name,
            lazadaSku: lv.sku,
            lazadaPrice: lv.price,
            productTitle: lp.title
          });
        }
      }
    } else if (matchedPepStack) {
      rawVariants.push({
        name: "Standard Vial",
        lazadaSku: `${rule.code}-001`,
        lazadaPrice: parseFloat(matchedPepStack.min_price || "2000"),
        productTitle: matchedPepStack.name
      });
    }

    if (rawVariants.length === 0) {
      console.warn(`No variants found for ${rule.canonicalName}`);
      continue;
    }

    // Deduplicate variants by lazadaSku AND option combination (Net Content + Inclusion)
    const uniqueVariants = [];
    const seenSkus = new Set();
    const seenCombos = new Set();
    for (const rv of rawVariants) {
      if (seenSkus.has(rv.lazadaSku)) continue;
      seenSkus.add(rv.lazadaSku);

      // Compute discounted price:
      let lazadaPrice = rv.lazadaPrice || 2000;
      let storefrontPrice = Math.round(lazadaPrice * 0.90);
      if (rule.isBundle && rule.bundleSpec) {
        lazadaPrice = rule.bundleSpec.sumPrice;
        storefrontPrice = rule.bundleSpec.bundlePrice;
      }

      const { net, inc } = parseVariantOptions(rule, rv.productTitle, rv.name);
      const baseCombo = `${net}___${inc}`;
      if (seenCombos.has(baseCombo)) continue;
      seenCombos.add(baseCombo);

      const variantSku = rule.isBundle ? `${rule.code}-STACK` : rv.lazadaSku;

      uniqueVariants.push({
        title: `${net} / ${inc}`,
        sku: variantSku,
        pepstack_code: rule.code,
        price_php: storefrontPrice,
        lazada_benchmark_price: lazadaPrice,
        options: {
          "Net Content": net,
          "Inclusion": inc
        },
        allow_backorder: true,
        manage_inventory: false,
        inventory_quantity: 1000
      });

      // Tier 1: Single Peptide Complete Prep Kits (Vial + BAC Water & Complete SubQ Set)
      if (!rule.isBundle && rule.category !== "research-supplies-accessories" && !rule.handle.includes("serum") && inc === "Vial Only") {
        const bacCombo = `${net}___Vial + BAC Water`;
        const bacSku = `${rv.lazadaSku}-BAC`;
        if (!seenSkus.has(bacSku) && !seenCombos.has(bacCombo)) {
          seenSkus.add(bacSku);
          seenCombos.add(bacCombo);
          uniqueVariants.push({
            title: `${net} / Vial + BAC Water`,
            sku: bacSku,
            pepstack_code: rule.code,
            price_php: storefrontPrice + 180,
            lazada_benchmark_price: lazadaPrice + 360,
            options: {
              "Net Content": net,
              "Inclusion": "Vial + BAC Water"
            },
            allow_backorder: true,
            manage_inventory: false,
            inventory_quantity: 1000
          });
        }

        const subqCombo = `${net}___Complete SubQ Set`;
        const subqSku = `${rv.lazadaSku}-SUBQ`;
        if (!seenSkus.has(subqSku) && !seenCombos.has(subqCombo)) {
          seenSkus.add(subqSku);
          seenCombos.add(subqCombo);
          uniqueVariants.push({
            title: `${net} / Complete SubQ Set`,
            sku: subqSku,
            pepstack_code: rule.code,
            price_php: storefrontPrice + 250,
            lazada_benchmark_price: lazadaPrice + 468,
            options: {
              "Net Content": net,
              "Inclusion": "Complete SubQ Set"
            },
            allow_backorder: true,
            manage_inventory: false,
            inventory_quantity: 1000
          });
        }
      }
    }

    // 6. Resolve photography
    const images = resolveLocalPhotos(rule, matchedPepStack);
    const thumbnail = images.length > 0 ? images[0] : null;

    // 7. Strip HTML tags from warnings for clean disclaimer
    const rawWarnings = matchedPepStack?.warnings || "";
    const cleanDisclaimer = rawWarnings
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "This investigational chemical has not been evaluated or approved by the Philippine Food and Drug Administration (FDA) for the treatment, cure, or diagnosis of any disease or condition.";

    // 7b. Supply check
    const isSupply = rule.category === "research-supplies-accessories" && rule.code !== "BAC";

    // 8. Push unified product
    unifiedProducts.push({
      title: rule.canonicalName,
      handle: rule.handle,
      description: matchedPepStack?.description || (isSupply ? `<p>${rule.canonicalName} is supplied strictly for laboratory research workflows, preparation, and precision dispensing.</p>` : `<p>${rule.canonicalName} is supplied strictly as a pure analytical and laboratory research compound.</p>`),
      category_handle: rule.category,
      type_id: null,
      thumbnail,
      images,
      options: [
        {
          title: "Net Content",
          values: Array.from(new Set(uniqueVariants.map(v => v.options["Net Content"])))
        },
        {
          title: "Inclusion",
          values: Array.from(new Set(uniqueVariants.map(v => v.options["Inclusion"])))
        }
      ],
      variants: uniqueVariants,
      metadata: {
        canonical_code: rule.code,
        is_bundle: rule.isBundle || false,
        bundle_spec: rule.bundleSpec || null,
        safety_warnings: matchedPepStack?.warnings || (isSupply ? "Laboratory research supplies and accessories. For research, preparation, and analytical procedures only." : "For in-vitro laboratory research only. Not for human or veterinary use."),
        storage_guidelines: matchedPepStack?.storage_requirements || (isSupply ? "Store in a clean, dry laboratory storage environment at ambient room temperature (15°C–25°C). Keep protected from direct sunlight and dust." : "Store at -20°C in a dry desiccated container. Reconstituted solution stable at 2°C–8°C for 28 days."),
        contraindications: matchedPepStack?.contraindications || null,
        compliance: {
          storage_and_handling: matchedPepStack?.storage_requirements || (isSupply ? "Store in a dry, room-temperature environment away from direct sunlight, chemical vapors, and moisture." : "Store lyophilized compound at -20°C in a dry environment protected from light. Once reconstituted with Bacteriostatic Water, keep refrigerated at 2°C–8°C and use within 28 days for maximum stability. Avoid repeated freeze-thaw cycles."),
          intended_use: isSupply ? "Laboratory consumables, precision dispensing hardware, and storage accessories designed for in-vitro research workflows and analytical compound preparation." : "Synthesized strictly for in-vitro laboratory research, analytical calibration, and scientific evaluation. Not for human, clinical, veterinary, therapeutic, or household administration.",
          terms_of_sale: "Purchaser must be an authorized investigator or institutional buyer aged 18+. Purchase constitutes agreement to handle all materials strictly according to standard biosafety and chemical safety protocols.",
          disclaimer: isSupply ? "Research supplies and accessories are designed strictly for laboratory and analytical preparation workflows." : cleanDisclaimer,
          packaging_options: isSupply ? "Supplied in protective laboratory packaging with tamper-resistant seals." : "Dispatched in sterile crimped vials with tamper-evident security caps. Available as standalone vials, with USP Bacteriostatic Water, or as Complete SubQ assembly kits with sterile administration supplies."
        },
        coas: matchedCoas.map(c => ({
          title: c.title,
          batch_number: c.batch_number,
          tested_date: c.tested_date,
          image_url: c.image_url ? `https://pepstacklabs.com${c.image_url}` : null
        })),
        dosing_monograph: matchedDosing ? {
          delivery_method: matchedDosing.delivery_method,
          short_description: matchedDosing.short_description
        } : null
      }
    });
  }

  const outPath = path.resolve("apps/backend/data/unified-catalog.json");
  fs.writeFileSync(outPath, JSON.stringify(unifiedProducts, null, 2));
  console.log(`Successfully unified ${unifiedProducts.length} canonical products into ${outPath}`);
  const totalVariants = unifiedProducts.reduce((sum, p) => sum + p.variants.length, 0);
  console.log(`Total Variants: ${totalVariants}`);
  const withImages = unifiedProducts.filter(p => p.images.length > 0).length;
  console.log(`Products with Local Photos: ${withImages} / ${unifiedProducts.length}`);
}

unify();
