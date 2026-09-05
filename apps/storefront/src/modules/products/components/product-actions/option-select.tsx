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

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-900 tracking-tight">{title}</span>
        {current && (
          <span className="text-slate-500 font-medium">{current}</span>
        )}
      </div>
      <div
        className="flex flex-wrap gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isSelected = v === current
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "h-9 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-150 flex items-center justify-center border",
                {
                  "border-emerald-600 bg-emerald-50/90 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-500/30":
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
    </div>
  )
}

export default OptionSelect
