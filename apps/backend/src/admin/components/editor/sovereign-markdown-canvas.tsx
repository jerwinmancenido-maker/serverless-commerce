/**
 * @file    apps/backend/src/admin/components/editor/sovereign-markdown-canvas.tsx
 * @module  SovereignMarkdownCanvas
 * @purpose High-density authoring canvas combining formatting toolbar, textarea, and synchronized dual-pane preview.
 * @contracts
 *   Component: SovereignMarkdownCanvas
 *   Design:    Sovereign Admin Design System 2.0
 */

import React, { useRef, useState, useMemo, useEffect } from "react"
import { SovereignEditorToolbar, ViewMode } from "./sovereign-editor-toolbar"
import { SovereignMarkdownPreview } from "./sovereign-markdown-preview"

export interface SovereignMarkdownCanvasProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  initialViewMode?: ViewMode
  className?: string
  id?: string
  label?: string
  sublabel?: string
  disabled?: boolean
}

export const SovereignMarkdownCanvas: React.FC<SovereignMarkdownCanvasProps> = ({
  value,
  onChange,
  placeholder = "Draft clinical findings, molecular mechanisms, and pharmacological monographs...",
  minHeight = "480px",
  initialViewMode = "split",
  className = "",
  id = "sovereign-editor",
  label,
  sublabel,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Undo / Redo history stack
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Exit fullscreen on Escape
  useEffect(() => {
    if (!isFullscreen) return
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleGlobalKey)
    return () => window.removeEventListener("keydown", handleGlobalKey)
  }, [isFullscreen])

  const handleValueChange = (nextValue: string) => {
    onChange(nextValue)

    // Append to history up to 50 snapshots (debounced by length change)
    if (Math.abs(nextValue.length - (history[historyIndex]?.length || 0)) > 3) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(nextValue)
      if (newHistory.length > 50) newHistory.shift()
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1]
      setHistoryIndex(historyIndex - 1)
      onChange(prev)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1]
      setHistoryIndex(historyIndex + 1)
      onChange(next)
    }
  }

  // Keyboard shortcut listener for Ctrl+B, Ctrl+I, Ctrl+Z
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault()
      wrapSelection("**", "**")
    } else if ((e.ctrlKey || e.metaKey) && e.key === "i") {
      e.preventDefault()
      wrapSelection("*", "*")
    } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      if (e.shiftKey) {
        e.preventDefault()
        handleRedo()
      } else {
        e.preventDefault()
        handleUndo()
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const nextVal = value.substring(0, start) + "  " + value.substring(end)
      onChange(nextVal)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.substring(start, end) || "text"
    const nextVal = value.substring(0, start) + before + selected + after + value.substring(end)
    onChange(nextVal)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  // Synchronized scroll from textarea to preview in split view
  const handleTextareaScroll = () => {
    if (viewMode !== "split" || !textareaRef.current || !previewContainerRef.current) return
    const textarea = textareaRef.current
    const preview = previewContainerRef.current
    const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight || 1)
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
  }

  // Live metrics
  const wordCount = useMemo(() => {
    const words = value.trim().split(/\s+/).filter(Boolean)
    return words.length
  }, [value])

  const characterCount = value.length

  const estimatedReadingTime = useMemo(() => {
    const minutes = Math.max(1, Math.ceil(wordCount / 200))
    return `${minutes} min read`
  }, [wordCount])

  const containerClasses = isFullscreen
    ? "fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md p-4 sm:p-8 flex flex-col justify-center"
    : `rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col ${className}`

  const innerCardClasses = isFullscreen
    ? "rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col h-full max-w-7xl mx-auto w-full"
    : "flex flex-col flex-1"

  return (
    <div className={containerClasses}>
      <div className={innerCardClasses}>
        {/* Optional Header title */}
        {(label || sublabel || isFullscreen) && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-100">
            <div>
              {label && <h4 className="text-xs font-bold text-slate-900">{label}</h4>}
              {sublabel && <p className="text-[11px] text-slate-500 font-mono">{sublabel}</p>}
            </div>
            {isFullscreen && (
              <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Zen Fullscreen Mode Active
              </span>
            )}
          </div>
        )}

        {/* Pinned Toolbar */}
        <SovereignEditorToolbar
          textareaRef={textareaRef}
          value={value}
          onChange={handleValueChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          wordCount={wordCount}
          characterCount={characterCount}
          disabled={disabled}
        />

        {/* Canvas Body: Write | Split (50/50) | Preview */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Write / Left Editor Pane */}
          <div
            className={`flex flex-col transition-all overflow-hidden ${
              viewMode === "preview"
                ? "hidden"
                : viewMode === "split"
                ? "w-1/2 border-r border-slate-200/90"
                : "w-full"
            }`}
          >
            <textarea
              id={id}
              ref={textareaRef}
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              onScroll={handleTextareaScroll}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              style={{ minHeight }}
              disabled={disabled}
              className="w-full flex-1 p-4 sm:p-5 font-mono text-xs text-slate-900 bg-white border-none outline-none focus:ring-0 resize-none leading-relaxed disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {/* Preview / Right Rendered Pane */}
          <div
            ref={previewContainerRef}
            className={`flex flex-col overflow-y-auto bg-slate-50/50 transition-all ${
              viewMode === "write"
                ? "hidden"
                : viewMode === "split"
                ? "w-1/2"
                : "w-full"
            }`}
            style={{ minHeight }}
          >
            <div className="p-4 sm:p-6">
              <SovereignMarkdownPreview content={value} />
            </div>
          </div>
        </div>

        {/* Canvas Footer: Quick status, Word Count & Reading Time */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/70 text-[11px] font-mono text-slate-500 select-none">
          <div className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
            <span>Markdown Live Sync</span>
            <span>·</span>
            <span className="hidden sm:inline">Shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Tab (Indent)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{characterCount} chars</span>
            <span>·</span>
            <span className="text-blue-700 font-semibold">{estimatedReadingTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SovereignMarkdownCanvas
