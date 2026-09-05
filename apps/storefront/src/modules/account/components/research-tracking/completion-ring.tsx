"use client"

import { Sparkles } from "@medusajs/icons"

type Props = {
  total: number
  confirmed: number
  streak: number
}

export default function CompletionRing({ total, confirmed, streak }: Props) {
  const pct = total === 0 ? 0 : Math.round((confirmed / total) * 100)
  const r = 30
  const circ = 2 * Math.PI * r
  const fill = total === 0 ? 0 : (confirmed / total) * circ

  const color =
    pct >= 100 ? "#2563eb" : pct >= 50 ? "#f59e0b" : pct > 0 ? "#6366f1" : "#e5e7eb"

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72" aria-label={`${pct}% of today's routines completed`} role="img">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="7" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          strokeDashoffset={circ / 4}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="36" y="33" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill="#111827">
          {total === 0 ? "–" : `${confirmed}/${total}`}
        </text>
        <text x="36" y="48" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#6b7280">
          done
        </text>
      </svg>
      {streak > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          <Sparkles className="h-3 w-3 text-amber-600" />
          <span>{streak}d streak</span>
        </span>
      )}
    </div>
  )
}
