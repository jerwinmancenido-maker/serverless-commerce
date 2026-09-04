import { Copy } from "@medusajs/ui"

type TruncatedChipProps = {
  value: string | null | undefined
  label?: string
  maxLength?: number
  className?: string
}

/** Formats overly long machine SKUs/hashes into compact readable badges with 1-click copy */
export const TruncatedChip = ({
  value,
  label,
  maxLength = 20,
  className = "",
}: TruncatedChipProps) => {
  if (!value) return null

  const displayText =
    value.length <= maxLength
      ? value
      : `${value.slice(0, Math.ceil(maxLength / 2) - 1)}…${value.slice(-Math.floor(maxLength / 2) + 2)}`

  return (
    <div
      className={`inline-flex items-center gap-1 font-mono text-[11px] text-ui-fg-muted bg-ui-bg-subtle px-1.5 py-0.5 rounded border border-ui-border-base transition-colors hover:border-ui-border-strong ${className}`}
      title={label ? `${label}: ${value}` : value}
    >
      <span className="truncate">{displayText}</span>
      <Copy
        content={value}
        variant="mini"
        className="text-ui-fg-muted hover:text-ui-fg-base shrink-0"
      />
    </div>
  )
}

export default TruncatedChip
