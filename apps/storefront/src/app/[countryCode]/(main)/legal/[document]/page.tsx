import { Metadata } from "next"
import { notFound } from "next/navigation"
import { readFile } from "node:fs/promises"
import path from "node:path"

type LegalDocumentKey = "terms" | "privacy" | "research-hub"

type PageProps = {
  params: Promise<{ countryCode: string; document: string }>
}

type LegalDocumentDefinition = {
  title: string
  description: string
  filename: string
}

type ContentBlock =
  | { kind: "title" | "heading" | "paragraph" | "notice"; text: string }
  | { kind: "list"; items: string[] }

const LEGAL_DOCUMENTS: Record<LegalDocumentKey, LegalDocumentDefinition> = {
  terms: {
    title: "Terms of Service",
    description: "Terms governing the Research Compounds storefront and services.",
    filename: "terms-2026.09.01-en-PH.txt",
  },
  privacy: {
    title: "Privacy Policy",
    description: "How Research Compounds processes and protects personal data.",
    filename: "privacy-2026.09.01-en-PH.txt",
  },
  "research-hub": {
    title: "Research Hub Agreement",
    description: "Terms for protocols, routines, progress, journal, and Research Hub tools.",
    filename: "research-hub-2026.09.01-en-PH.txt",
  },
}

const DOCUMENT_ALIASES: Record<string, LegalDocumentKey> = {
  terms: "terms",
  "terms-of-service": "terms",
  "terms-and-conditions": "terms",
  privacy: "privacy",
  "privacy-policy": "privacy",
  "research-hub": "research-hub",
  "research-use-agreement": "research-hub",
  disclaimer: "research-hub",
}

function resolveDocumentKey(value: string): LegalDocumentKey | null {
  return DOCUMENT_ALIASES[value.toLowerCase()] ?? null
}

async function loadDocument(definition: LegalDocumentDefinition) {
  const filePath = path.join(
    process.cwd(),
    "public",
    "legal-documents",
    definition.filename,
  )
  return readFile(filePath, "utf8")
}

function parseDocument(source: string): ContentBlock[] {
  const blocks: ContentBlock[] = []
  const lines = source.replace(/\r\n/g, "\n").split("\n")
  let paragraph: string[] = []
  let listItems: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") })
      paragraph = []
    }
  }
  const flushList = () => {
    if (listItems.length) {
      blocks.push({ kind: "list", items: listItems })
      listItems = []
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }
    if (line.startsWith("# ")) {
      flushParagraph()
      flushList()
      blocks.push({ kind: "title", text: line.slice(2) })
      continue
    }
    if (line.startsWith("## ")) {
      flushParagraph()
      flushList()
      blocks.push({ kind: "heading", text: line.slice(3) })
      continue
    }
    if (line.startsWith("> ")) {
      flushParagraph()
      flushList()
      blocks.push({ kind: "notice", text: line.slice(2) })
      continue
    }
    if (line.startsWith("- ")) {
      flushParagraph()
      listItems.push(line.slice(2))
      continue
    }
    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()
  return blocks
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { document } = await params
  const key = resolveDocumentKey(document)
  if (!key) {
    return { title: "Legal document" }
  }
  const definition = LEGAL_DOCUMENTS[key]
  return {
    title: `${definition.title} | Research Compounds`,
    description: definition.description,
  }
}

export default async function LegalDocumentPage({ params }: PageProps) {
  const { document } = await params
  const key = resolveDocumentKey(document)
  if (!key) {
    notFound()
  }

  const definition = LEGAL_DOCUMENTS[key]
  const source = await loadDocument(definition)
  const blocks = parseDocument(source)

  return (
    <main className="bg-ui-bg-subtle py-10 small:py-16">
      <article className="content-container">
        <div className="mx-auto max-w-4xl rounded-rounded border border-ui-border-base bg-ui-bg-base px-6 py-8 shadow-elevation-card-rest small:px-10 small:py-12">
          {blocks.map((block, index) => {
            const key = `${block.kind}-${index}`
            if (block.kind === "title") {
              return (
                <h1 key={key} className="text-3xl-semi text-ui-fg-base small:text-4xl-semi">
                  {block.text}
                </h1>
              )
            }
            if (block.kind === "heading") {
              return (
                <h2 key={key} className="mb-3 mt-10 text-xl-semi text-ui-fg-base small:text-2xl-semi">
                  {block.text}
                </h2>
              )
            }
            if (block.kind === "notice") {
              return (
                <div key={key} className="my-7 rounded-rounded border border-ui-border-interactive bg-ui-bg-highlight px-5 py-4 text-base-regular text-ui-fg-base">
                  {block.text}
                </div>
              )
            }
            if (block.kind === "list") {
              return (
                <ul key={key} className="my-4 list-disc space-y-2 pl-6 text-base-regular leading-7 text-ui-fg-subtle">
                  {block.items.map((item, itemIndex) => (
                    <li key={`${key}-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              )
            }
            const metadata = /^(Version|Effective date|Service):/.test(block.text)
            return (
              <p
                key={key}
                className={
                  metadata
                    ? "mt-2 text-small-regular text-ui-fg-muted"
                    : "mt-4 text-base-regular leading-7 text-ui-fg-subtle"
                }
              >
                {block.text}
              </p>
            )
          })}
        </div>
      </article>
    </main>
  )
}
