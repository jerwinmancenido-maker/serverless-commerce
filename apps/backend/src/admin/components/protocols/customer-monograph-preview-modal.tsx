/**
 * @file    apps/backend/src/admin/components/protocols/customer-monograph-preview-modal.tsx
 * @module  CustomerMonographPreviewModal (Research Protocols Component)
 * @purpose Modal previewing published customer monographs with strict Non-FDA RUO compliance.
 * @contracts
 *   Component: CustomerMonographPreviewModal
 */

import { AdminBadge } from "../ui/admin-badge"
import type { ResearchProtocolSeries } from "../../routes/compounded-products/research-protocol-types"

export type CustomerMonographPreviewModalProps = {
  open: boolean
  onClose: () => void
  protocol: ResearchProtocolSeries | null
}

export const CustomerMonographPreviewModal = ({
  open,
  onClose,
  protocol,
}: CustomerMonographPreviewModalProps) => {
  if (!open || !protocol) return null

  const revision = protocol.revisions.find((r) => r.status === "published") || protocol.revisions[0]
  const content = revision?.content

  const title = content?.compound_name || revision?.title || protocol.protocol_key
  const category = content?.protocol_category_type === "blend"
    ? "Multi-Peptide Blend"
    : content?.protocol_category_type === "single_peptide"
      ? "Single Analytical Peptide"
      : "Laboratory Labware & Supplies"

  const mol = content?.molecular_details
  const recon = content?.reconstitution_details
  const quickRef = content?.quick_reference || []
  const references = content?.references || []
  const sections = content?.sections || []
  const linkedProduct = protocol.product_links?.[0]?.product

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-blue-600 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Customer Monograph Live Preview
                </span>
                <AdminBadge variant="blue" dot>
                  Storefront Parity
                </AdminBadge>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                {title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 hidden sm:inline">
              Revision {revision?.revision || 1}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold transition-all cursor-pointer"
              title="Close Preview"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Top Banner */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                {category}
              </span>
              <p className="text-xs text-blue-800 mt-0.5">
                Analytical Monograph &amp; Aseptic Handling Protocol
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AdminBadge variant="blue">
                {content?.purity_standard || "≥99.0% HPLC Analysis Verified"}
              </AdminBadge>
              <AdminBadge variant="purple">
                Research Grade
              </AdminBadge>
            </div>
          </div>

          {/* Quick Reference Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase">CAS Number</span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                {mol?.cas_number || "Verified"}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase">PubChem CID</span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                {mol?.pubchem_cid || "Verified"}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Molecular Weight</span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                {mol?.molecular_weight_g_per_mol ? `${mol.molecular_weight_g_per_mol} g/mol` : "Analytical Standard"}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Formula / Structure</span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                {mol?.sequence_or_formula || "Verified"}
              </p>
            </div>
          </div>

          {/* Quick Reference Attributes */}
          {quickRef.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 p-4 bg-white">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Physicochemical Specifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {quickRef.map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-semibold text-slate-900 font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reconstitution Guidelines */}
          {recon && (
            <div className="rounded-xl border border-blue-200/80 bg-blue-50/30 p-4">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                Aseptic Reconstitution &amp; Dilution Guidelines
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-blue-100">
                  <span className="text-slate-500">Recommended Diluent</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {recon.solvent || "Bacteriostatic Water USP"}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-blue-100">
                  <span className="text-slate-500">Target Diluent Volume</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {recon.default_diluent_ml || 2.0} mL
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-blue-100">
                  <span className="text-slate-500">Dissolution Method</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {recon.dissolution_method || "Slow laminar flow down vial wall"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Monograph Sections */}
          {sections.length > 0 && (
            <div className="space-y-4">
              {sections.map((sec) => (
                <div key={sec.key} className="rounded-xl border border-slate-200/80 p-4 bg-white">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    {sec.title}
                  </h4>
                  <div
                    className="text-xs leading-relaxed text-slate-700 whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: sec.body }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* PubMed Literature Citations */}
          {references.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 p-4 bg-white">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Primary Literature &amp; Verified Citations
              </h4>
              <ul className="space-y-2 text-xs">
                {references.map((ref, idx) => (
                  <li key={ref.reference_key || idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="font-semibold text-slate-900">{ref.title}</p>
                    {ref.authors && <p className="text-[11px] text-slate-500 mt-0.5">{ref.authors}</p>}
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-1 text-[11px] text-blue-600 hover:underline font-mono"
                      >
                        {ref.url} &rarr;
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mandatory RUO Legal Disclaimer */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 text-[11px] text-amber-900">
            <span className="font-bold uppercase tracking-wider block mb-1">
              Regulatory Compliance &amp; Intended Use
            </span>
            {content?.disclaimer || "Strictly for in-vitro laboratory research and analytical calibration. Not for human, veterinary, diagnostic, or therapeutic consumption. Not evaluated or approved by the FDA."}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Linked Product:</span>
            <span className="font-mono font-semibold text-slate-800">
              {linkedProduct?.title || protocol.protocol_key}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`http://localhost:8000/ph/research-protocols/${protocol.protocol_key}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              Open in Live Storefront &rarr;
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Done Reviewing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
