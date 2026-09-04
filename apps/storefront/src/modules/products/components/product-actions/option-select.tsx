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
        <span className="font-semibold text-zinc-800 tracking-tight">{title}</span>
        {current && (
          <span className="text-zinc-400 font-medium">{current}</span>
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
                  "bg-zinc-900 text-white border-zinc-900 shadow-xs font-semibold ring-1 ring-zinc-900/5":
                    isSelected,
                  "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80":
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
