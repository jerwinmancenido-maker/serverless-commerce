/**
 * @file    apps/backend/src/admin/components/ui/tag-chip-input.tsx
 * @module  TagChipInput
 * @purpose Interactive tag pill editor for researched benefits, adverse observations, and compound tags.
 * @contracts
 *   Component: TagChipInput
 *   Design:    Sovereign Admin Design System 2.0
 */

import React, { useState, useRef } from "react"
import { XMark } from "@medusajs/icons"

export interface TagChipInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  disabled?: boolean
  variant?: "blue" | "emerald" | "amber" | "rose"
  className?: string
  id?: string
}

export const TagChipInput: React.FC<TagChipInputProps> = ({
  tags = [],
  onChange,
  placeholder = "Type and press Enter or comma...",
  disabled = false,
  variant = "blue",
  className = "",
  id,
}) => {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const variantStyles = {
    blue: {
      chip: "bg-blue-50 text-blue-800 border-blue-200/90 hover:bg-blue-100/70",
      icon: "text-blue-500 hover:text-blue-900",
    },
    emerald: {
      chip: "bg-emerald-50 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100/70",
      icon: "text-emerald-500 hover:text-emerald-900",
    },
    amber: {
      chip: "bg-amber-50 text-amber-900 border-amber-200/90 hover:bg-amber-100/70",
      icon: "text-amber-600 hover:text-amber-950",
    },
    rose: {
      chip: "bg-rose-50 text-rose-800 border-rose-200/90 hover:bg-rose-100/70",
      icon: "text-rose-500 hover:text-rose-900",
    },
  }[variant]

  const addTag = (text: string) => {
    const items = text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (items.length === 0) return
    const newTags = [...tags]
    for (const item of items) {
      if (!newTags.includes(item)) {
        newTags.push(item)
      }
    }
    onChange(newTags)
    setInputValue("")
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text")
    if (pasted && (pasted.includes(",") || pasted.includes("\n"))) {
      e.preventDefault()
      addTag(pasted)
    }
  }

  const removeTag = (indexToRemove: number) => {
    if (disabled) return
    onChange(tags.filter((_, i) => i !== indexToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`min-h-[42px] w-full rounded-lg border border-slate-200 bg-white p-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all flex flex-wrap items-center gap-1.5 cursor-text ${
        disabled ? "opacity-60 pointer-events-none bg-slate-50" : ""
      } ${className}`}
    >
      {tags.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border shadow-2xs transition-colors ${variantStyles.chip}`}
        >
          <span>{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(idx)
              }}
              className={`p-0.5 rounded-sm transition-colors ${variantStyles.icon}`}
            >
              <XMark className="size-3" />
            </button>
          )}
        </span>
      ))}

      <input
        id={id}
        ref={inputRef}
        type="text"
        value={inputValue}
        disabled={disabled}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => {
          if (inputValue.trim()) addTag(inputValue)
        }}
        placeholder={tags.length === 0 ? placeholder : "Add more..."}
        className="flex-1 min-w-[140px] text-xs text-slate-800 placeholder:text-slate-400 border-none outline-none focus:ring-0 bg-transparent px-1.5 py-1"
      />
    </div>
  )
}

export default TagChipInput
