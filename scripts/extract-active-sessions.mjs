import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("apps/backend/data/scraped");
fs.mkdirSync(DATA_DIR, { recursive: true });

const PEPSTACK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YWExMGJjNy02M2Y0LTQ1MmMtOWRkNi0zMjJlMzBmMGNmODEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODg2MDI0MjcsImV4cCI6MTc4OTIwNzIyN30.-krJTJoIdpmw6b9esbi4ARHpYj1UskFhGbPo9i25MBc";

async function extractLazada() {
  console.log("Connecting to Chrome CDP for Lazada Seller Center...");
  const pages = await fetch("http://127.0.0.1:9222/json").then(r => r.json());
  const lazadaPage = pages.find(p => p.url && p.url.includes("sellercenter.lazada.com.ph/apps/product/list"));

  if (!lazadaPage) {
    throw new Error("Lazada Seller Center page not found in Chrome");
  }

  const ws = new WebSocket(lazadaPage.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const js = `(() => {
    const rows = Array.from(document.querySelectorAll("tr"));
    const products = [];
    let currentProduct = null;

    for (const row of rows) {
      const text = row.innerText || "";
      // Ignore non-product rows
      if (row.classList.contains("next-table-expanded-row")) {
        // This is a wrapper row that contains another table; skip to avoid duplicate counts
        continue;
      }

      if (text.includes("Product Id:")) {
        const idMatch = text.match(/Product Id:\\s*([0-9]+)/i);
        const titlePart = text.split(/Product Id:/i)[0].trim();
        const lines = titlePart.split("\\n").map(l => l.trim()).filter(Boolean);
        const title = lines[0] || "Unknown";

        currentProduct = {
          title,
          productId: idMatch ? idMatch[1] : null,
          variants: []
        };
        products.push(currentProduct);

        if (text.includes("Seller Sku:")) {
          const skuMatch = text.match(/Seller Sku:\\s*([A-Za-z0-9_-]+)/i);
          const priceMatch = text.match(/₱\\s*([0-9,]+)/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ""), 10) : 0;
          const sku = skuMatch ? skuMatch[1] : null;
          if (sku) {
            currentProduct.variants.push({
              name: "Default",
              sku,
              price
            });
          }
        }
      } else if (currentProduct && text.includes("Seller Sku:")) {
        const skuMatch = text.match(/Seller Sku:\\s*([A-Za-z0-9_-]+)/i);
        const sku = skuMatch ? skuMatch[1] : null;
        if (!sku) continue;

        // Extract variant name from preceding text
        const namePart = text.split(/Seller Sku:/i)[0].trim();
        const lines = namePart.split("\\n").map(l => l.trim()).filter(Boolean);
        const variantName = lines[lines.length - 1] || "Variant";

        const priceMatch = text.match(/₱\\s*([0-9,]+)/);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ""), 10) : 0;

        // Avoid duplicate skus in same product
        if (!currentProduct.variants.some(v => v.sku === sku)) {
          currentProduct.variants.push({
            name: variantName,
            sku,
            price
          });
        }
      }
    }
    return products;
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: "Runtime.evaluate",
    params: { expression: js, returnByValue: true }
  }));

  const res = await new Promise(r => ws.onmessage = e => r(JSON.parse(e.data)));
  ws.close();

  const products = res.result?.result?.value || [];
  const lazadaFile = path.join(DATA_DIR, "lazada-products.json");
  fs.writeFileSync(lazadaFile, JSON.stringify(products, null, 2));
  
  const totalVariants = products.reduce((acc, p) => acc + p.variants.length, 0);
  console.log(`Lazada extraction saved to ${lazadaFile}: ${products.length} products, ${totalVariants} variants.`);
  return products;
}

async function extractPepStack() {
  console.log("Extracting PepStack Labs catalog & components via REST API...");
  const headers = {
    "Authorization": `Bearer ${PEPSTACK_TOKEN}`,
    "Content-Type": "application/json"
  };

  const endpoints = [
    { name: "pepstack-products.json", url: "https://pepstacklabs.com/api/products" },
    { name: "pepstack-coas.json", url: "https://pepstacklabs.com/api/coas" },
    { name: "pepstack-dosing.json", url: "https://pepstacklabs.com/api/dosing/compounds" },
    { name: "pepstack-prep-guide.json", url: "https://pepstacklabs.com/api/dosing/prep-guide" },
    { name: "pepstack-components.json", url: "https://pepstacklabs.com/api/admin/components" },
    { name: "pepstack-component-variants.json", url: "https://pepstacklabs.com/api/admin/components/variants?region=PH" }
  ];

  for (const ep of endpoints) {
    const res = await fetch(ep.url, { headers });
    if (!res.ok) {
      console.warn(`Failed to fetch ${ep.url}: status ${res.status}`);
      continue;
    }
    const data = await res.json();
    const filePath = path.join(DATA_DIR, ep.name);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    const count = Array.isArray(data) ? data.length : (data.components?.length || data.variants?.length || "object");
    console.log(`Saved ${ep.name} (${count} items) to ${filePath}`);
  }
}

async function main() {
  try {
    await extractLazada();
    await extractPepStack();
    console.log("All session data extracted successfully to apps/backend/data/scraped/");
  } catch (err) {
    console.error("Extraction error:", err);
    process.exit(1);
  }
}

main();
