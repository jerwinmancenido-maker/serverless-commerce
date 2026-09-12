/**
 * @file    apps/backend/src/admin/routes/promotions-studio/hooks/use-draft-storage.ts
 * @module  UsePromotionDraftStorage
 * @purpose Auto-saves promotion studio state to localStorage to prevent accidental data loss.
 * @contracts
 *   Hook:    useDraftStorage
 */

import { useState, useEffect, useCallback } from "react"
import { PromotionStudioState } from "../types"

const STORAGE_KEY = "hacien_promo_studio_draft_v1"

export function useDraftStorage(
  initialState: PromotionStudioState,
  isEditMode: boolean
) {
  const [draftRestored, setDraftRestored] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load draft on mount if in create mode
  const checkStoredDraft = useCallback((): PromotionStudioState | null => {
    if (isEditMode) return null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed
    } catch {
      return null
    }
  }, [isEditMode])

  // Save draft debounced
  const saveDraft = useCallback(
    (state: PromotionStudioState) => {
      if (isEditMode) return
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        setLastSaved(new Date())
      } catch (err) {
        console.warn("Failed to persist draft to localStorage:", err)
      }
    },
    [isEditMode]
  )

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setLastSaved(null)
      setDraftRestored(false)
    } catch (err) {
      console.warn("Failed to clear draft from localStorage:", err)
    }
  }, [])

  return {
    checkStoredDraft,
    saveDraft,
    clearDraft,
    lastSaved,
    draftRestored,
    setDraftRestored,
  }
}
