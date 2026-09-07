import sanitizeHtml from "sanitize-html"
import { marked } from "marked"

const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value)

// Detects common Markdown patterns: **bold**, *italic*, # headings, - lists, [links]
const looksLikeMarkdown = (value: string) =>
  /(\*\*|__|\*|_|#{1,6} |^- |\[.+\]\(.+\)|^> )/m.test(value)

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")

const formatInlineMarkdown = (content: string) =>
  content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)([^\*]+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")

const sanitizeProductDescription = (description: string | null | undefined) => {
  if (!description?.trim()) return ""

  let source: string

  if (looksLikeHtml(description)) {
    source = description
    // Format hybrid HTML containing Markdown bold/italic or unformatted newlines in <p>
    if (looksLikeMarkdown(source) || source.includes("\n") || source.includes("\\n")) {
      source = source.replace(/<p>([\s\S]*?)<\/p>/gi, (_match, inner) => {
        const paragraphs = inner
          .split(/(?:\r?\n|\\n)\s*(?:\r?\n|\\n)/)
          .map((p: string) => p.trim())
          .filter(Boolean)
        if (paragraphs.length <= 1) {
          return `<p>${inner.replace(/(?:\r?\n|\\n)/g, "<br>")}</p>`
        }
        return paragraphs
          .map((p: string) => `<p>${p.replace(/(?:\r?\n|\\n)/g, "<br>")}</p>`)
          .join("")
      })
      source = formatInlineMarkdown(source)
    }
  } else if (looksLikeMarkdown(description)) {
    // Markdown — normalize literal \n if present, convert to HTML first, then sanitize
    const normalizedMd = description.replace(/\\n/g, "\n")
    source = marked.parse(normalizedMd, { async: false }) as string
  } else {
    // Plain text — wrap in paragraph with line breaks
    source = `<p>${escapeHtml(description).replace(/(?:\r?\n|\\n)/g, "<br>")}</p>`
  }

  return sanitizeHtml(source, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "span",
      "mark",
      "blockquote",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "a",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "rel", "target"],
      img: ["src", "alt", "title", "loading"],
      mark: ["data-color", "style"],
      span: ["style"],
    },
    allowedStyles: {
      mark: {
        "background-color": [/^#[0-9a-f]{6}$/i],
      },
      span: {
        color: [/^#[0-9a-f]{6}$/i],
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      img: (_tagName, attribs) => ({
        tagName: "img",
        attribs: {
          ...attribs,
          loading: "lazy",
        },
      }),
    },
  })
}

export { sanitizeProductDescription }
