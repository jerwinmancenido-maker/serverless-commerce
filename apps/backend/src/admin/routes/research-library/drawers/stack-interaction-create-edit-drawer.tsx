/**
 * @file    apps/backend/src/admin/routes/research-library/drawers/stack-interaction-create-edit-drawer.tsx
 * @module  StackInteractionCreateEditDrawer
 * @purpose Slide-over drawer for creating and editing pairwise peptide synergy rules, contraindications, and stacking protocols.
 * @contracts
 *   Drawer:  StackInteractionCreateEditDrawer
 *   API:     POST /admin/peptide-stack-interactions · POST /admin/peptide-stack-interactions/:id
 */

import React, { useState, useEffect } from "react"
import {
  Drawer,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  toast,
} from "@medusajs/ui"
import { Bolt, ShieldCheck } from "@medusajs/icons"
import { sdk } from "../../../lib/sdk"
import { SovereignMarkdownCanvas } from "../../../components/editor/sovereign-markdown-canvas"

export type StackInteractionFormState = {
  id?: string
  compound_a: string
  compound_b: string
  status: "synergistic" | "additive" | "contraindicated"
  score: number
  title: string
  mechanismSummary: string
  timingProtocol: string
  safetyRule: string
  citation: string
  cycleLength: string
  washout: string
  morningDose: string
  eveningDose: string
  weeklySchedule: string
  syringeHandling: string
}

interface StackInteractionCreateEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interaction?: any | null
  onSuccess: () => void
}

const BLANK_STATE: StackInteractionFormState = {
  compound_a: "bpc-157",
  compound_b: "tb-500",
  status: "synergistic",
  score: 95,
  title: "",
  mechanismSummary: "",
  timingProtocol: "",
  safetyRule: "",
  citation: "",
  cycleLength: "8 to 12 weeks",
  washout: "4 weeks",
  morningDose: "",
  eveningDose: "",
  weeklySchedule: "5 days on, 2 days off",
  syringeHandling: "Separate sterile syringes for each compound.",
}

export const StackInteractionCreateEditDrawer: React.FC<StackInteractionCreateEditDrawerProps> = ({
  open,
  onOpenChange,
  interaction,
  onSuccess,
}) => {
  const [form, setForm] = useState<StackInteractionFormState>(BLANK_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = Boolean(interaction && (interaction.id || (interaction.compound_a && interaction.compound_b)))

  useEffect(() => {
    if (interaction) {
      setForm({
        id: interaction.id || `${interaction.compound_a}_${interaction.compound_b}`,
        compound_a: interaction.compound_a || "bpc-157",
        compound_b: interaction.compound_b || "tb-500",
        status: (interaction.status || interaction.interactionType || "synergistic") as any,
        score: interaction.score || interaction.synergyScore || 90,
        title: interaction.title || "",
        mechanismSummary: interaction.mechanismSummary || "",
        timingProtocol: interaction.timingProtocol || "",
        safetyRule: interaction.safetyRule || "",
        citation: interaction.citation || "",
        cycleLength: interaction.stackedProtocol?.cycleLength || "8 to 12 weeks",
        washout: interaction.stackedProtocol?.washout || "4 weeks",
        morningDose: interaction.stackedProtocol?.morningDose || "",
        eveningDose: interaction.stackedProtocol?.eveningDose || "",
        weeklySchedule: interaction.stackedProtocol?.weeklySchedule || "5 days on, 2 days off",
        syringeHandling: interaction.stackedProtocol?.syringeHandling || "Separate sterile syringes.",
      })
    } else {
      setForm(BLANK_STATE)
    }
  }, [interaction, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.compound_a.trim() || !form.compound_b.trim() || !form.title.trim()) {
      toast.error("Compound A, Compound B, and Title are required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        id: form.id || `${form.compound_a}_${form.compound_b}`,
        compound_a: form.compound_a.toLowerCase().trim(),
        compound_b: form.compound_b.toLowerCase().trim(),
        status: form.status,
        score: Number(form.score),
        title: form.title,
        mechanismSummary: form.mechanismSummary,
        timingProtocol: form.timingProtocol,
        safetyRule: form.safetyRule,
        citation: form.citation,
        stackedProtocol: {
          cycleLength: form.cycleLength,
          washout: form.washout,
          morningDose: form.morningDose,
          eveningDose: form.eveningDose,
          weeklySchedule: form.weeklySchedule,
          syringeHandling: form.syringeHandling,
        },
      }

      if (isEdit && form.id) {
        await sdk.client.fetch(`/admin/peptide-stack-interactions/${form.id}`, {
          method: "POST",
          body: payload,
        })
        toast.success("Stack synergy rule updated successfully")
      } else {
        await sdk.client.fetch("/admin/peptide-stack-interactions", {
          method: "POST",
          body: payload,
        })
        toast.success("New stack synergy rule created")
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Failed to save stack interaction:", err)
      toast.error(err.message || "Failed to save stack interaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="right-0 top-0 bottom-0 h-full w-full sm:max-w-2xl lg:max-w-3xl bg-white border-l border-slate-200 p-0 flex flex-col justify-between shadow-2xl">
        <Drawer.Header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs shadow-2xs">
              <Bolt className="size-4" />
            </span>
            <div>
              <Drawer.Title className="text-sm font-bold text-slate-900 tracking-tight">
                {isEdit ? "Edit Stack Interaction Rule" : "Create Synergy / Interaction Rule"}
              </Drawer.Title>
              <Drawer.Description className="text-xs text-slate-500 mt-0.5">
                Biochemical interaction matrix, synergy score, and safety contraindications.
              </Drawer.Description>
            </div>
          </div>
        </Drawer.Header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Drawer.Body className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Compound A Handle</Label>
                <Input
                  placeholder="e.g. bpc-157"
                  value={form.compound_a}
                  onChange={(e) => setForm({ ...form, compound_a: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Compound B Handle</Label>
                <Input
                  placeholder="e.g. tb-500"
                  value={form.compound_b}
                  onChange={(e) => setForm({ ...form, compound_b: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Interaction Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => setForm({ ...form, status: val as any })}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="synergistic">Synergistic (High Potency)</Select.Item>
                    <Select.Item value="additive">Additive (Complementary)</Select.Item>
                    <Select.Item value="contraindicated">Contraindicated (Hazard)</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Synergy Score (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Rule Headline</Label>
              <Input
                placeholder="e.g. Tissue Regeneration Dual-Axis: Angiogenesis + Actin Remodeling"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Biochemical Mechanism (Markdown &amp; Tables Supported)</Label>
              <SovereignMarkdownCanvas
                id="mechanism-summary-canvas"
                value={form.mechanismSummary}
                onChange={(val) => setForm({ ...form, mechanismSummary: val })}
                initialViewMode="write"
                minHeight="140px"
                placeholder="Explain receptor binding interactions, target tissue cascades, and complementary kinetics..."
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Timing &amp; Co-Administration Protocol</Label>
              <Input
                placeholder="e.g. Morning SubQ BPC-157 + 2x weekly TB-500"
                value={form.timingProtocol}
                onChange={(e) => setForm({ ...form, timingProtocol: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Safety &amp; Contraindication Warning (Markdown)</Label>
              <SovereignMarkdownCanvas
                id="safety-rule-canvas"
                value={form.safetyRule}
                onChange={(val) => setForm({ ...form, safetyRule: val })}
                initialViewMode="write"
                minHeight="110px"
                placeholder="e.g. Never mix in same syringe. Alternate injection sites..."
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Literature Citation</Label>
              <Input
                placeholder="e.g. Front Pharmacol / Ann N Y Acad Sci"
                value={form.citation}
                onChange={(e) => setForm({ ...form, citation: e.target.value })}
              />
            </div>
          </Drawer.Body>

          <Drawer.Footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="small"
              isLoading={isSubmitting}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {isEdit ? "Save Rule Changes" : "Create Synergy Rule"}
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}

export default StackInteractionCreateEditDrawer
