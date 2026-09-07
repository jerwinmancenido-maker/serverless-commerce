import assert from "node:assert/strict"
import test from "node:test"
import {
  cleanCompoundTitle,
  buildProtocolShareData,
  buildProtocolMailtoUrl,
  generateProtocolQrCode,
} from "./protocol-sharing.ts"

test("cleanCompoundTitle removes redundant suffixes and parenthetical sizes", () => {
  assert.equal(cleanCompoundTitle("Tirzepatide Product Protocol"), "Tirzepatide")
  assert.equal(cleanCompoundTitle("BPC-157 Laboratory Handling Standard (10mg Vial)"), "BPC-157")
  assert.equal(cleanCompoundTitle("Ipamorelin Laboratory Reconstitution & Handling Standard"), "Ipamorelin")
  assert.equal(cleanCompoundTitle("Kisspeptin-10 Protocol (5mg)"), "Kisspeptin-10")
  assert.equal(cleanCompoundTitle("Wolverine Blend"), "Wolverine Blend")
  assert.equal(cleanCompoundTitle(undefined, "Semax"), "Semax")
})

test("buildProtocolShareData constructs clean share payload", () => {
  const shareData = buildProtocolShareData({
    title: "Tirzepatide Product Protocol",
    compoundName: "Tirzepatide",
    summary: "Dual GLP-1/GIP co-agonist reference material.",
    url: "https://pepstacklabs.com/ph/research-protocols/tirzepatide-laboratory-handling",
  })

  assert.equal(shareData.title, "Tirzepatide - Research Protocol")
  assert.match(shareData.text, /Tirzepatide Laboratory Research Protocol/)
  assert.match(shareData.text, /Dual GLP-1\/GIP/)
  assert.equal(shareData.url, "https://pepstacklabs.com/ph/research-protocols/tirzepatide-laboratory-handling")
})

test("buildProtocolMailtoUrl properly encodes subject, stoichiometry, purchase link, and legal disclaimer", () => {
  const mailto = buildProtocolMailtoUrl({
    compoundName: "Tirzepatide",
    category: "Metabolic & Glucose Regulation",
    productFormat: "Lyophilized Solid Powder",
    solvent: "Bacteriostatic Water",
    diluentRatio: "2.0 mL per 10 mg",
    storage: "Refrigerated 2°C–8°C",
    summary: "Cellular glucose uptake and insulin dynamics investigation.",
    protocolUrl: "https://pepstacklabs.com/ph/research-protocols/tirzepatide-laboratory-handling",
    purchaseUrl: "https://pepstacklabs.com/ph/products/tirzepatide-10mg",
  })

  assert.match(mailto, /^mailto:\?subject=/)
  const decoded = decodeURIComponent(mailto)

  assert.match(decoded, /Research Protocol: Tirzepatide - Laboratory Reference Standard/)
  assert.match(decoded, /Compound: Tirzepatide \(Lyophilized Solid Powder\)/)
  assert.match(decoded, /• Target Solvent: Bacteriostatic Water/)
  assert.match(decoded, /• Diluent Ratio: 2.0 mL per 10 mg/)
  assert.match(decoded, /ORDER REFERENCE MATERIAL \(DIRECT CATALOG PURCHASE\):/)
  assert.match(decoded, /https:\/\/pepstacklabs\.com\/ph\/products\/tirzepatide-10mg/)
  assert.match(decoded, /Notice: In-vitro laboratory research reference standard only/)
})

test("generateProtocolQrCode generates a valid base64 data URL", async () => {
  const qrDataUrl = await generateProtocolQrCode("https://pepstacklabs.com/ph/products/tirzepatide-10mg")
  assert.match(qrDataUrl, /^data:image\/png;base64,/)
})
