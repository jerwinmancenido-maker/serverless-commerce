"use client"

/**
 * @file    apps/storefront/src/modules/layout/components/nav-header-client/index.tsx
 * @module  NavHeaderClientComponent (Storefront Layout)
 * @purpose Interactive navigation header bar with mega menus, user profile dropdown, and search.
 */

import { useParams, usePathname, useSearchParams } from "next/navigation"
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
import ToolsMenu from "../tools-menu"
import ResearchHubMegaMenu from "../research-hub-mega-menu"
import SearchModal from "../search-modal"

type ActiveMegaMenu = "compounds" | "tools" | "hub" | null

type NavHeaderClientProps = {
  customer: HttpTypes.StoreCustomer | null
  signedIn: boolean
}

export default function NavHeaderClient({
  customer,
  signedIn,
}: NavHeaderClientProps) {
  const [activeMenu, setActiveMenu] = useState<ActiveMegaMenu>(null)
  const [isPinned, setIsPinned] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { countryCode } = useParams() as { countryCode: string }
  const accountMenuRef = useRef<HTMLDivElement>(null)

  const megaMenuOpen = activeMenu === "compounds"
  const toolsMenuOpen = activeMenu === "tools"
  const hubMenuOpen = activeMenu === "hub"

  const closeAllMegaMenus = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setActiveMenu(null)
    setIsPinned(false)
  }, [])

  const handleTriggerClick = (menu: NonNullable<ActiveMegaMenu>) => {
    closeAccountMenu()

    if (activeMenu === menu) {
      closeAllMegaMenus()
    } else {
      setActiveMenu(menu)
      setIsPinned(true)
    }
  }

  const togglePin = () => {
    setIsPinned((prev) => !prev)
  }

  const openAccountMenu = () => {
    closeAllMegaMenus()
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pepstack:header-popover-opened", { detail: "account" })
      )
    }
    setAccountMenuOpen(true)
  }

  const closeAccountMenu = useCallback(() => {
    setAccountMenuOpen(false)
  }, [])

  // ESC key listener to close active menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAllMegaMenus()
        closeAccountMenu()
        setSearchModalOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [closeAllMegaMenus, closeAccountMenu])

  // Close menus when route or query params change
  useEffect(() => {
    closeAllMegaMenus()
    closeAccountMenu()
    setSearchModalOpen(false)
  }, [pathname, searchParams, closeAccountMenu, closeAllMegaMenus])

  // Auto-close open menus on page scroll
  useEffect(() => {
    const handleScroll = () => {
      if (activeMenu) {
        closeAllMegaMenus()
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeMenu, closeAllMegaMenus])

  // Auto-close open menus when a product variant is selected
  useEffect(() => {
    const handleVariant = () => {
      closeAllMegaMenus()
    }
    window.addEventListener("pepstack:variant_selected", handleVariant)
    return () =>
      window.removeEventListener("pepstack:variant_selected", handleVariant)
  }, [closeAllMegaMenus])

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
      if (
        customEvent.detail !== "megamenu" &&
        customEvent.detail !== "protocolsmenu" &&
        customEvent.detail !== "researchmenu" &&
        customEvent.detail !== "hubmenu"
      ) {
        closeAllMegaMenus()
      }
    }

    window.addEventListener("pepstack:header-popover-opened", handleOtherPopover)
    return () => {
      window.removeEventListener(
        "pepstack:header-popover-opened",
        handleOtherPopover
      )
    }
  }, [closeAllMegaMenus])

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
      {/* Desktop Main Navigation Links (4 Semantic Pillars) */}
      <div className="hidden small:flex items-center gap-x-3 lg:gap-x-5 xl:gap-x-6 h-full">
        {/* Pillar 1: Compounds Mega-Menu Trigger */}
        <div className="relative h-full flex items-center">
          <button
            type="button"
            onClick={() => handleTriggerClick("compounds")}
            className={clx(
              "flex items-center gap-1.5 text-sm font-medium transition-all py-1.5 px-2.5 rounded-lg focus:outline-none cursor-pointer",
              megaMenuOpen
                ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-300 shadow-2xs"
                : pathname.startsWith("/categories") || pathname.startsWith("/products") || pathname === "/store"
                ? "text-emerald-600 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
            )}
            aria-expanded={megaMenuOpen}
            aria-haspopup="true"
            title="Click to view Compounds catalog"
          >
            <span>Compounds</span>
            <ChevronDownMini
              className={clx(
                "h-4 w-4 transition-transform duration-200 shrink-0",
                megaMenuOpen ? "rotate-180 text-emerald-600" : "text-slate-400"
              )}
            />
          </button>
        </div>

        {/* Pillar 2: Research Library Direct Link */}
        <div className="relative h-full flex items-center">
          <LocalizedClientLink
            href="/research-library"
            onClick={closeAllMegaMenus}
            className={clx(
              "flex items-center text-sm font-medium transition-all py-1.5 px-2.5 rounded-lg focus:outline-none cursor-pointer",
              pathname.startsWith("/research-library") ||
                pathname.startsWith("/research-articles") ||
                pathname.startsWith("/peptide-comparisons") ||
                pathname.startsWith("/research-protocols")
                ? "text-emerald-600 font-semibold bg-emerald-50/70 border border-emerald-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
            )}
          >
            <span>Research Library</span>
          </LocalizedClientLink>
        </div>

        {/* Pillar 3: Calculators & Tools Dropdown Trigger */}
        <div className="relative h-full flex items-center">
          <button
            type="button"
            onClick={() => handleTriggerClick("tools")}
            className={clx(
              "flex items-center gap-1.5 text-sm font-medium transition-all py-1.5 px-2.5 rounded-lg focus:outline-none cursor-pointer",
              toolsMenuOpen
                ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-300 shadow-2xs"
                : pathname.includes("/calculator") ||
                  pathname.includes("/dosage-chart") ||
                  pathname.includes("/research-stacks") ||
                  pathname.includes("/custom-kit-builder") ||
                  pathname.startsWith("/learn")
                ? "text-emerald-600 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
            )}
            aria-expanded={toolsMenuOpen}
            aria-haspopup="true"
            title="Click to view Calculators & Tools"
          >
            <span>Calculators &amp; Tools</span>
            <ChevronDownMini
              className={clx(
                "h-4 w-4 transition-transform duration-200 shrink-0",
                toolsMenuOpen ? "rotate-180 text-emerald-600" : "text-slate-400"
              )}
            />
          </button>
        </div>

        {/* Pillar 4: Researcher Portal Mega-Menu Trigger */}
        <div className="relative h-full flex items-center">
          <button
            type="button"
            onClick={() => handleTriggerClick("hub")}
            className={clx(
              "flex items-center gap-1.5 text-sm font-medium transition-all py-1.5 px-2.5 rounded-lg focus:outline-none cursor-pointer",
              hubMenuOpen
                ? "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-300 shadow-2xs"
                : pathname.includes("/account/research-hub")
                ? "text-emerald-600 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
            )}
            aria-expanded={hubMenuOpen}
            aria-haspopup="true"
            title="Click to view Researcher Portal"
          >
            {signedIn && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            )}
            <span>Researcher Portal</span>
            <ChevronDownMini
              className={clx(
                "h-4 w-4 transition-transform duration-200 shrink-0",
                hubMenuOpen ? "rotate-180 text-emerald-600" : "text-slate-400"
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
          >
            <button
              type="button"
              onClick={() => {
                if (accountMenuOpen) {
                  closeAccountMenu()
                } else {
                  openAccountMenu()
                }
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle transition-colors focus:outline-none cursor-pointer"
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
        onClose={closeAllMegaMenus}
        isPinned={isPinned && megaMenuOpen}
        onTogglePin={togglePin}
      />

      <ToolsMenu
        isOpen={toolsMenuOpen}
        onClose={closeAllMegaMenus}
        isPinned={isPinned && toolsMenuOpen}
        onTogglePin={togglePin}
      />

      <ResearchHubMegaMenu
        isOpen={hubMenuOpen}
        onClose={closeAllMegaMenus}
        isPinned={isPinned && hubMenuOpen}
        onTogglePin={togglePin}
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
