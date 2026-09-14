/**
 * @file    apps/backend/src/admin/components/editor/sovereign-markdown-preview.tsx
 * @module  SovereignMarkdownPreview
 * @purpose High-fidelity clinical preview renderer for markdown monographs, tables, and callout notices.
 * @contracts
 *   Component: SovereignMarkdownPreview
 *   Design:    Sovereign Admin Design System 2.0
 */

import React, { useMemo } from "react"
import {
  CheckCircle,
  ExclamationCircle,
  InformationCircle,
  Sparkles,
} from "@medusajs/icons"

export interface SovereignMarkdownPreviewProps {
  content: string
  className?: string
  placeholder?: string
}

const renderInlineStyles = (text: string): React.ReactNode => {
  // Replace links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderFormatting(text.substring(lastIndex, match.index)))
    }
    const [, label, url] = match
    parts.push(
      <a
        key={`link-${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline font-medium"
      >
        {label}
      </a>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(renderFormatting(text.substring(lastIndex)))
  }

  return parts.length > 0 ? parts : text
}

const renderFormatting = (text: string): React.ReactNode => {
  // Bold **text**
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g)
  return boldParts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {renderItalicsAndCode(part.slice(2, -2))}
        </strong>
      )
    }
    return renderItalicsAndCode(part)
  })
}

const renderItalicsAndCode = (text: string): React.ReactNode => {
  // Inline code `code`
  const codeParts = text.split(/(`[^`]+`)/g)
  return codeParts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1 py-0.5 rounded-sm bg-slate-100 border border-slate-200/80 font-mono text-[11px] text-blue-900"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    // Italics *text* or _text_
    const italicParts = part.split(/(\*[^*]+\*)/g)
    return italicParts.map((sub, j) => {
      if (sub.startsWith("*") && sub.endsWith("*")) {
        return (
          <em key={j} className="italic text-slate-800">
            {sub.slice(1, -1)}
          </em>
        )
      }
      return sub
    })
  })
}

export const SovereignMarkdownPreview: React.FC<SovereignMarkdownPreviewProps> = ({
  content,
  className = "",
  placeholder = "No monograph body text written yet. Start drafting or use the formatting toolbar above.",
}) => {
  const elements = useMemo(() => {
    if (!content || !content.trim()) return null

    const lines = content.split("\n")
    const blocks: React.ReactNode[] = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      // 1. Horizontal Rule
      if (/^---+$/.test(trimmed)) {
        blocks.push(<hr key={`hr-${i}`} className="my-5 border-slate-200/80" />)
        i++
        continue
      }

      // 2. Heading 1
      if (/^#\s+(.+)$/.test(trimmed)) {
        const title = trimmed.replace(/^#\s+/, "")
        blocks.push(
          <h1
            key={`h1-${i}`}
            className="text-xl sm:text-2xl font-bold font-serif text-slate-900 border-b border-slate-200/90 pb-2 mt-6 mb-3 tracking-tight"
          >
            {renderInlineStyles(title)}
          </h1>
        )
        i++
        continue
      }

      // 3. Heading 2
      if (/^##\s+(.+)$/.test(trimmed)) {
        const title = trimmed.replace(/^##\s+/, "")
        blocks.push(
          <h2
            key={`h2-${i}`}
            className="text-base sm:text-lg font-bold font-serif text-slate-900 border-b border-slate-100 pb-1.5 mt-5 mb-2.5 tracking-tight flex items-center gap-2"
          >
            <span className="inline-block size-1.5 rounded-full bg-blue-600 shrink-0" />
            <span>{renderInlineStyles(title)}</span>
          </h2>
        )
        i++
        continue
      }

      // 4. Heading 3
      if (/^###\s+(.+)$/.test(trimmed)) {
        const title = trimmed.replace(/^###\s+/, "")
        blocks.push(
          <h3
            key={`h3-${i}`}
            className="text-sm font-bold text-slate-900 mt-4 mb-2 tracking-tight"
          >
            {renderInlineStyles(title)}
          </h3>
        )
        i++
        continue
      }

      // 5. Callouts: > [!NOTE], > [!WARNING], > [!IMPORTANT]
      if (/^>\s*\[!(NOTE|WARNING|IMPORTANT|CAUTION)\]/i.test(trimmed)) {
        const calloutTypeMatch = trimmed.match(/^>\s*\[!(NOTE|WARNING|IMPORTANT|CAUTION)\]/i)
        const calloutType = (calloutTypeMatch ? calloutTypeMatch[1] : "NOTE").toUpperCase()
        const calloutLines: string[] = []
        i++
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          calloutLines.push(lines[i].trim().replace(/^>\s*/, ""))
          i++
        }

        const isWarning = calloutType === "WARNING" || calloutType === "CAUTION"
        const isImportant = calloutType === "IMPORTANT"

        const bgClass = isWarning
          ? "bg-amber-50/70 border-amber-200/90 text-amber-950"
          : isImportant
          ? "bg-purple-50/70 border-purple-200/90 text-purple-950"
          : "bg-blue-50/70 border-blue-200/90 text-blue-950"

        const badgeClass = isWarning
          ? "bg-amber-100 text-amber-800 border-amber-200"
          : isImportant
          ? "bg-purple-100 text-purple-800 border-purple-200"
          : "bg-blue-100 text-blue-800 border-blue-200"

        const Icon = isWarning
          ? ExclamationCircle
          : isImportant
          ? Sparkles
          : InformationCircle

        blocks.push(
          <div
            key={`callout-${i}`}
            className={`my-3.5 p-3.5 rounded-xl border ${bgClass} shadow-2xs space-y-1.5`}
          >
            <div className="flex items-center gap-1.5">
              <Icon className="size-4 shrink-0" />
              <span
                className={`text-[10px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${badgeClass}`}
              >
                {calloutType}
              </span>
            </div>
            <div className="text-xs leading-relaxed font-sans pl-5">
              {calloutLines.map((cLine, cIdx) => (
                <p key={cIdx} className="my-0.5">
                  {renderInlineStyles(cLine)}
                </p>
              ))}
            </div>
          </div>
        )
        continue
      }

      // 6. Standard Blockquote > text
      if (trimmed.startsWith(">")) {
        const quoteLines: string[] = []
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ""))
          i++
        }
        blocks.push(
          <blockquote
            key={`quote-${i}`}
            className="my-3 border-l-2 border-slate-300 pl-3.5 italic text-xs text-slate-600 leading-relaxed font-serif"
          >
            {quoteLines.map((qLine, qIdx) => (
              <p key={qIdx}>{renderInlineStyles(qLine)}</p>
            ))}
          </blockquote>
        )
        continue
      }

      // 7. Markdown Table | col | col |
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const tableLines: string[] = []
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          tableLines.push(lines[i].trim())
          i++
        }

        if (tableLines.length >= 2) {
          const headerRow = tableLines[0]
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim())
          const rows = tableLines
            .slice(2)
            .map((r) => r.split("|").slice(1, -1).map((c) => c.trim()))

          blocks.push(
            <div
              key={`table-${i}`}
              className="my-4 overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-2xs"
            >
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-semibold">
                    {headerRow.map((th, thIdx) => (
                      <th key={thIdx} className="px-3.5 py-2.5 font-mono text-[11px]">
                        {renderInlineStyles(th)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={rIdx % 2 === 1 ? "bg-slate-50/40 hover:bg-slate-50/80 transition-colors" : "hover:bg-slate-50/80 transition-colors"}
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 text-slate-700 leading-relaxed">
                          {renderInlineStyles(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
          continue
        }
      }

      // 8. Bulleted Lists (- or *)
      if (/^[-*]\s+/.test(trimmed)) {
        const listItems: string[] = []
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^[-*]\s+/, ""))
          i++
        }
        blocks.push(
          <ul key={`ul-${i}`} className="my-2.5 space-y-1.5 pl-4 list-disc text-xs text-slate-700 leading-relaxed">
            {listItems.map((item, idx) => (
              <li key={idx} className="pl-1">
                {renderInlineStyles(item)}
              </li>
            ))}
          </ul>
        )
        continue
      }

      // 9. Numbered Lists (1. )
      if (/^\d+\.\s+/.test(trimmed)) {
        const listItems: string[] = []
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""))
          i++
        }
        blocks.push(
          <ol key={`ol-${i}`} className="my-2.5 space-y-1.5 pl-5 list-decimal text-xs text-slate-700 leading-relaxed font-mono">
            {listItems.map((item, idx) => (
              <li key={idx} className="pl-1 font-sans">
                {renderInlineStyles(item)}
              </li>
            ))}
          </ol>
        )
        continue
      }

      // 10. Blank line
      if (!trimmed) {
        i++
        continue
      }

      // 11. Normal Paragraph
      const paragraphLines: string[] = []
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].trim().startsWith("#") &&
        !lines[i].trim().startsWith(">") &&
        !lines[i].trim().startsWith("|") &&
        !/^[-*]\s+/.test(lines[i].trim()) &&
        !/^\d+\.\s+/.test(lines[i].trim()) &&
        !/^---+$/.test(lines[i].trim())
      ) {
        paragraphLines.push(lines[i].trim())
        i++
      }

      blocks.push(
        <p key={`p-${i}`} className="my-2 text-xs text-slate-700 leading-relaxed font-sans">
          {renderInlineStyles(paragraphLines.join(" "))}
        </p>
      )
    }

    return blocks
  }, [content])

  if (!content || !content.trim()) {
    return (
      <div className={`p-8 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-slate-400 text-xs italic ${className}`}>
        {placeholder}
      </div>
    )
  }

  return (
    <div className={`p-6 sm:p-8 rounded-xl bg-white border border-slate-200/80 shadow-2xs font-sans text-slate-800 ${className}`}>
      {elements}
    </div>
  )
}

export default SovereignMarkdownPreview
