"use client"

import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react"
import { MagnifyingGlass, XMark, ArrowRightMini, Beaker } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment, useEffect, useState } from "react"

import SEARCH_INDEX from "@lib/data/search-index.json"

type SearchItem = {
  title: string
  subtitle: string
  href: string
  badge?: string
}

const DEFAULT_ITEMS: SearchItem[] = SEARCH_INDEX as SearchItem[]

export default function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const filteredItems = query.trim()
    ? DEFAULT_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.badge?.toLowerCase().includes(query.toLowerCase())
      )
    : DEFAULT_ITEMS

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[120]" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="mx-auto max-w-2xl transform divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl transition-all text-slate-900">
              <div className="relative flex items-center px-4 py-3 sm:px-6">
                <MagnifyingGlass className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  className="h-11 w-full bg-transparent pl-3 pr-8 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                  placeholder="Search compounds (Tirzepatide, BPC-157, Reconstitution...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XMark className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto p-3 space-y-1">
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    <Beaker className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    No compounds or guides found matching &ldquo;{query}&rdquo;.
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <LocalizedClientLink
                      key={item.href + item.title}
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex flex-col pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 line-clamp-1">
                          {item.subtitle}
                        </span>
                      </div>
                      <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </LocalizedClientLink>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 text-[11px] text-slate-500 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-700 shadow-2xs">
                    ESC
                  </span>{" "}
                  to close
                </span>
                <span>Press Enter to select</span>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
