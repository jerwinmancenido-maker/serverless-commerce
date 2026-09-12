/**
 * @file    apps/backend/src/admin/routes/promotions-studio/hooks/use-code-checker.ts
 * @module  UsePromotionCodeChecker
 * @purpose Debounced real-time validation to prevent promotion code collisions.
 * @contracts
 *   Hook:    useCodeChecker
 *   API:     GET /admin/promotions?code=...
 */

import { useState, useEffect } from "react"
import { sdk } from "../../../lib/sdk"

export function useCodeChecker(code: string, currentPromoId?: string) {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed || trimmed.length < 3) {
      setIsAvailable(null)
      setIsChecking(false)
      return
    }

    setIsChecking(true)
    const timer = setTimeout(async () => {
      try {
        const res = await sdk.admin.promotion.list({
          code: [trimmed],
        })
        const match = res.promotions?.find(
          (p: any) => p.code?.toUpperCase() === trimmed && p.id !== currentPromoId
        )
        setIsAvailable(!match)
      } catch (err) {
        // Fallback: If query fails, don't hard block
        setIsAvailable(true)
      } finally {
        setIsChecking(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [code, currentPromoId])

  return { isChecking, isAvailable }
}
