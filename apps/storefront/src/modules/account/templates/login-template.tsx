"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import type { ResearchAgreementBundle } from "@lib/data/research-agreement"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = ({ agreement }: { agreement: ResearchAgreementBundle | null }) => {
  const [currentView, setCurrentView] = useState("sign-in")

  return (
    <div className="w-full flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        {currentView === "sign-in" ? (
          <Login setCurrentView={setCurrentView} />
        ) : (
          <Register setCurrentView={setCurrentView} agreement={agreement} />
        )}
      </div>

      {/* Security & Regulatory Trust Badges */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          256-Bit SSL Encryption
        </span>
        <span>&bull;</span>
        <span className="flex items-center gap-1.5">
          <span>RUO Standard Laboratory Protocol</span>
        </span>
        <span>&bull;</span>
        <span className="flex items-center gap-1.5">
          <span>Confidential Client Privacy</span>
        </span>
      </div>
    </div>
  )
}

export default LoginTemplate
