import sanitizeHtml from "sanitize-html"

const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value)

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")

const sanitizeProductDescription = (description: string | null | undefined) => {
  if (!description?.trim()) return ""

  const source = looksLikeHtml(description)
    ? description
    : `<p>${escapeHtml(description).replaceAll("\n", "<br>")}</p>`

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
