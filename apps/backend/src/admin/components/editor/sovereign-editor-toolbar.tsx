/**
 * @file    apps/backend/src/admin/components/editor/sovereign-editor-toolbar.tsx
 * @module  SovereignEditorToolbar
 * @purpose Universal rich formatting ribbon for clinical monographs, markdown documents, and textareas.
 * @contracts
 *   Component: SovereignEditorToolbar
 *   Design:    Sovereign Admin Design System 2.0
 */

import React from "react"
import {
  ArrowUturnLeft,
  ArrowsPointingOut,
  ArrowsReduceDiagonal,
  Code,
  DocumentText,
  Eye,
  Link as LinkIcon,
  ListBullet,
  ListCheckbox,
  QueueList,
  TablePen,
} from "@medusajs/icons"
import { Button } from "@medusajs/ui"

export type ViewMode = "write" | "split" | "preview"

export interface SovereignEditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (nextValue: string) => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  wordCount?: number
  characterCount?: number
  className?: string
  hideViewSwitch?: boolean
  disabled?: boolean
}

export const SovereignEditorToolbar: React.FC<SovereignEditorToolbarProps> = ({
  textareaRef,
  value,
  onChange,
  viewMode = "write",
  onViewModeChange,
  isFullscreen = false,
  onToggleFullscreen,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  wordCount,
  characterCount,
  className = "",
  hideViewSwitch = false,
  disabled = false,
}) => {
  const insertFormatting = (
    prefix: string,
    suffix: string = "",
    placeholder: string = "text",
    block: boolean = false
  ) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.substring(start, end)

    let replacement = ""
    let newCursorPos = start

    if (block) {
      const beforeCursor = value.substring(0, start)
      const needsLeadingNewline = beforeCursor.length > 0 && !beforeCursor.endsWith("\n\n")
      const leading = needsLeadingNewline ? (beforeCursor.endsWith("\n") ? "\n" : "\n\n") : ""
      const textToWrap = selected || placeholder
      replacement = `${leading}${prefix}${textToWrap}${suffix}\n\n`
      newCursorPos = start + leading.length + prefix.length + textToWrap.length
    } else {
      const textToWrap = selected || placeholder
      replacement = `${prefix}${textToWrap}${suffix}`
      newCursorPos = start + prefix.length + textToWrap.length
    }

    const nextValue = value.substring(0, start) + replacement + value.substring(end)
    onChange(nextValue)

    setTimeout(() => {
      textarea.focus()
      if (selected) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
      } else {
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const handleTableInsert = () => {
    const tableTemplate =
      "\n\n| Parameter | Specification | Acceptance Criteria |\n|---|---|---|\n| Purity Assay | ≥99.0% | HPLC Single Peak (Lot Verified) |\n| Molecular Identity | Target Da | ESI-MS Electrospray Ionization |\n| Endotoxin Screen | < 0.05 EU/mg | LAL Chromogenic Substrate |\n\n"

    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const nextValue = value.substring(0, start) + tableTemplate + value.substring(start)
    onChange(nextValue)

    setTimeout(() => {
      textarea.focus()
      const nextPos = start + tableTemplate.length
      textarea.setSelectionRange(nextPos, nextPos)
    }, 0)
  }

  const handleCalloutInsert = (type: "NOTE" | "WARNING" | "IMPORTANT") => {
    const calloutTemplate = `\n\n> [!${type}]\n> Analytical monograph intended strictly for authenticated laboratory research and clinical in vitro benchmarking.\n\n`

    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const nextValue = value.substring(0, start) + calloutTemplate + value.substring(start)
    onChange(nextValue)

    setTimeout(() => {
      textarea.focus()
      const nextPos = start + calloutTemplate.length
      textarea.setSelectionRange(nextPos, nextPos)
    }, 0)
  }

  const handleLinkInsert = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.substring(start, end)
    const title = selected || "Reference Monograph"
    const linkText = `[${title}](https://...)`

    const nextValue = value.substring(0, start) + linkText + value.substring(end)
    onChange(nextValue)

    setTimeout(() => {
      textarea.focus()
      const urlStart = start + title.length + 3
      textarea.setSelectionRange(urlStart, urlStart + 10)
    }, 0)
  }

  return (
    <div
      className={`border-b border-slate-200/90 bg-slate-50/90 px-3 py-1.5 backdrop-blur-xs flex flex-wrap items-center justify-between gap-1.5 select-none ${
        disabled ? "opacity-60 pointer-events-none" : ""
      } ${className}`}
    >
      {/* Left toolgroup: Text styling & Headings */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Undo / Redo */}
        {(onUndo || onRedo) && (
          <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
            {onUndo && (
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="flex size-7 items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ArrowUturnLeft className="size-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Headings */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
          <button
            type="button"
            onClick={() => insertFormatting("## ", "", "Primary Monograph Section", true)}
            title="Heading 2 (## Section)"
            className="flex h-7 px-1.5 items-center justify-center rounded-md font-mono font-bold text-xs text-slate-700 hover:bg-white hover:text-blue-700 transition-colors"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("### ", "", "Sub-Mechanism Subsection", true)}
            title="Heading 3 (### Subsection)"
            className="flex h-7 px-1.5 items-center justify-center rounded-md font-mono font-semibold text-xs text-slate-700 hover:bg-white hover:text-blue-700 transition-colors"
          >
            H3
          </button>
        </div>

        {/* Inline styles */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
          <button
            type="button"
            onClick={() => insertFormatting("**", "**", "bold text")}
            title="Bold (**text**)"
            className="flex size-7 items-center justify-center rounded-md font-serif font-extrabold text-xs text-slate-800 hover:bg-white hover:text-blue-700 transition-colors"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("*", "*", "italic text")}
            title="Italic (*text*)"
            className="flex size-7 items-center justify-center rounded-md font-serif italic text-xs text-slate-800 hover:bg-white hover:text-blue-700 transition-colors"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("~~", "~~", "strikethrough")}
            title="Strikethrough (~~text~~)"
            className="flex size-7 items-center justify-center rounded-md font-serif line-through text-xs text-slate-800 hover:bg-white hover:text-blue-700 transition-colors"
          >
            S
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("`", "`", "code")}
            title="Inline Code (`code`)"
            className="flex size-7 items-center justify-center rounded-md text-slate-700 hover:bg-white hover:text-blue-700 transition-colors"
          >
            <Code className="size-3.5" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
          <button
            type="button"
            onClick={() => insertFormatting("- ", "", "Analytical observation", true)}
            title="Bulleted List (- item)"
            className="flex size-7 items-center justify-center rounded-md text-slate-700 hover:bg-white hover:text-blue-700 transition-colors"
          >
            <ListBullet className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("1. ", "", "Sequential step", true)}
            title="Numbered List (1. item)"
            className="flex size-7 items-center justify-center rounded-md text-slate-700 hover:bg-white hover:text-blue-700 transition-colors"
          >
            <QueueList className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("- [ ] ", "", "Validation checkpoint", true)}
            title="Checklist (- [ ] task)"
            className="flex size-7 items-center justify-center rounded-md text-slate-700 hover:bg-white hover:text-blue-700 transition-colors"
          >
            <ListCheckbox className="size-3.5" />
          </button>
        </div>

        {/* Clinical Blocks: Table, Callout, Link */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleTableInsert}
            title="Insert Clinical Data Table"
            className="inline-flex h-7 items-center gap-1 px-2 rounded-md text-xs font-semibold text-slate-700 hover:bg-white hover:text-blue-700 transition-colors"
          >
            <TablePen className="size-3.5 text-blue-600" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            type="button"
            onClick={() => handleCalloutInsert("NOTE")}
            title="Insert Clinical Notice Callout"
            className="inline-flex h-7 items-center gap-1 px-1.5 rounded-md text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <span className="text-[11px] font-mono">Notice</span>
          </button>
          <button
            type="button"
            onClick={() => handleCalloutInsert("WARNING")}
            title="Insert Caution Callout"
            className="inline-flex h-7 items-center gap-1 px-1.5 rounded-md text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
          >
            <span className="text-[11px] font-mono">Warning</span>
          </button>
          <button
            type="button"
            onClick={handleLinkInsert}
            title="Insert Citation / External Link"
            className="flex size-7 items-center justify-center rounded-md text-slate-700 hover:bg-white hover:text-blue-700 transition-colors"
          >
            <LinkIcon className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Right toolgroup: View Mode switcher & Metrics */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Live Counters */}
        {(wordCount !== undefined || characterCount !== undefined) && (
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            {wordCount !== undefined && <span>{wordCount} words</span>}
            {characterCount !== undefined && <span>{characterCount} chars</span>}
          </div>
        )}

        {/* View Switcher: Write | Split | Preview */}
        {!hideViewSwitch && onViewModeChange && (
          <div className="flex items-center gap-0.5 bg-slate-200/80 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => onViewModeChange("write")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === "write"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Full Width Editor"
            >
              <span className="flex items-center gap-1">
                <DocumentText className="size-3" />
                <span className="hidden md:inline">Write</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("split")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === "split"
                  ? "bg-white text-blue-700 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Side-by-Side Live Synchronized Preview"
            >
              <span className="flex items-center gap-1">
                <span className="font-mono text-[11px]">◫</span>
                <span className="hidden md:inline">Split View</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("preview")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === "preview"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Full Formatted Preview"
            >
              <span className="flex items-center gap-1">
                <Eye className="size-3" />
                <span className="hidden md:inline">Preview</span>
              </span>
            </button>
          </div>
        )}

        {/* Fullscreen Zen Mode Toggle */}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Zen Fullscreen Mode"}
            className="flex size-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
          >
            {isFullscreen ? (
              <ArrowsReduceDiagonal className="size-3.5" />
            ) : (
              <ArrowsPointingOut className="size-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default SovereignEditorToolbar
