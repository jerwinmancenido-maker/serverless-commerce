"use client"

import { Disclosure } from "@headlessui/react"
import { Button, clx } from "@modules/common/components/ui"
import { useEffect } from "react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"
import { PencilSquare, XMark, CheckCircleSolid, ExclamationCircleSolid } from "@medusajs/icons"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  "data-testid"?: string
}

function UserIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function MailIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function PhoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function getFieldMetadata(label: string) {
  const normalized = label.toLowerCase()
  if (normalized.includes("name")) {
    return {
      icon: UserIcon,
      subtitle: "Researcher Full Legal Name",
      badge: "Verified Lab Researcher",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    }
  }
  if (normalized.includes("email")) {
    return {
      icon: MailIcon,
      subtitle: "Primary Contact & Login Identifier",
      badge: "Authentication Credential",
      badgeClass: "bg-blue-50 text-blue-800 border-blue-200/80",
    }
  }
  if (normalized.includes("phone")) {
    return {
      icon: PhoneIcon,
      subtitle: "Mobile Telemetry & Delivery Alerts",
      badge: "Dispatch SMS Alerts",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200/80",
    }
  }
  return {
    icon: UserIcon,
    subtitle: label,
    badge: "Account Setting",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200/80",
  }
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "An error occurred, please try again",
  children,
  "data-testid": dataTestid,
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()
  const { pending } = useFormStatus()
  const meta = getFieldMetadata(label)
  const IconComponent = meta.icon

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  const isEmpty = typeof currentInfo === "string" && (!currentInfo || currentInfo.trim() === "" || currentInfo === "undefined undefined" || currentInfo === "null")

  return (
    <div
      className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300/90 transition-all duration-200"
      data-testid={dataTestid}
    >
      <div className="flex items-start sm:items-center justify-between gap-4">
        {/* Left: Avatar Icon + Field Telemetry + Value */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="size-10 sm:size-11 rounded-xl bg-slate-100/90 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
            <IconComponent className="size-5 text-slate-700" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {label}
              </span>
              <span className={clx("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border", meta.badgeClass)}>
                {meta.badge}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate" data-testid="current-info">
              {typeof currentInfo === "string" ? (
                isEmpty ? (
                  <span className="text-sm font-normal text-slate-400 italic">
                    Not specified · Click edit to set
                  </span>
                ) : (
                  currentInfo
                )
              ) : (
                currentInfo
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Edit / Cancel Button */}
        <div className="shrink-0">
          <button
            type={state ? "reset" : "button"}
            onClick={handleToggle}
            data-testid="edit-button"
            data-active={state}
            className={clx(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-150 shadow-2xs cursor-pointer",
              state
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
            )}
          >
            {state ? (
              <>
                <XMark className="size-3.5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <PencilSquare className="size-3.5 text-slate-400" />
                <span>Edit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[200px] opacity-100 mt-4": isSuccess,
              "max-h-0 opacity-0": !isSuccess,
            }
          )}
          data-testid="success-message"
        >
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-xs font-medium text-emerald-800 shadow-2xs">
            <CheckCircleSolid className="size-4 text-emerald-600 shrink-0" />
            <span>{label} updated successfully in laboratory profile.</span>
          </div>
        </Disclosure.Panel>
      </Disclosure>

      {/* Error Notification */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[200px] opacity-100 mt-4": isError,
              "max-h-0 opacity-0": !isError,
            }
          )}
          data-testid="error-message"
        >
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-xs font-medium text-rose-800 shadow-2xs">
            <ExclamationCircleSolid className="size-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </Disclosure.Panel>
      </Disclosure>

      {/* Expandable Form Drawer */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-visible",
            {
              "max-h-[1000px] opacity-100 mt-4": state,
              "max-h-0 opacity-0 hidden": !state,
            }
          )}
        >
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5 mt-2">
            <div className="mb-3 text-xs text-slate-500 font-medium">
              Modify your {label.toLowerCase()} record below. Updates are immediately reflected in your active clinical profile.
            </div>
            <div className="space-y-3">{children}</div>
            <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-200/60">
              <button
                type="button"
                onClick={handleToggle}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Cancel
              </button>
              <Button
                isLoading={pending}
                className="min-w-[120px] rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold py-2 shadow-xs cursor-pointer"
                type="submit"
                data-testid="save-button"
              >
                Save changes
              </Button>
            </div>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  )
}

export default AccountInfo

