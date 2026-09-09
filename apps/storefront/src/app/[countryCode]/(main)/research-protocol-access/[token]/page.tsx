/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/research-protocol-access/[token]/page.tsx
 * @module  OrderProtocolAccessPage (Research Protocols Storefront)
 * @purpose Renders the order-linked research protocol reader with revision pinning, RUO disclaimers, and revocation detection.
 * @contracts
 *   Fetches: GET /store/research-protocol-access/:token
 *   Components: ProtocolCalculator · LocalizedClientLink · formatPeptideDosage
 */

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArrowLeft, ExclamationCircle, InformationCircleSolid } from "@medusajs/icons"

import { sdk } from "@lib/config"
import { formatPeptideDosage } from "@lib/research-quantity"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui"
import { ProtocolCalculator } from "@modules/research-protocols/calculator"
import ProtocolPrintButton from "@modules/research-protocols/components/protocol-print-button"
import type { ResearchProtocolContent } from "@modules/research-protocols/types"

type Props = {
  params: Promise<{ token: string; countryCode: string }>
}

type ProtocolPayload = {
  title: string
  handle: string
  revision: number
  issued_at: string
  current_revision: number | null
  has_newer_revision: boolean
  content: ResearchProtocolContent
}

type FetchResult =
  | { status: "success"; protocol: ProtocolPayload }
  | { status: "revoked"; message: string }
  | { status: "not_found" }

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Order Protocol Access",
  description: "Preserved research protocol documentation for your order",
}

export default async function OrderProtocolAccessPage({ params }: Props) {
  const { token } = await params

  let fetchResult: FetchResult = { status: "not_found" }

  try {
    const response = await sdk.client.fetch<{ protocol: ProtocolPayload }>(
      `/store/research-protocol-access/${encodeURIComponent(token)}`,
      { method: "GET", cache: "no-store" },
    )
    if (response?.protocol) {
      fetchResult = { status: "success", protocol: response.protocol }
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error && "message" in error
          ? String(error.message)
          : ""

    if (
      errorMessage.toLowerCase().includes("revoked") ||
      errorMessage.toLowerCase().includes("not_allowed")
    ) {
      fetchResult = {
        status: "revoked",
        message:
          errorMessage ||
          "Protocol access has been revoked due to order cancellation, refund, or administrator action.",
      }
    }
  }

  if (fetchResult.status === "not_found") {
    notFound()
  }

  if (fetchResult.status === "revoked") {
    return (
      <main className="content-container py-12 small:py-20">
        <div className="max-w-2xl mx-auto rounded-lg border border-red-200 bg-red-50 p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <ExclamationCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Protocol Access Revoked</h1>
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">
            {fetchResult.message}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <LocalizedClientLink href="/account/orders">
              <Button className="w-full sm:w-auto text-sm">
                Return to My Orders
              </Button>
            </LocalizedClientLink>
            <LocalizedClientLink href="/account/support">
              <Button variant="secondary" className="w-full sm:w-auto text-sm">
                Contact Research Support
              </Button>
            </LocalizedClientLink>
          </div>
        </div>
      </main>
    )
  }

  const { protocol } = fetchResult
  const { content } = protocol

  return (
    <main className="content-container py-8 small:py-14">
      {/* Navigation Breadcrumbs & Back Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-ui-border-base pb-4">
        <div className="flex items-center gap-2 text-xs text-ui-fg-subtle">
          <LocalizedClientLink href="/account/orders" className="hover:text-ui-fg-base transition-colors">
            Orders
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-ui-fg-base font-medium">Protocol Token Access</span>
        </div>
        <div className="flex items-center gap-3">
          <LocalizedClientLink
            href="/account/orders"
            className="flex items-center gap-1.5 text-xs text-ui-fg-subtle hover:text-ui-fg-base font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
          </LocalizedClientLink>
        </div>
      </div>

      {/* Hero Header */}
      <div className="max-w-4xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
          Order-Linked Research Protocol
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-ui-fg-base">
          {content.compound_name || protocol.title}
        </h1>
        <p className="mt-2 text-sm text-ui-fg-subtle">
          Revision {protocol.revision} · Preserved at checkout · Issued {new Date(protocol.issued_at).toLocaleDateString()}
        </p>

        {/* Action Bar */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <LocalizedClientLink href="/account/research-hub">
            <Button className="text-xs sm:text-sm font-medium h-9">
              Track in Research Hub
            </Button>
          </LocalizedClientLink>
          <ProtocolPrintButton />
        </div>

        {/* Philippine FDA / DOH RUO Compliance Notice */}
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
          <InformationCircleSolid className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Philippine FDA / DOH Laboratory Compliance Notice:</span>{" "}
            This reference formulation is documented strictly for in-vitro research, laboratory assay calibration, and chemical characterization.
            Not intended for human or veterinary administration, diagnostic screening, or medical therapy.
          </div>
        </div>

        {/* Newer Revision Notice Banner */}
        {protocol.has_newer_revision && (
          <div className="mt-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4">
            <p className="text-sm font-medium text-ui-fg-base">A newer published revision is available.</p>
            <p className="mt-1 text-xs text-ui-fg-subtle">
              Your documentation is locked to the verified revision issued with your order.
            </p>
            <LocalizedClientLink
              href={`/research-protocols/${protocol.handle}`}
              className="mt-2 inline-block text-xs font-semibold text-ui-fg-interactive hover:underline"
            >
              View current revision {protocol.current_revision} →
            </LocalizedClientLink>
          </div>
        )}

        {content.short_introduction && (
          <p className="mt-6 text-base text-ui-fg-subtle leading-relaxed">
            {content.short_introduction}
          </p>
        )}
      </div>

      {/* Quick Reference Summary Grid */}
      {content.quick_reference && content.quick_reference.length > 0 && (
        <section className="mt-10 max-w-4xl">
          <h2 className="text-lg font-semibold text-ui-fg-base mb-4">Quick Specifications</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {content.quick_reference.map((item) => (
              <div key={item.key} className="rounded-lg border border-ui-border-base bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-ui-fg-subtle uppercase tracking-wider">{item.label}</p>
                <p className="mt-1.5 text-xl font-bold text-ui-fg-base">{item.value}</p>
                {item.description && (
                  <p className="mt-1 text-xs text-ui-fg-subtle">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Reconstitution & Dilution Calculator */}
      {content.calculator && content.calculator.enabled && (
        <section className="mt-12 max-w-4xl">
          <div className="rounded-xl border border-ui-border-base bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-ui-fg-base mb-2">Protocol Reconstitution Calculator</h2>
            <p className="text-sm text-ui-fg-subtle mb-6">
              Calculate diluent solvent volume and resulting reconstitution concentrations according to preserved protocol specifications.
            </p>
            <ProtocolCalculator configuration={content.calculator} />
          </div>
        </section>
      )}

      {/* Protocol Levels & Schedule Rows */}
      {content.protocol_levels && content.protocol_levels.length > 0 && (
        <section className="mt-12 max-w-4xl">
          <h2 className="text-xl font-bold text-ui-fg-base mb-4">Administration & Research Schedule</h2>
          {content.protocol_levels.map((level) => (
            <div key={level.key} className="mb-6 rounded-xl border border-ui-border-base bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-ui-fg-base">{level.title}</h3>
              {level.summary && (
                <p className="mt-1 text-sm text-ui-fg-subtle">{level.summary}</p>
              )}
              <div className="mt-4 grid gap-2">
                {level.rows.map((row, index) => (
                  <div
                    key={`${level.key}-${index}`}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3.5 text-sm"
                  >
                    <span className="font-medium text-ui-fg-base">{row.period}</span>
                    <span className="text-ui-fg-subtle">{formatPeptideDosage(row.amount, row.unit).formatted}</span>
                    <span className="text-ui-fg-subtle font-mono text-xs">{row.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Standard Protocol Narrative Sections */}
      {content.sections && content.sections.length > 0 && (
        <section className="mt-12 max-w-4xl space-y-8">
          {content.sections
            .filter((section) => section.visible)
            .sort((a, b) => a.position - b.position)
            .map((section) => (
              <div key={section.key} className="rounded-xl border border-ui-border-base bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-ui-fg-base">{section.title}</h2>
                <div className="mt-3 whitespace-pre-wrap text-sm text-ui-fg-subtle leading-relaxed">
                  {section.body}
                </div>
              </div>
            ))}
        </section>
      )}

      {/* Statutory Regulatory Disclaimer Footer */}
      {content.disclaimer && (
        <footer className="mt-14 max-w-4xl rounded-lg border border-ui-border-base bg-ui-bg-subtle p-5">
          <p className="text-xs text-ui-fg-subtle leading-relaxed font-mono">
            {content.disclaimer}
          </p>
        </footer>
      )}
    </main>
  )
}
