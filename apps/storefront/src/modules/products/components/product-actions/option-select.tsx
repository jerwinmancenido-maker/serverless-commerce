import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)
  const isSpecialInclusion =
    title.toLowerCase().includes("inclusion") ||
    title.toLowerCase().includes("kit") ||
    title.toLowerCase().includes("pack")

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-900 tracking-tight">{title}</span>
        {current && (
          <span className="text-emerald-700 font-semibold">{current}</span>
        )}
      </div>

      {isSpecialInclusion ? (
        /* Rich 3-Column Interactive Inclusion Cards (100% Clickable Box) */
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          data-testid={dataTestId}
        >
          {filteredOptions.map((v) => {
            const isSelected = v === current
            const isSubQ =
              v.toLowerCase().includes("subq") ||
              v.toLowerCase().includes("set") ||
              v.toLowerCase().includes("kit")
            const isBac =
              v.toLowerCase().includes("bac") ||
              v.toLowerCase().includes("water") ||
              v.toLowerCase().includes("reconstitution")

            const icon = isSubQ ? "💉" : isBac ? "💧" : "🧪"
            const subtitle = isSubQ
              ? "+₱250 · Full Prep Kit"
              : isBac
              ? "+₱180 · 10mL Diluent"
              : "Analytical Pure Vial"

            return (
              <button
                type="button"
                onClick={() => updateOption(option.id, v)}
                key={v}
                className={clx(
                  "w-full text-left p-3 rounded-xl border-2 transition-all duration-150 flex flex-col justify-between gap-1.5 cursor-pointer select-none",
                  {
                    "border-emerald-600 bg-emerald-50/80 text-emerald-950 font-semibold shadow-xs ring-2 ring-emerald-500/20":
                      isSelected,
                    "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80":
                      !isSelected,
                  }
                )}
                disabled={disabled}
                data-testid="option-button"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base">{icon}</span>
                  <span
                    className={clx(
                      "size-3.5 rounded-full border flex items-center justify-center transition-colors",
                      isSelected
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {isSelected && (
                      <span className="size-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </div>
                <div className="font-semibold text-xs leading-tight text-slate-900">
                  {v}
                </div>
                <div
                  className={clx(
                    "text-[10px] leading-tight",
                    isSelected ? "text-emerald-700 font-bold" : "text-slate-500"
                  )}
                >
                  {subtitle}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        /* Net Content / Strength Options (Generous Hit Targets, 100% Clickable Surface) */
        <div
          className="flex flex-wrap gap-2"
          data-testid={dataTestId}
        >
          {filteredOptions.map((v) => {
            const isSelected = v === current
            return (
              <button
                type="button"
                onClick={() => updateOption(option.id, v)}
                key={v}
                className={clx(
                  "min-h-[42px] min-w-[70px] rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-150 flex items-center justify-center border cursor-pointer select-none",
                  {
                    "border-emerald-600 bg-emerald-50/90 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/20":
                      isSelected,
                    "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50":
                      !isSelected,
                  }
                )}
                disabled={disabled}
                data-testid="option-button"
              >
                {v}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OptionSelect

