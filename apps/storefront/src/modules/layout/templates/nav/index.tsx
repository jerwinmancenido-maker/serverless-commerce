import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { storeConfig } from "@lib/store-config"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import NotificationBell from "@modules/layout/components/notification-bell"
import NavHeaderClient from "@modules/layout/components/nav-header-client"

export default async function Nav({
  signedIn = false,
  customer = null,
}: {
  signedIn?: boolean
  customer?: HttpTypes.StoreCustomer | null
}) {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      {/* Top Scientific Trust & Dispatch Ticker */}
      <div className="bg-[#070A11] border-b border-slate-800/60 py-1.5 text-slate-400 text-[11px]">
        <div className="content-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Laboratory Reference Grade Compounds</span>
            <span className="text-slate-600 hidden md:inline">&bull;</span>
            <span className="hidden md:inline text-slate-400">Cold-Chain Dispatched Nationwide</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="hidden sm:inline">Dispatched from Metro Manila &middot; J&amp;T Express</span>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <span className="text-emerald-400 font-medium">Instant GCash, Maya &amp; Bank QR</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <header className="relative h-16 mx-auto border-b duration-200 bg-white/95 backdrop-blur-md border-ui-border-base">
        <nav className="content-container flex items-center justify-between w-full h-full text-small-regular">
          {/* Left: Mobile Menu Trigger + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>

            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2 group focus:outline-none"
              data-testid="nav-store-link"
            >
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-ui-fg-base uppercase">
                {storeConfig.name}
              </span>
              <span className="hidden sm:inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-600 border border-emerald-500/20">
                LAB GRADE
              </span>
            </LocalizedClientLink>
          </div>

          {/* Center Desktop Links & Utilities (Search, Mega-Menu, Account) */}
          <NavHeaderClient customer={customer ?? null} signedIn={signedIn} />

          {/* Right: Notifications & Cart */}
          <div className="flex items-center gap-x-4">
            {signedIn ? <NotificationBell /> : null}
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2 text-sm"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
