"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/protocol-print-button.tsx
 * @module  ProtocolPrintButton (Research Protocols Storefront)
 * @purpose Client button component triggering browser print / PDF export dialog.
 */

import { ArrowDownTray } from "@medusajs/icons"
import { Button } from "@modules/common/components/ui"

export default function ProtocolPrintButton() {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.print()
        }
      }}
      className="flex items-center gap-1.5 text-xs sm:text-sm font-medium h-9"
      data-testid="print-protocol-button"
    >
      <ArrowDownTray className="w-4 h-4" />
      Print / Save Protocol
    </Button>
  )
}
