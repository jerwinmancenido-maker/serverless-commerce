import fs from "fs"
import path from "path"

const routesDir = "apps/backend/src/admin/routes"

function walkSync(dir: string, filelist: string[] = []): string[] {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filepath = path.join(dir, file)
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist)
    } else if (file === "page.tsx") {
      filelist.push(filepath)
    }
  }
  return filelist
}

const pageFiles = walkSync(routesDir)

console.log(`=== AUDITING ALL ${pageFiles.length} ADMIN PAGES FOR FULL-SCREEN VS CONSTRAINED LAYOUT ===\n`)

const pagesWithMaxWidth: any[] = []
const pagesFluidFullScreen: any[] = []
const redirectPages: any[] = []

for (const file of pageFiles) {
  const rel = path.relative(routesDir, file)
  const content = fs.readFileSync(file, "utf-8")

  if (content.includes("<Navigate") && content.length < 500) {
    redirectPages.push({ rel, file })
    continue
  }

  // Look for root return statement
  // Matches `return (\n <div className="..."` or similar
  const returnRegex = /return\s*\(\s*\n*\s*(<[\s\S]*?>)/g
  let rootTag = ""
  let m
  while ((m = returnRegex.exec(content)) !== null) {
    // We want the primary component return
    if (m[1].includes("className=") || m[1].startsWith("<Container") || m[1].startsWith("<div")) {
      rootTag = m[1]
    }
  }

  // Also extract className from first return element if available
  const firstElemMatch = content.match(/return\s*\(\s*\n*\s*<([a-zA-Z0-9\._]+)([^>]*)>/)
  const fullTag = firstElemMatch ? `<${firstElemMatch[1]}${firstElemMatch[2]}>` : rootTag

  // Check for max-w in root wrapper or main container
  const isBoxed1280 = content.includes("max-w-[1280px]") || content.includes("max-w-7xl")
  const isBoxed3xl = content.includes("max-w-3xl") || content.includes("max-w-4xl") || content.includes("max-w-5xl") || content.includes("max-w-6xl")
  const hasMxAuto = fullTag.includes("mx-auto")
  const isContainer = fullTag.includes("<Container")

  const classesMatch = fullTag.match(/className=["']([^"']*)["']/)
  const rootClasses = classesMatch ? classesMatch[1] : ""

  if (hasMxAuto || isBoxed1280 || (rootClasses.includes("max-w-") && !rootClasses.includes("max-w-none"))) {
    pagesWithMaxWidth.push({
      rel,
      tag: firstElemMatch ? firstElemMatch[1] : "unknown",
      rootClasses,
      fullTag: fullTag.replace(/\n\s*/g, " ").slice(0, 140),
    })
  } else {
    pagesFluidFullScreen.push({
      rel,
      tag: firstElemMatch ? firstElemMatch[1] : "unknown",
      rootClasses,
      fullTag: fullTag.replace(/\n\s*/g, " ").slice(0, 140),
    })
  }
}

console.log(`1. CONSTRAINED / BOXED PAGES (NOT FULL SCREEN) [${pagesWithMaxWidth.length}]:`)
for (const p of pagesWithMaxWidth) {
  console.log(`❌ ${p.rel}`)
  console.log(`   Classes: "${p.rootClasses}"`)
  console.log(`   Tag: ${p.fullTag}\n`)
}

console.log(`--------------------------------------------------------------------------------`)
console.log(`2. FLUID FULL-SCREEN PAGES (EDGE-TO-EDGE 100%) [${pagesFluidFullScreen.length}]:`)
for (const p of pagesFluidFullScreen) {
  console.log(`✅ ${p.rel}`)
  console.log(`   Classes: "${p.rootClasses}"\n`)
}

console.log(`--------------------------------------------------------------------------------`)
console.log(`3. REDIRECT PAGES [${redirectPages.length}]:`)
for (const p of redirectPages) {
  console.log(`⚡ ${p.rel}`)
}
