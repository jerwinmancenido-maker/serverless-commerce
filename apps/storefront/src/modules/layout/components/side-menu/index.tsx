"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { storeConfig } from "@lib/store-config"
import {
  ArrowRightMini,
  BarsThree,
  Beaker,
  BuildingStorefront,
  ChatBubble,
  CheckCircleSolid,
  ChevronDownMini,
  DocumentText,
  ShoppingCart,
  SquaresPlus,
  User,
  XMark,
} from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment, useState } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Categories: "/categories",
  Account: "/account",
  Cart: "/cart",
}

const PEPTIDE_CATEGORIES = [
  { name: "Metabolic & GLP-1", href: "/categories/metabolic-weight-management-peptides" },
  { name: "Healing & Tissue Repair", href: "/categories/healing-tissue-repair-peptides" },
  { name: "Growth Hormone Axis", href: "/categories/growth-hormone-recovery-peptides" },
  { name: "Longevity & Cellular", href: "/categories/longevity-cellular-health-peptides" },
  { name: "Research Supplies", href: "/categories/research-supplies-accessories" },
]

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({ regions, locales, currentLocale }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()
  const [categoriesOpen, setCategoriesOpen] = useState(true)

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full items-center">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle transition-all ease-out duration-200 focus:outline-none"
                  aria-label="Open Navigation Menu"
                >
                  <BarsThree className="h-5 w-5" />
                  <span className="font-medium">Menu</span>
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm pointer-events-auto small:hidden"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 -translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 -translate-y-2"
              >
                <PopoverPanel
                  data-testid="nav-menu-popup"
                  className="fixed top-[96px] inset-x-0 z-[51] max-h-[85vh] overflow-y-auto bg-white border-b border-slate-200 text-slate-900 shadow-2xl p-5 sm:p-6 small:hidden"
                >
                  <div className="content-container max-w-4xl mx-auto flex flex-col gap-6">
                    {/* Top Bar inside Menu */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                          LAB RESEARCH CATALOG
                        </span>
                      </div>
                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                        aria-label="Close Navigation Menu"
                      >
                        <XMark className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Navigation Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Section 1: Peptides & Categories */}
                      <div className="space-y-3">
                        <div
                          className="flex items-center justify-between cursor-pointer md:cursor-default"
                          onClick={() => setCategoriesOpen(!categoriesOpen)}
                        >
                          <div className="flex items-center gap-2">
                            <SquaresPlus className="h-4 w-4 text-emerald-600" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Peptides &amp; Categories
                            </h4>
                          </div>
                          <ChevronDownMini
                            className={clx(
                              "h-4 w-4 text-slate-400 transition-transform md:hidden",
                              categoriesOpen && "rotate-180"
                            )}
                          />
                        </div>

                        {categoriesOpen && (
                          <div className="space-y-1">
                            <LocalizedClientLink
                              href={SideMenuItems.Store}
                              className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                              onClick={close}
                              data-testid="store-link"
                            >
                              <div className="flex items-center gap-2">
                                <BuildingStorefront className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                                <span>All Compounds (Store)</span>
                              </div>
                              <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                            </LocalizedClientLink>

                            <LocalizedClientLink
                              href={SideMenuItems.Categories}
                              className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                              onClick={close}
                              data-testid="categories-link"
                            >
                              <div className="flex items-center gap-2">
                                <SquaresPlus className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                                <span>All Categories</span>
                              </div>
                              <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                            </LocalizedClientLink>

                            <div className="pt-2 pl-3 border-l border-slate-200 space-y-1">
                              {PEPTIDE_CATEGORIES.map((cat) => (
                                <LocalizedClientLink
                                  key={cat.href}
                                  href={cat.href}
                                  className="block py-1 text-xs text-slate-600 hover:text-emerald-700 transition-colors"
                                  onClick={close}
                                >
                                  {cat.name}
                                </LocalizedClientLink>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Section 2: Open Research Library & Tools */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Beaker className="h-4 w-4 text-emerald-600" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Research Library
                            </h4>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                            Open Access
                          </span>
                        </div>

                        <div className="space-y-1">
                          <LocalizedClientLink
                            href="/research-library#calculator"
                            className="group flex flex-col rounded-xl bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white border border-emerald-200 p-3 hover:border-emerald-300 transition-all shadow-2xs"
                            onClick={close}
                          >
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              Reconstitution Calculator
                            </span>
                            <span className="text-xs text-slate-600 mt-0.5">
                              Calculate BAC water dilution &amp; insulin syringe tick units
                            </span>
                          </LocalizedClientLink>

                          <LocalizedClientLink
                            href="/research-library#coa"
                            className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                            onClick={close}
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircleSolid className="h-4 w-4 text-emerald-600" />
                              <span>Certificates of Analysis (CoA)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                Verified
                              </span>
                              <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                            </div>
                          </LocalizedClientLink>

                          <LocalizedClientLink
                            href="/research-library#comparisons"
                            className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                            onClick={close}
                          >
                            <div className="flex items-center gap-2">
                              <SquaresPlus className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                              <span>Peptide Comparisons</span>
                            </div>
                            <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                          </LocalizedClientLink>

                          <LocalizedClientLink
                            href="/research-library#articles"
                            className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                            onClick={close}
                          >
                            <div className="flex items-center gap-2">
                              <DocumentText className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                              <span>Scientific Articles &amp; Studies</span>
                            </div>
                            <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                          </LocalizedClientLink>

                          <LocalizedClientLink
                            href="/research-library#protocols"
                            className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                            onClick={close}
                          >
                            <div className="flex items-center gap-2">
                              <Beaker className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                              <span>Product Protocols Directory</span>
                            </div>
                            <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                          </LocalizedClientLink>
                        </div>
                      </div>

                      {/* Section 3: Customer Research Suite & Account */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-emerald-600" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Customer Suite
                            </h4>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                            Client Portal
                          </span>
                        </div>

                        <div className="space-y-1">
                          <LocalizedClientLink
                            href={SideMenuItems.Account}
                            className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                            onClick={close}
                            data-testid="account-link"
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                              <span>My Account &amp; Orders</span>
                            </div>
                            <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                          </LocalizedClientLink>

                          <LocalizedClientLink
                            href="/account/research-hub"
                            className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                            onClick={close}
                          >
                            <div className="flex items-center gap-2">
                              <Beaker className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                              <span>My Research Hub</span>
                            </div>
                            <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                          </LocalizedClientLink>

                          <LocalizedClientLink
                            href={SideMenuItems.Cart}
                            className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                            onClick={close}
                            data-testid="cart-link"
                          >
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                              <span>View Cart</span>
                            </div>
                            <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                          </LocalizedClientLink>

                          <LocalizedClientLink
                            href="/account/support"
                            className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                            onClick={close}
                          >
                            <div className="flex items-center gap-2">
                              <ChatBubble className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                              <span>Customer Support &amp; Inquiries</span>
                            </div>
                            <ArrowRightMini className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                          </LocalizedClientLink>
                        </div>
                      </div>
                    </div>

                    {/* Footer Settings & Philippine Logistics */}
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        {regions && (
                          <div
                            onMouseEnter={countryToggleState.open}
                            onMouseLeave={countryToggleState.close}
                            className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-slate-700"
                          >
                            <CountrySelect
                              toggleState={countryToggleState}
                              regions={regions}
                            />
                          </div>
                        )}
                        {!!locales?.length && (
                          <div
                            onMouseEnter={languageToggleState.open}
                            onMouseLeave={languageToggleState.close}
                            className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-slate-700"
                          >
                            <LanguageSelect
                              toggleState={languageToggleState}
                              locales={locales}
                              currentLocale={currentLocale}
                            />
                          </div>
                        )}
                      </div>

                      <Text className="txt-compact-small text-slate-500">
                        &copy; {new Date().getFullYear()} {storeConfig.name}. Laboratory Research Use Only.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
