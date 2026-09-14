"use client"

import { useState, useMemo, Fragment } from "react"
import {
  COA_DOCUMENTS,
  type CoaDocumentItem,
} from "@lib/data/compound-coa-documents"
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react"
import { DocumentText, CheckCircleSolid } from "@medusajs/icons"

export default function CoaDirectoryPanel() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDoc, setSelectedDoc] = useState<CoaDocumentItem | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(1)

  const filteredDocuments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return COA_DOCUMENTS
    return COA_DOCUMENTS.filter(
      (doc) =>
        doc.compoundName.toLowerCase().includes(q) ||
        doc.lotNumber.toLowerCase().includes(q) ||
        doc.casNumber.toLowerCase().includes(q) ||
        doc.testingLab.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const openDocument = (doc: CoaDocumentItem) => {
    setSelectedDoc(doc)
    setZoomLevel(1)
  }

  const closeDocument = () => {
    setSelectedDoc(null)
    setZoomLevel(1)
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Section Title & Explainer ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-block mb-2">
            Analytical Dossier Archive · ISO/IEC 17025
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Third-Party Certificates of Analysis (CoA)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Analytical reference documents, compound characterization monographs, and laboratory verification records.
          </p>
        </div>

        {/* Live Document Counter */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100/80 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{COA_DOCUMENTS.length} Published Batch Reports</span>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by compound name, lot number (e.g. GHK-Cu, BPC-157, PH8-GHK-2026B)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Document Cards Grid ── */}
      {filteredDocuments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-12 text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <DocumentText className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No matching Certificate of Analysis found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            No published laboratory release matched &ldquo;{searchQuery}&rdquo;. Check spelling, try a broader term, or contact support for manufacturer synthesis specifications.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="inline-flex px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header & Badges */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                    <CheckCircleSolid className="h-3 w-3 text-emerald-600" />
                    {doc.purityDisplay}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {doc.lotNumber}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {doc.compoundName}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    CAS: {doc.casNumber} · {doc.molecularWeight}
                  </p>
                </div>

                {/* Analytical Specs Pill List */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Method:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[190px] text-right">
                      {doc.testType.split("&")[0]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Tested Date:</span>
                    <span className="font-medium text-slate-800">{doc.testedDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Sterility (USP &lt;71&gt;):</span>
                    <span className="font-bold text-emerald-700">Sterile (Pass)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {doc.summaryNotes}
                </p>
              </div>

              {/* Card Action Footer */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openDocument(doc)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Review Document</span>
                </button>
                <a
                  href={doc.fileUrl}
                  download
                  className="inline-flex items-center justify-center p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
                  title="Download Certificate File"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Testing & Batch Policy Notice ── */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Batch Testing &amp; Analytical Release Policy
            </h4>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Analytical documentation and reference specifications are maintained per production batch rotation. Compounds in current initial synthesis or research pilot production maintain synthesis Certificates of Conformance (CoC) on file. If your trial protocol requires specific lot documentation, our analytical desk will provide records directly.
            </p>
          </div>
          <a
            href="mailto:support@pepstack.ph?subject=Batch%20CoA%20Inquiry"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs shrink-0 self-start sm:self-center"
          >
            <span>Inquire Lot Records &rarr;</span>
          </a>
        </div>
      </div>

      {/* ── Document Reviewer Modal (Lightbox) ── */}
      <Transition show={!!selectedDoc} as={Fragment}>
        <Dialog as="div" className="relative z-[150]" onClose={closeDocument}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" />
          </TransitionChild>

          <div className="fixed inset-0 z-10 overflow-y-auto p-3 sm:p-6 md:p-8 flex items-center justify-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900">
                {/* Modal Header Bar */}
                <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3 truncate">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <DocumentText className="h-4 w-4" />
                    </span>
                    <div className="truncate">
                      <h3 className="text-sm font-bold truncate">
                        {selectedDoc?.compoundName} · Certificate of Analysis
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        Lot #{selectedDoc?.lotNumber} · {selectedDoc?.testedDate} · {selectedDoc?.purityDisplay}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Zoom Buttons */}
                    <div className="hidden sm:flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.15))}
                        className="px-2 py-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                        title="Zoom Out"
                      >
                        −
                      </button>
                      <span className="px-1 text-[10px] font-mono text-slate-300">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.min(1.75, z + 0.15))}
                        className="px-2 py-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                        title="Zoom In"
                      >
                        +
                      </button>
                    </div>

                    {/* Open in new window / Download */}
                    {selectedDoc && (
                      <a
                        href={selectedDoc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                        title="Open Raw File"
                      >
                        <span>New Window</span>
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}

                    {/* Close button */}
                    <button
                      type="button"
                      onClick={closeDocument}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Close"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Document Body Canvas */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100 flex items-center justify-center">
                  {selectedDoc && (
                    <div
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "top center",
                        transition: "transform 0.15s ease",
                      }}
                      className="w-full max-w-3xl shadow-xl rounded-lg overflow-hidden bg-white"
                    >
                      {/* Embedded Vector / Image / PDF Document */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedDoc.fileUrl}
                        alt={`${selectedDoc.compoundName} Certificate of Analysis`}
                        className="w-full h-auto object-contain block"
                      />
                    </div>
                  )}
                </div>

                {/* Modal Footer Info */}
                <div className="px-5 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{selectedDoc?.testingLab}</span>
                    <span>&middot;</span>
                    <span className="font-mono text-[11px] text-slate-400">{selectedDoc?.accreditation}</span>
                  </div>
                  {selectedDoc && (
                    <a
                      href={selectedDoc.fileUrl}
                      download
                      className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <span>Download original {selectedDoc.fileType.toUpperCase()} file ({selectedDoc.fileSizeBytes})</span>
                      <span>&darr;</span>
                    </a>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
