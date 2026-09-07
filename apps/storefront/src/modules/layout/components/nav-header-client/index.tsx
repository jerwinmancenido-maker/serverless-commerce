"use client"

import { useParams, usePathname } from "next/navigation"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  ChevronDownMini,
  MagnifyingGlassMini,
  User,
  ArchiveBox,
  ArrowRightOnRectangle,
  CogSixTooth,
  Gift,
} from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { signout } from "@lib/data/customer"
import CategoryMegaMenu from "../category-mega-menu"
import ResearchMegaMenu from "../research-mega-menu"
import ResearchHubMegaMenu from "../research-hub-mega-menu"
import SearchModal from "../search-modal"

type NavHeaderClientProps = {
  customer: HttpTypes.StoreCustomer | null
  signedIn: boolean
}

export default function NavHeaderClient({
  customer,
  signedIn,
}: NavHeaderClientProps) {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [researchMenuOpen, setResearchMenuOpen] = useState(false)
  const [hubMenuOpen, setHubMenuOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [accountTimer, setAccountTimer] = useState<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)

  const pathname = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const accountMenuRef = useRef<HTMLDivElement>(null)

  const openAccountMenu = () => {
    setMegaMenuOpen(false)
    setResearchMenuOpen(false)
    setHubMenuOpen(false)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pepstack:header-popover-opened", { detail: "account" })
      )
    }
    setAccountMenuOpen(true)
  }

  const closeAccountMenu = useCallback(() => {
    if (accountTimer) {
      clearTimeout(accountTimer)
      setAccountTimer(undefined)
    }
    setAccountMenuOpen(false)
  }, [accountTimer])

  const openAccountMenuAndCancel = () => {
    if (accountTimer) {
      clearTimeout(accountTimer)
      setAccountTimer(undefined)
    }
    openAccountMenu()
  }

  const handleAccountMouseLeave = () => {
    if (accountTimer) {
      clearTimeout(accountTimer)
    }
    const timer = setTimeout(closeAccountMenu, 150)
    setAccountTimer(timer)
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (accountTimer) {
        clearTimeout(accountTimer)
      }
    }
  }, [accountTimer])

  // Close menus when route changes
  useEffect(() => {
    setMegaMenuOpen(false)
    setResearchMenuOpen(false)
    setHubMenuOpen(false)
    closeAccountMenu()
    setSearchModalOpen(false)
  }, [pathname, closeAccountMenu])

  // Click outside listener for account dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        closeAccountMenu()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [closeAccountMenu])

  // Close menus when any header popover opens to maintain mutual exclusivity
  useEffect(() => {
    const handleOtherPopover = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      if (customEvent.detail !== "account") {
        setAccountMenuOpen(false)
      }
      if (customEvent.detail !== "megamenu") {
        setMegaMenuOpen(false)
      }
      if (customEvent.detail !== "researchmenu") {
        setResearchMenuOpen(false)
      }
      if (customEvent.detail !== "hubmenu") {
        setHubMenuOpen(false)
      }
    }

    window.addEventListener("pepstack:header-popover-opened", handleOtherPopover)
    return () => {
      window.removeEventListener(
        "pepstack:header-popover-opened",
        handleOtherPopover
      )
    }
  }, [])

  const formatResearcherName = (cust: HttpTypes.StoreCustomer | null) => {
    if (!cust) return "Account"
    const first = cust.first_name?.trim() || ""
    const last = cust.last_name?.trim() || ""
    if (!first) return last ? `Dr. ${last}` : "Account"
    if (first.toLowerCase().startsWith("dr")) {
      return `${first} ${last}`.trim()
    }
    return `Dr. ${first}`
  }

  return (
    <>
      {/* Desktop Main Navigation Links */}
      <div className="hidden small:flex items-center gap-x-8 h-full">
        {/* Peptides Mega-Menu Trigger */}
        <div
          className="relative h-full flex items-center"
          onMouseEnter={() => {
            setMegaMenuOpen(true)
            setResearchMenuOpen(false)
            setHubMenuOpen(false)
            closeAccountMenu()
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMegaMenuOpen(!megaMenuOpen)
              setResearchMenuOpen(false)
              setHubMenuOpen(false)
            }}
            className={clx(
              "flex items-center gap-1 text-sm font-medium transition-colors py-2 focus:outline-none",
              megaMenuOpen
                ? "text-emerald-500 font-semibold"
                : "text-ui-fg-subtle hover:text-ui-fg-base"
            )}
            aria-expanded={megaMenuOpen}
          >
            <span>Peptides</span>
            <ChevronDownMini
              className={clx(
                "h-4 w-4 transition-transform duration-200",
                megaMenuOpen && "rotate-180 text-emerald-500"
              )}
            />
          </button>
        </div>

        {/* Research Library Mega-Menu Trigger */}
        <div
          className="relative h-full flex items-center"
          onMouseEnter={() => {
            setResearchMenuOpen(true)
            setMegaMenuOpen(false)
            setHubMenuOpen(false)
            closeAccountMenu()
          }}
        >
          <button
            type="button"
            onClick={() => {
              setResearchMenuOpen(!researchMenuOpen)
              setMegaMenuOpen(false)
              setHubMenuOpen(false)
            }}
            className={clx(
              "flex items-center gap-1.5 text-sm font-medium transition-colors py-2 focus:outline-none",
              researchMenuOpen || pathname.includes("/research-library") || pathname.includes("/research-protocols")
                ? "text-emerald-500 font-semibold"
                : "text-ui-fg-subtle hover:text-ui-fg-base"
            )}
            aria-expanded={researchMenuOpen}
          >
            <span>Research Library</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
              Open Access
            </span>
            <ChevronDownMini
              className={clx(
                "h-4 w-4 transition-transform duration-200",
                researchMenuOpen && "rotate-180 text-emerald-500"
              )}
            />
          </button>
        </div>

        {/* Research Hub Mega-Menu Trigger */}
        <div
          className="relative h-full flex items-center"
          onMouseEnter={() => {
            setHubMenuOpen(true)
            setMegaMenuOpen(false)
            setResearchMenuOpen(false)
            closeAccountMenu()
          }}
        >
          <button
            type="button"
            onClick={() => {
              setHubMenuOpen(!hubMenuOpen)
              setMegaMenuOpen(false)
              setResearchMenuOpen(false)
            }}
            className={clx(
              "flex items-center gap-1.5 text-sm font-medium transition-colors py-2 focus:outline-none",
              hubMenuOpen || pathname.includes("/account/research-hub")
                ? "text-emerald-500 font-semibold"
                : "text-ui-fg-subtle hover:text-ui-fg-base"
            )}
            aria-expanded={hubMenuOpen}
          >
            {signedIn ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Research Hub</span>
              </>
            ) : (
              <>
                <span>Research Hub</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                  Client Portal
                </span>
              </>
            )}
            <ChevronDownMini
              className={clx(
                "h-4 w-4 transition-transform duration-200",
                hubMenuOpen && "rotate-180 text-emerald-500"
              )}
            />
          </button>
        </div>
      </div>

      {/* Right Desktop Utilities: Search + Account Menu */}
      <div className="flex items-center gap-x-4">
        {/* Instant Search Trigger */}
        <button
          type="button"
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-ui-bg-subtle/80 hover:bg-ui-bg-subtle px-3 py-1.5 text-xs text-ui-fg-subtle hover:text-ui-fg-base transition-colors border border-ui-border-base focus:outline-none"
          title="Search compounds (Cmd+K)"
        >
          <MagnifyingGlassMini className="h-4 w-4 text-ui-fg-muted" />
          <span className="hidden md:inline">Search compounds…</span>
          <kbd className="hidden md:inline rounded bg-ui-bg-base border border-ui-border-base px-1 py-0.5 text-[10px] text-ui-fg-muted font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Researcher Account Menu / Sign In */}
        {signedIn && customer ? (
          <div
            className="relative"
            ref={accountMenuRef}
            onMouseEnter={openAccountMenuAndCancel}
            onMouseLeave={handleAccountMouseLeave}
          >
            <button
              type="button"
              onClick={() => {
                if (accountMenuOpen) {
                  closeAccountMenu()
                } else {
                  openAccountMenuAndCancel()
                }
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle transition-colors focus:outline-none"
              data-testid="nav-account-dropdown-btn"
              aria-expanded={accountMenuOpen}
            >
              <User className="h-4 w-4 text-emerald-500" />
              <span className="hidden small:inline">
                {formatResearcherName(customer)}
              </span>
              <ChevronDownMini
                className={clx(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  accountMenuOpen && "rotate-180"
                )}
              />
            </button>

            {/* Account Dropdown */}
            {accountMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-slate-200/90 p-2 shadow-2xl z-50 text-xs text-slate-800 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
                data-testid="nav-account-dropdown"
              >
                {/* Profile Header */}
                <div className="px-3 py-2.5 border-b border-slate-100 mb-1 bg-slate-50/70 rounded-xl">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900 truncate text-xs">
                      {customer.first_name?.toLowerCase().startsWith("dr")
                        ? `${customer.first_name} ${customer.last_name || ""}`.trim()
                        : `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Researcher"}
                    </p>
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                      Verified Lab
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] truncate mt-0.5 font-mono">
                    {customer.email}
                  </p>
                </div>

                {/* Quick Navigation Links */}
                <div className="py-1 space-y-0.5">
                  <LocalizedClientLink
                    href="/account"
                    onClick={closeAccountMenu}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors font-medium"
                  >
                    <User className="h-4 w-4 text-emerald-600" />
                    <span>Account Overview</span>
                  </LocalizedClientLink>

                  <LocalizedClientLink
                    href="/account/orders"
                    onClick={closeAccountMenu}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <ArchiveBox className="h-4 w-4 text-slate-400" />
                    <span>Orders &amp; Tracking</span>
                  </LocalizedClientLink>

                  <LocalizedClientLink
                    href="/account/rewards"
                    onClick={closeAccountMenu}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <Gift className="h-4 w-4 text-amber-500" />
                    <span>Rewards &amp; Tier Points</span>
                  </LocalizedClientLink>

                  <LocalizedClientLink
                    href="/account/settings"
                    onClick={closeAccountMenu}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <CogSixTooth className="h-4 w-4 text-slate-400" />
                    <span>Account Settings</span>
                  </LocalizedClientLink>
                </div>

                {/* Sign Out */}
                <div className="border-t border-slate-100 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      closeAccountMenu()
                      signout(countryCode)
                    }}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                  >
                    <ArrowRightOnRectangle className="h-4 w-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden small:flex items-center">
            <LocalizedClientLink
              className="text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base px-2 py-1 transition-colors"
              href="/account"
              data-testid="nav-account-link"
            >
              Sign In
            </LocalizedClientLink>
          </div>
        )}
      </div>

      {/* Embedded Mega-Menu Panels */}
      <CategoryMegaMenu
        isOpen={megaMenuOpen}
        onClose={() => setMegaMenuOpen(false)}
      />

      <ResearchMegaMenu
        isOpen={researchMenuOpen}
        onClose={() => setResearchMenuOpen(false)}
      />

      <ResearchHubMegaMenu
        isOpen={hubMenuOpen}
        onClose={() => setHubMenuOpen(false)}
        signedIn={signedIn}
        customer={customer}
      />

      {/* Instant Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  )
}
