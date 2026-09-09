/**
 * @file    apps/backend/src/lib/admin-navigation.ts
 * @module  AdminNavigation (Medusa Admin Navigation & Vite Injection)
 * @purpose Admin sidebar layout styling, persistent unified navigation, and live telemetry badges.
 * @contracts
 *   Vite:    routineAdminViteConfig · routineAdminNavigationPlugin
 *   Theme:   researchCompoundsSidebarCss · researchCompoundsSidebarScript
 */

export const ROUTINE_HIDDEN_ADMIN_PATHS = [
  "/app/collections",
  "/app/product-options",
  "/app/reservations",
  "/app/customer-groups",
] as const

export const researchCompoundsSidebarCss = `
${ROUTINE_HIDDEN_ADMIN_PATHS.flatMap((path) => [
  `a[href="${path}"] { display: none !important; }`,
  `li:has(a[href="${path}"]) { display: none !important; }`,
]).join("\n")}

/* ==========================================================================
   Research Compounds — Unified Light Side Panel Theme
   Harmonized with the Founder Command Center Body Aesthetic
   ========================================================================== */

/* 1. Clean Light Sidebar Shell matching Linear / Shopify Polaris */
div:has(> aside),
aside:not([data-collapsed="true"]):not([data-state="collapsed"]) {
  width: 240px !important;
  min-width: 240px !important;
  max-width: 240px !important;
}

aside,
aside > div,
[data-sidebar="true"] {
  background-color: #FFFFFF !important;
  border-right-color: #E2E8F0 !important;
  color: #334155 !important;
  font-family: inherit !important;
}

aside,
aside > .flex.flex-1.flex-col {
  display: flex !important;
  flex-direction: column !important;
  height: 100vh !important;
  overflow: hidden !important;
  background-color: #FFFFFF !important;
  border-right: 1px solid #E2E8F0 !important;
}

aside .sticky.top-0,
aside > div:first-child {
  padding: 0 !important;
}

/* 2. Hide Native Medusa Searchbar (Handled by bespoke #rc-custom-nav search row) */
aside [data-testid="search-button"],
aside button:has(kbd) {
  display: none !important;
}


/* 3. Research Compounds Brand Anchor & Storefront Link */
[data-rc-branded="true"],
button[data-rc-branded="true"],
div[data-rc-branded="true"] {
  display: block !important;
  grid-template-columns: none !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  width: 100% !important;
}

/* Cleanly hide native store button when our custom brand card is active */
aside .sticky.top-0:has(.rc-brand-card) button[id^="radix-"],
aside .sticky.top-0:has(.rc-brand-card) button[aria-haspopup="menu"],
aside .sticky.top-0:has(.rc-brand-card) div.w-full.p-3 {
  display: none !important;
}

.rc-brand-card {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 8px 8px 8px 8px !important;
  width: 100% !important;
  box-sizing: border-box !important;
  border-bottom: 1px solid #F1F5F9 !important;
  margin-bottom: 4px !important;
  gap: 5px !important;
}

.rc-brand-left {
  display: flex !important;
  align-items: center !important;
  gap: 7px !important;
  min-width: 0 !important;
  flex: 1 1 auto !important;
}

.rc-brand-icon {
  width: 28px !important;
  height: 28px !important;
  border-radius: 7px !important;
  background: linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 5px rgba(37, 99, 235, 0.25) !important;
  color: #FFFFFF !important;
  flex-shrink: 0 !important;
}

.rc-brand-text {
  display: flex !important;
  flex-direction: column !important;
  min-width: 0 !important;
  flex: 1 1 auto !important;
  text-align: left !important;
}

.rc-brand-title {
  color: #0F172A !important;
  font-weight: 600 !important;
  font-size: 12px !important;
  letter-spacing: -0.02em !important;
  line-height: 1.25 !important;
  white-space: nowrap !important;
}

.rc-brand-sub {
  color: #64748B !important;
  font-size: 9.5px !important;
  font-weight: 500 !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
}

.rc-storefront-link,
aside a.rc-storefront-link {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 2px !important;
  padding: 2px 5px !important;
  border-radius: 5px !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  color: #2563EB !important;
  background-color: #EFF6FF !important;
  border: 1px solid #BFDBFE !important;
  text-decoration: none !important;
  transition: all 0.15s ease !important;
  white-space: nowrap !important;
  width: auto !important;
  max-width: fit-content !important;
  height: 22px !important;
  flex-shrink: 0 !important;
  box-sizing: border-box !important;
}
.rc-storefront-link:hover,
aside a.rc-storefront-link:hover {
  background-color: #DBEAFE !important;
  color: #1D4ED8 !important;
}

/* 4. Minimalist Section Headers - Hidden for Unified Single-Flow Navigation */
.rc-sidebar-section {
  display: none !important;
}

/* 4b. Completely Hide Medusa's Native Collapsible Navigation & Native Search */
aside nav {
  display: none !important;
}

aside [data-testid="search-button"],
aside button:has(kbd) {
  display: none !important;
}

/* Hide native Medusa footer ghost elements and native settings link */
aside .sticky.bottom-0 > div:not(.rc-system-section),
aside .sticky.bottom-0 [class*="bg-[linear-gradient"],
aside a[href="/app/settings"]:not(.rc-nav-link),
aside div:has(> div > a[href="/app/settings"]:not(.rc-nav-link)),
aside div[class*="gap-y-0.5"] {
  display: none !important;
}

/* Guarantee bespoke settings link is visible in #rc-custom-nav */
#rc-custom-nav a[href="/app/settings"],
#rc-custom-nav a.rc-nav-link[data-route-id="/app/settings"] {
  display: flex !important;
}

/* ==========================================================================
   4c. 100% Bespoke Custom Admin Navigation Panel (#rc-custom-nav)
   Linear / Polaris design with zero Radix collapsible conflicts
   ========================================================================== */
#rc-custom-nav {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 0 !important;
  min-height: 0 !important;
  padding: 2px 8px 8px 8px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-width: thin !important;
  scrollbar-color: #E2E8F0 transparent !important;
  box-sizing: border-box !important;
}

#rc-custom-nav::-webkit-scrollbar {
  width: 4px !important;
}

#rc-custom-nav::-webkit-scrollbar-thumb {
  background-color: #E2E8F0 !important;
  border-radius: 4px !important;
}

/* Custom Search Trigger */
.rc-search-trigger {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  height: 30px !important;
  margin: 2px 0 6px 0 !important;
  padding: 0 8px !important;
  background-color: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 6px !important;
  color: #64748B !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  box-sizing: border-box !important;
}

.rc-search-trigger:hover {
  background-color: #F1F5F9 !important;
  border-color: #CBD5E1 !important;
  color: #0F172A !important;
}

.rc-search-trigger:focus-visible {
  outline: 2px solid #2563EB !important;
  outline-offset: 1px !important;
}

.rc-search-left {
  display: flex !important;
  align-items: center !important;
  gap: 7px !important;
}

.rc-search-left svg {
  width: 14px !important;
  height: 14px !important;
  color: #94A3B8 !important;
}

.rc-search-kbd {
  font-family: inherit !important;
  font-size: 10.5px !important;
  font-weight: 600 !important;
  color: #94A3B8 !important;
  background: #FFFFFF !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 4px !important;
  padding: 1px 4px !important;
  line-height: 1 !important;
}

/* Navigation List and Links */
.rc-nav-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 1px !important;
  margin: 0 !important;
  padding: 0 !important;
  list-style: none !important;
}

.rc-nav-link {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  height: 32px !important;
  padding: 0 8px !important;
  border-radius: 6px !important;
  font-size: 12.5px !important;
  font-weight: 500 !important;
  color: #475569 !important;
  text-decoration: none !important;
  transition: background-color 0.12s ease, color 0.12s ease !important;
  box-sizing: border-box !important;
  user-select: none !important;
  position: relative !important;
  border: 1px solid transparent !important;
}

.rc-nav-link span.rc-nav-text {
  font-weight: inherit !important;
  font-size: inherit !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  flex: 1 1 auto !important;
  line-height: 1.2 !important;
}

.rc-nav-link svg {
  width: 16px !important;
  height: 16px !important;
  color: #64748B !important;
  flex-shrink: 0 !important;
  transition: color 0.12s ease !important;
}

.rc-nav-link:hover {
  background-color: #F8FAFC !important;
  color: #0F172A !important;
}

.rc-nav-link:hover svg {
  color: #0F172A !important;
}

.rc-nav-link:focus-visible {
  outline: 2px solid #2563EB !important;
  outline-offset: -2px !important;
}

/* Active Item Signature Pill (Linear / Shopify Polaris Standard) */
.rc-nav-link.rc-active,
.rc-nav-link[data-active="true"] {
  background-color: #F1F5F9 !important;
  color: #0F172A !important;
  font-weight: 600 !important;
  border: 1px solid transparent !important;
}

.rc-nav-link.rc-active svg,
.rc-nav-link[data-active="true"] svg {
  color: #2563EB !important;
}

.rc-nav-link.rc-active::before,
.rc-nav-link[data-active="true"]::before {
  content: "" !important;
  position: absolute !important;
  left: 0 !important;
  top: 7px !important;
  bottom: 7px !important;
  width: 3px !important;
  border-radius: 0 3px 3px 0 !important;
  background-color: #2563EB !important;
}

.rc-nav-divider {
  height: 1px !important;
  background-color: #F1F5F9 !important;
  margin: 6px 4px !important;
  width: calc(100% - 8px) !important;
}

/* 6. Active Item - Linear / Shopify Polaris Signature Active Pill */
aside a[aria-current="page"]:not(.rc-storefront-link):not(.rc-signout-btn),
aside a.bg-ui-bg-base:not(.rc-storefront-link):not(.rc-signout-btn),
aside a[data-active="true"]:not(.rc-storefront-link):not(.rc-signout-btn) {
  background-color: #EFF6FF !important;
  color: #1D4ED8 !important;
  font-weight: 600 !important;
  border: none !important;
  box-shadow: none !important;
}

aside a[aria-current="page"]:not(.rc-storefront-link):not(.rc-signout-btn) svg,
aside a.bg-ui-bg-base:not(.rc-storefront-link):not(.rc-signout-btn) svg,
aside a[data-active="true"]:not(.rc-storefront-link):not(.rc-signout-btn) svg {
  color: #2563EB !important;
}

aside a[aria-current="page"]:not(.rc-storefront-link):not(.rc-signout-btn)::before,
aside a.bg-ui-bg-base:not(.rc-storefront-link):not(.rc-signout-btn)::before,
aside a[data-active="true"]:not(.rc-storefront-link):not(.rc-signout-btn)::before {
  content: "" !important;
  position: absolute !important;
  left: 0 !important;
  top: 6px !important;
  bottom: 6px !important;
  width: 2.5px !important;
  border-radius: 2px !important;
  background-color: #2563EB !important;
}

/* Scroll clearance for navigation container */
aside > div:nth-child(2),
aside nav,
aside ul,
aside .gap-y-1 {
  overflow-y: auto !important;
  max-height: calc(100vh - 130px) !important;
  padding-bottom: 24px !important;
  scrollbar-width: thin !important;
}

/* Collapsed Sidebar Adaptation */
aside[data-collapsed="true"] .rc-brand-text,
aside[data-collapsed="true"] .rc-storefront-link,
aside[data-collapsed="true"] .rc-sidebar-section,
aside[data-collapsed="true"] .rc-user-meta,
aside[data-collapsed="true"] aside a span,
aside[data-state="collapsed"] .rc-brand-text,
aside[data-state="collapsed"] .rc-storefront-link,
aside[data-state="collapsed"] .rc-sidebar-section,
aside[data-state="collapsed"] .rc-user-meta,
aside[data-state="collapsed"] aside a span {
  display: none !important;
}

aside[data-collapsed="true"] .rc-brand-card,
aside[data-state="collapsed"] .rc-brand-card {
  justify-content: center !important;
  padding: 8px 4px !important;
}

aside[data-collapsed="true"] .rc-user-row,
aside[data-state="collapsed"] .rc-user-row {
  justify-content: center !important;
  padding: 4px !important;
}

/* 7. Badges inside Sidebar Links */
.rc-nav-badge {
  margin-left: auto !important;
  display: inline-flex;
  align-items: center !important;
  justify-content: center !important;
  padding: 1px 6px !important;
  min-width: 18px !important;
  height: 18px !important;
  border-radius: 9999px !important;
  font-size: 10.5px !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  box-sizing: border-box !important;
  flex-shrink: 0 !important;
}

.rc-nav-badge:empty,
.rc-nav-badge[style*="display: none"],
.rc-nav-badge[style*="display:none"] {
  display: none !important;
}

.rc-badge-blue {
  background-color: #EFF6FF !important;
  color: #1D4ED8 !important;
  border: 1px solid #BFDBFE !important;
}

.rc-badge-rose {
  background-color: #FFE4E6 !important;
  color: #BE123C !important;
  border: 1px solid #FECDD3 !important;
}

.rc-badge-amber {
  background-color: #FEF3C7 !important;
  color: #B45309 !important;
  border: 1px solid #FDE68A !important;
}

/* Cleanly hide native user button when our system section is present */
aside .sticky.bottom-0:has(.rc-system-section) button,
aside .sticky.bottom-0:has(.rc-system-section) > div > button {
  display: none !important;
}

/* 8. Bottom System & User Section */
.rc-system-section {
  padding: 6px 8px 8px 8px !important;
  border-top: 1px solid #F1F5F9 !important;
  background-color: #FFFFFF !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.rc-user-row {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 6px 8px !important;
  border-radius: 6px !important;
  background-color: #F8FAFC !important;
  border: 1px solid #F1F5F9 !important;
  margin-top: 2px !important;
  gap: 8px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.rc-user-left {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  min-width: 0 !important;
  flex: 1 1 auto !important;
  overflow: hidden !important;
}

.rc-user-avatar {
  width: 24px !important;
  height: 24px !important;
  border-radius: 9999px !important;
  background-color: #1D4ED8 !important;
  color: #FFFFFF !important;
  font-size: 10.5px !important;
  font-weight: 700 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
}

.rc-user-meta {
  display: flex !important;
  flex-direction: column !important;
  min-width: 0 !important;
  flex: 1 1 auto !important;
  text-align: left !important;
  overflow: hidden !important;
}

.rc-user-name {
  color: #0F172A !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.rc-user-role {
  color: #64748B !important;
  font-size: 10px !important;
  line-height: 1.1 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

aside a.rc-signout-btn,
.rc-signout-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 24px !important;
  height: 24px !important;
  border-radius: 5px !important;
  color: #64748B !important;
  text-decoration: none !important;
  transition: all 0.15s ease !important;
  flex-shrink: 0 !important;
  box-sizing: border-box !important;
  background: transparent !important;
}

aside a.rc-signout-btn svg,
.rc-signout-btn svg {
  width: 14px !important;
  height: 14px !important;
  color: #64748B !important;
  stroke: currentColor !important;
  display: block !important;
  flex-shrink: 0 !important;
}

.rc-signout-btn:hover,
aside a.rc-signout-btn:hover {
  background-color: #FEE2E2 !important;
  color: #DC2626 !important;
}

.rc-signout-btn:hover svg,
aside a.rc-signout-btn:hover svg {
  color: #DC2626 !important;
  stroke: #DC2626 !important;
}

/* ==========================================================================
   Research Compounds — Modern High-End SaaS List & Table Views
   Harmonized with Founder Command Center Body Aesthetic
   ========================================================================== */

/* Full-Width Fluid Command Center Layout (Edge-to-Edge 100% Display) */
main {
  align-items: stretch !important;
  width: 100% !important;
}

main > div[class*="max-w-"] {
  max-width: 100% !important;
  width: 100% !important;
  padding-left: 24px !important;
  padding-right: 24px !important;
  box-sizing: border-box !important;
}

/* Ensure 4-column KPI cards distribute evenly across fluid widths */
main .grid[class*="sm:grid-cols-4"] {
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
}

/* 1. Elevated Table Card Container */
main div:has(> [data-rc-categories-header="true"]),
main div:has(> div > [data-rc-categories-header="true"]),
[data-rc-categories-header="true"] {
  order: -1 !important;
}

main > div:has([data-rc-categories-header="true"]) {
  display: flex !important;
  flex-direction: column !important;
}

.shadow-elevation-card-rest,
main div:has(> table),
main div:has(> div > table) {
  border: 1px solid #E2E8F0 !important;
  border-radius: 12px !important;
  background-color: #FFFFFF !important;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02) !important;
  overflow: hidden !important;
}

/* 2. Soft Minimal Table Header Bar matching HACIEN */
table thead,
thead.border-ui-border-base {
  background-color: #F8FAFC !important;
  border-bottom: 1px solid #E2E8F0 !important;
}

table thead th,
th.txt-compact-small-plus {
  background-color: #F8FAFC !important;
  color: #94A3B8 !important;
  font-size: 10.5px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  padding-top: 11px !important;
  padding-bottom: 11px !important;
  border-bottom: 1px solid #E2E8F0 !important;
}

/* 3. Airy Table Rows & Subtle Divider Lines */
table tbody tr {
  border-bottom: 1px solid #F1F5F9 !important;
  transition: background-color 0.15s ease !important;
}

table tbody tr:hover {
  background-color: #F8FAFC !important;
}

table tbody tr:last-child {
  border-bottom: none !important;
}

/* Sticky first column / row cell sync */
table tbody tr td:first-child {
  transition: background-color 0.15s ease !important;
}

table tbody tr:hover td:first-child {
  background-color: #F8FAFC !important;
}

/* 4. Delicate HACIEN-Style Micro Status Pills */
.rc-status-pill {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 2px 9px !important;
  border-radius: 9999px !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  line-height: 1.25 !important;
  width: fit-content !important;
  white-space: nowrap !important;
  box-sizing: border-box !important;
  text-align: center !important;
}

/* Eradicate nested borders, double outlines, and multiple concentric rings */
.rc-status-pill .rc-status-pill,
.rc-status-pill [class*="rounded-full"][class*="border"] {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  box-shadow: none !important;
}

td:has([class*="rounded-full"][class*="border"]) > .rc-status-pill {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
}

/* Clinical Blue Pill (Captured, Fulfilled, Shipped, Published, Registered, Active, Public) */
.rc-status-emerald,
.rc-status-blue {
  background-color: #EFF6FF !important;
  color: #1D4ED8 !important;
  border: 1px solid rgba(37, 99, 235, 0.35) !important;
}

/* Amber Pill (Awaiting, Authorized, Pending) */
.rc-status-amber {
  background-color: #FFFBEB !important;
  color: #B45309 !important;
  border: 1px solid rgba(245, 158, 11, 0.4) !important;
}

/* Rose Pill (Not fulfilled, Not paid, Rejected, Canceled) */
.rc-status-rose {
  background-color: #FFF1F2 !important;
  color: #BE123C !important;
  border: 1px solid rgba(244, 63, 94, 0.4) !important;
}

/* Slate Pill (Draft, Archived, Inactive) */
.rc-status-slate {
  background-color: #F8FAFC !important;
  color: #475569 !important;
  border: 1px solid #E2E8F0 !important;
}

/* Hide raw legacy square dots */
td [class*="bg-ui-tag-"][class*="-icon"] {
  display: none !important;
}

/* 5. Clean Enterprise Typography matching HACIEN (NO monospace) */
td a[href^="/app/orders/"] span,
td a[href^="/app/draft-orders/"] span,
.rc-order-token {
  font-family: inherit !important;
  font-weight: 600 !important;
  color: #0F172A !important;
  font-size: 13px !important;
  transition: color 0.15s ease !important;
}

td a[href^="/app/orders/"]:hover span {
  color: #2563EB !important;
}

.rc-price-cell,
td:has(> .txt-compact-small:contains("PHP")),
td[data-table-cell-id="total"] {
  font-family: inherit !important;
  font-weight: 500 !important;
  color: #0F172A !important;
  font-size: 13px !important;
}

/* 6. Form Controls: Checkboxes & Filter/Search Toolbar */
input[type="checkbox"] {
  accent-color: #2563EB !important;
  cursor: pointer !important;
}

#filters_menu_trigger,
button:has(> svg):has(+ div input[name="q"]) {
  border-radius: 8px !important;
  border: 1px solid #CBD5E1 !important;
  background-color: #FFFFFF !important;
  color: #334155 !important;
  font-weight: 500 !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03) !important;
  transition: all 0.15s ease !important;
}

#filters_menu_trigger:hover {
  background-color: #F8FAFC !important;
  border-color: #94A3B8 !important;
}

input[name="q"] {
  border-radius: 8px !important;
  border: 1px solid #CBD5E1 !important;
  background-color: #F8FAFC !important;
  font-size: 12.5px !important;
  transition: all 0.15s ease !important;
}

input[name="q"]:focus {
  border-color: #2563EB !important;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) !important;
  background-color: #FFFFFF !important;
}

/* 7. Action Buttons (Create, Export) */
button:has-text("Create"),
a[href$="/create"] button {
  background-color: #2563EB !important;
  color: #FFFFFF !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  border: none !important;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.3) !important;
}

/* 8. Floating Bulk Actions Bar */
div[data-testid="bulk-actions-bar"],
div[role="toolbar"]:has(button) {
  background-color: #0F172A !important;
  color: #FFFFFF !important;
  border: 1px solid #334155 !important;
  border-radius: 9999px !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3) !important;
  padding: 6px 16px !important;
}

/* 9. Pagination Footer */
div:has(> span:has-text("of")):has(> button:has-text("Prev")),
div:has(> [data-testid="pagination"]) {
  border-top: 1px solid #E2E8F0 !important;
  background-color: #FAFBFD !important;
  padding: 10px 20px !important;
}

/* 10. Universal Floating Support Fallback in Admin */
.rc-floating-support-btn {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  width: 52px !important;
  height: 52px !important;
  border-radius: 9999px !important;
  background-color: #0F172A !important;
  color: #FFFFFF !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25) !important;
  cursor: pointer !important;
  z-index: 9999 !important;
  transition: transform 0.15s ease, background-color 0.15s ease !important;
  border: none !important;
  text-decoration: none !important;
}

.rc-floating-support-btn:hover {
  transform: scale(1.05) !important;
  background-color: #1E293B !important;
}

.rc-floating-support-badge {
  position: absolute !important;
  top: -3px !important;
  right: -3px !important;
  background-color: #E11D48 !important;
  color: #FFFFFF !important;
  font-size: 10.5px !important;
  font-weight: 700 !important;
  min-width: 19px !important;
  height: 19px !important;
  padding: 0 4px !important;
  border-radius: 9999px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: 2px solid #FFFFFF !important;
}

/* Hide floating support button on desktop when sidebar is open to avoid blocking table pagination */
@media (min-width: 1024px) {
  body:has(div.lg\:flex > aside) .rc-floating-support-btn,
  body:has(div.hidden.h-screen.lg\:flex > aside) .rc-floating-support-btn,
  body:has(aside) .rc-floating-support-btn {
    display: none !important;
  }
}
`

export const routineAdminNavigationCss = researchCompoundsSidebarCss

export const researchCompoundsSidebarScript = `
(function() {
  function enhanceSidebar() {
    var aside = document.querySelector('aside');
    if (!aside) return;

    // 1. Research Compounds Brand Anchor & Storefront Link (Clean insertion without wiping React buttons)
    var topSection = aside.querySelector('.sticky.top-0') || aside.firstElementChild;
    if (topSection && !topSection.querySelector('[data-rc-brand-card="true"]')) {
      var storeBtn = topSection.querySelector('button[aria-haspopup="menu"]') || topSection.querySelector('[data-testid="store-name"]');
      if (storeBtn) {
        var btnToHide = storeBtn.closest('button') || storeBtn;
        btnToHide.style.display = 'none';
      }

      var brandCard = document.createElement('div');
      brandCard.dataset.rcBrandCard = 'true';
      brandCard.className = 'rc-brand-card';
      brandCard.innerHTML = [
        '<div class="rc-brand-left">',
        '  <div class="rc-brand-icon">',
        '    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
        '      <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0"></path>',
        '    </svg>',
        '  </div>',
        '  <div class="rc-brand-text">',
        '    <span class="rc-brand-title">Research Compounds</span>',
        '    <span class="rc-brand-sub">Founder Operations</span>',
        '  </div>',
        '</div>',
        '<a href="http://localhost:8000/ph" target="_blank" rel="noreferrer" class="rc-storefront-link" title="Open Customer Research Portal">',
        '  <span>Store</span>',
        '  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
        '</a>'
      ].join('');

      var firstChild = topSection.firstChild;
      if (firstChild) {
        topSection.insertBefore(brandCard, firstChild);
      } else {
        topSection.appendChild(brandCard);
      }
    }

    // 2. 100% Bespoke Custom Navigation Shell
    var customNav = document.getElementById("rc-custom-nav");
    if (!customNav) {
      customNav = document.createElement("div");
      customNav.id = "rc-custom-nav";

      var navItems = [
        { href: "/app/dashboard", label: "Dashboard", icon: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>' },
        { href: "/app/orders", label: "Orders", icon: '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>', badge: "orders" },
        { href: "/app/manual-payment-proofs", label: "Payment Proofs", icon: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>', badge: "proofs" },
        { href: "/app/bot-lab", label: "Bot Mission Control", icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>' },
        { href: "/app/customers", label: "Customers", icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' },
        { href: "/app/products", label: "Products", icon: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>' },
        { href: "/app/categories", label: "Categories", icon: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>' },
        { href: "/app/buildable-products", label: "Component Inventory", icon: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>' },
        { href: "/app/bundles", label: "Bundles", icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>' },
        { href: "/app/research-protocols", label: "Research Protocols", icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' },
        { href: "/app/research-library", label: "Research Library", icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>' },
        { href: "/app/inventory", label: "Inventory", icon: '<path d="M3 21h18"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path><path d="M9 9h1"></path><path d="M9 13h1"></path><path d="M9 17h1"></path><path d="M14 9h1"></path><path d="M14 13h1"></path><path d="M14 17h1"></path>' },
        { href: "/app/price-lists", label: "Price Lists", icon: '<circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path>' },
        { href: "/app/promotions", label: "Promotions", icon: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M9 9h.01"></path><path d="m15 9-6 6"></path><path d="M15 15h.01"></path>' },
        { href: "/app/customer-support", label: "Chats", icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>', badge: "chats" },
        { href: "/app/notification-center", label: "Notification Center", icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>' },
        { href: "/app/research-agreements", label: "Research Agreements", icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m9 15 2 2 4-4"></path>' },
        { href: "/app/rewards", label: "Rewards & Referrals", icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>' }
      ];

      var isMac = typeof navigator !== 'undefined' && (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Mac/.test(navigator.userAgent));
      var kbdShortcut = isMac ? '⌘K' : 'Ctrl+K';

      var html = [
        '<div class="rc-search-trigger" role="button" tabindex="0" title="Search (' + kbdShortcut + ')">',
        '  <div class="rc-search-left">',
        '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        '    <span>Search</span>',
        '  </div>',
        '  <kbd class="rc-search-kbd">' + kbdShortcut + '</kbd>',
        '</div>',
        '<div class="rc-nav-list">'
      ];

      navItems.forEach(function(item) {
        html.push(
          '<a href="' + item.href + '" class="rc-nav-link" data-route-id="' + item.href + '" title="' + item.label + '">' +
          '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + item.icon + '</svg>' +
          '  <span class="rc-nav-text">' + item.label + '</span>' +
          (item.badge ? '  <span class="rc-nav-badge ' + (item.badge === 'orders' ? 'rc-badge-blue' : item.badge === 'proofs' ? 'rc-badge-amber' : 'rc-badge-rose') + '" data-badge-id="' + item.badge + '" style="display:none;"></span>' : '') +
          '</a>'
        );
      });

      html.push(
        '</div>',
        '<div class="rc-nav-divider"></div>',
        '<a href="/app/settings" class="rc-nav-link" data-route-id="/app/settings" title="Settings">',
        '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
        '  <span class="rc-nav-text">Settings</span>',
        '</a>'
      );

      customNav.innerHTML = html.join("");

      var nativeNav = aside.querySelector("nav");
      if (nativeNav && nativeNav.parentNode) {
        nativeNav.parentNode.insertBefore(customNav, nativeNav);
      } else {
        var bottomEl = aside.querySelector(".sticky.bottom-0") || aside.lastElementChild;
        if (bottomEl && bottomEl.parentNode) {
          bottomEl.parentNode.insertBefore(customNav, bottomEl);
        } else {
          aside.appendChild(customNav);
        }
      }

      // Search trigger handler
      var searchTrigger = customNav.querySelector(".rc-search-trigger");
      if (searchTrigger) {
        searchTrigger.addEventListener("click", function(e) {
          e.preventDefault();
          var nativeSearchBtn = document.querySelector('aside button:has(kbd), aside [data-testid="search-button"]');
          if (nativeSearchBtn) {
            nativeSearchBtn.click();
          } else {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
          }
        });
      }

      // Routing delegation handler
      customNav.addEventListener("click", function(e) {
        var a = e.target && (e.target.closest ? e.target.closest("a.rc-nav-link") : null);
        if (!a) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var href = a.getAttribute("href");
        if (!href) return;

        // Try proxying to native hidden Medusa link if available
        var nativeLink = document.querySelector('aside nav a[href="' + href + '"]');
        if (nativeLink) {
          e.preventDefault();
          nativeLink.click();
          setTimeout(updateActiveNavStates, 15);
          return;
        }

        // Fallback to pushState + popstate dispatch
        if (window.location.pathname !== href) {
          e.preventDefault();
          window.history.pushState({}, '', href);
          window.dispatchEvent(new PopStateEvent("popstate"));
          updateActiveNavStates();
        }
      });
    }

    // 3. Update Active Nav States with Prefix Matching
    function updateActiveNavStates() {
      var currentPath = window.location.pathname;
      var cNav = document.getElementById("rc-custom-nav");
      if (!cNav) return;
      var links = cNav.querySelectorAll("a.rc-nav-link");
      links.forEach(function(link) {
        var linkHref = link.getAttribute("href");
        if (!linkHref) return;
        var isMatch = (currentPath === linkHref) || (linkHref !== "/app/dashboard" && currentPath.startsWith(linkHref + "/"));
        if (isMatch) {
          link.setAttribute("data-active", "true");
          link.classList.add("rc-active");
        } else {
          link.removeAttribute("data-active");
          link.classList.remove("rc-active");
        }
      });
    }
    updateActiveNavStates();

    // 4. Update Telemetry Badges
    var orderBadge = document.querySelector('[data-badge-id="orders"]');
    if (orderBadge) {
      var match = document.title ? document.title.match(/\\((\\d+)\\s+to\\s+pack\\)/i) : null;
      var toPack = match ? parseInt(match[1], 10) : 0;
      if (toPack > 0) {
        orderBadge.textContent = toPack;
        orderBadge.style.display = "inline-flex";
      } else {
        orderBadge.style.display = "none";
      }
    }

    // Polling support chats
    if (!window.__rcChatsPollingActive) {
      window.__rcChatsPollingActive = true;
      function fetchChatsBadge() {
        fetch("/admin/customer-support", { credentials: "include" })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            var convs = data.conversations || [];
            var unreadCount = convs.reduce(function(acc, c) {
              return acc + (c.unread_count || (c.status === "new" ? 1 : 0));
            }, 0);
            if (unreadCount === 0 && convs.length > 0) unreadCount = convs.length;
            var chatBadge = document.querySelector('[data-badge-id="chats"]');
            if (chatBadge) {
              if (unreadCount > 0) {
                chatBadge.textContent = unreadCount;
                chatBadge.style.display = "inline-flex";
              } else {
                chatBadge.style.display = "none";
              }
            }
          }).catch(function() {});
      }
      fetchChatsBadge();
      setInterval(fetchChatsBadge, 15000);
    }

    // Polling manual payment proofs
    if (!window.__rcProofsPollingActive) {
      window.__rcProofsPollingActive = true;
      function fetchProofsBadge() {
        fetch("/admin/manual-payment-proofs?status=pending", { credentials: "include" })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            var proofs = data.manual_payment_proofs || [];
            var pendingCount = proofs.filter(function(p) { return p.status === "pending"; }).length;
            var proofBadge = document.querySelector('[data-badge-id="proofs"]');
            if (proofBadge) {
              if (pendingCount > 0) {
                proofBadge.textContent = pendingCount;
                proofBadge.style.display = "inline-flex";
              } else {
                proofBadge.style.display = "none";
              }
            }
          }).catch(function() {});
      }
      fetchProofsBadge();
      setInterval(fetchProofsBadge, 15000);
    }

    // 5. User Signout & Founder Admin profile enhancement (in bottom section)
    var bottomDiv = aside.querySelector(".sticky.bottom-0") || aside.lastElementChild;
    if (bottomDiv && !bottomDiv.querySelector(".rc-system-section")) {
      var sysSection = document.createElement("div");
      sysSection.className = "rc-system-section";
      sysSection.innerHTML = [
        '<div class="rc-user-row">',
        '  <div class="rc-user-left">',
        '    <div class="rc-user-avatar">JM</div>',
        '    <div class="rc-user-meta">',
        '      <div class="rc-user-name">Jerwin Mancenido</div>',
        '      <div class="rc-user-role">Founder Admin</div>',
        '    </div>',
        '  </div>',
        '  <a href="/app/logout" class="rc-signout-btn" title="Sign Out">',
        '    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
        '  </a>',
        '</div>'
      ].join("");
      bottomDiv.appendChild(sysSection);
    }

    // 6. Enhance Admin Tables
    enhanceTables();

    // 7. Global Support Fallback
    ensureGlobalSupport();
  }

  // 4. Enhance Admin Tables (Orders, Customers, Products, etc.)
  function enhanceTables() {
    var tables = document.querySelectorAll('table');
    if (!tables.length) return;

    tables.forEach(function(table) {
      var container = table.closest('.shadow-elevation-card-rest') || table.parentElement;
      if (container && !container.classList.contains('rc-table-container')) {
        container.classList.add('rc-table-container');
      }

      var cells = table.querySelectorAll('tbody td');
      cells.forEach(function(td) {
        var text = td.textContent ? td.textContent.trim() : '';

        if (!td.dataset.rcEnhancedStatus) {
          var hasExistingBadge = td.querySelector('.rounded-full.border, .rc-status-pill, [data-badge]');
          if (hasExistingBadge) {
            td.dataset.rcEnhancedStatus = 'true';
            var parentPill = hasExistingBadge.parentElement;
            if (parentPill && parentPill.classList.contains('rc-status-pill')) {
              parentPill.className = '';
            }
            return;
          }

          var dot = td.querySelector('.bg-ui-tag-green-icon, .bg-ui-tag-orange-icon, .bg-ui-tag-red-icon');
          var isStatusText = (
            dot ||
            text === 'Draft' ||
            text === 'Registered' ||
            text === 'Published' ||
            text === 'Active' ||
            text === 'Public' ||
            text === 'Captured' ||
            text === 'Shipped' ||
            text === 'Fulfilled' ||
            text === 'Awaiting' ||
            text === 'Authorized' ||
            text === 'Pending' ||
            text === 'Not fulfilled' ||
            text === 'Not paid' ||
            text === 'Canceled'
          );

          if (isStatusText) {
            td.dataset.rcEnhancedStatus = 'true';
            var wrapper = td.querySelector('.flex.items-center') || td.firstElementChild;
            if (wrapper) {
              if ((dot && dot.classList.contains('bg-ui-tag-green-icon')) || text === 'Captured' || text === 'Shipped' || text === 'Fulfilled' || text === 'Published' || text === 'Registered' || text === 'Active' || text === 'Public') {
                wrapper.className = 'rc-status-pill rc-status-blue';
              } else if ((dot && dot.classList.contains('bg-ui-tag-orange-icon')) || text === 'Awaiting' || text === 'Authorized' || text === 'Pending') {
                wrapper.className = 'rc-status-pill rc-status-amber';
              } else if ((dot && dot.classList.contains('bg-ui-tag-red-icon')) || text === 'Not fulfilled' || text === 'Not paid' || text === 'Canceled') {
                wrapper.className = 'rc-status-pill rc-status-rose';
              } else if (text === 'Draft') {
                wrapper.className = 'rc-status-pill rc-status-slate';
              }
            }
          }
        }

        if (!td.dataset.rcEnhancedPrice && text.includes('PHP')) {
          td.dataset.rcEnhancedPrice = 'true';
          td.classList.add('rc-price-cell');
        }

        if (!td.dataset.rcEnhancedOrder && text.match(/^#\\d+$/)) {
          td.dataset.rcEnhancedOrder = 'true';
          td.classList.add('rc-order-token');
        }
      });

      var catHeader = document.querySelector('[data-rc-categories-header="true"]');
      if (catHeader) {
        var tableEl = document.querySelector('table');
        var card = tableEl ? (tableEl.closest('.shadow-elevation-card-rest') || tableEl.parentElement) : null;
        if (card && card.parentElement && catHeader.parentElement && catHeader.nextElementSibling !== card) {
          card.parentElement.insertBefore(catHeader, card);
        }
      }
    });
  }

  // 5. Universal Floating Support Dock Fallback
  function ensureGlobalSupport() {
    var reactDock = document.querySelector('[data-testid="global-support-dock"]') || document.querySelector('[data-testid="global-support-dock-trigger"]');
    var existingFallback = document.querySelector('.rc-floating-support-btn');

    if (reactDock) {
      if (existingFallback) existingFallback.remove();
      return;
    }

    if (!existingFallback) {
      var btn = document.createElement('a');
      btn.href = '/app/customer-support';
      btn.className = 'rc-floating-support-btn';
      btn.title = 'Open Customer Support';
      btn.innerHTML = [
        '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
        '  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
        '</svg>'
      ].join('');
      document.body.appendChild(btn);

      function updateFallbackBadge() {
        fetch('/admin/customer-support', { credentials: 'include' })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            var convs = data.conversations || [];
            var unread = convs.reduce(function(acc, c) {
              return acc + (c.unread_count || (c.status === 'new' ? 1 : 0));
            }, 0);
            if (unread === 0 && convs.length > 0) unread = convs.length;
            var badge = btn.querySelector('.rc-floating-support-badge');
            if (unread > 0) {
              if (!badge) {
                badge = document.createElement('span');
                badge.className = 'rc-floating-support-badge';
                btn.appendChild(badge);
              }
              badge.textContent = unread;
            } else if (badge) {
              badge.remove();
            }
          }).catch(function() {});
      }
      updateFallbackBadge();
      setInterval(updateFallbackBadge, 10000);
    }
  }

  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function() {
      var aside = document.querySelector('aside');
      if (aside && !document.getElementById('rc-custom-nav')) {
        enhanceSidebar();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceSidebar);
  } else {
    enhanceSidebar();
  }
  setInterval(enhanceSidebar, 2000);

  // Instant Route Transition Event Listeners
  window.addEventListener('popstate', enhanceSidebar);
  document.addEventListener('click', function(e) {
    var a = e.target && (e.target.closest ? e.target.closest('a') : null);
    if (a && a.getAttribute('href') && a.getAttribute('href').startsWith('/app/')) {
      setTimeout(enhanceSidebar, 30);
      setTimeout(enhanceSidebar, 150);
      setTimeout(enhanceSidebar, 500);
    }
  });
})();
`

export const routineAdminNavigationPlugin = () => ({
  name: "pepstack-routine-admin-navigation",
  transformIndexHtml: {
    order: "post" as const,
    handler: () => [
      {
        tag: "style",
        attrs: {
          "data-research-compounds-theme": "sidebar-light",
        },
        children: routineAdminNavigationCss,
        injectTo: "head" as const,
      },
      {
        tag: "script",
        attrs: {
          "data-research-compounds-enhancer": "sidebar",
        },
        children: researchCompoundsSidebarScript,
        injectTo: "body" as const,
      },
    ],
  },
})

/**
 * Return only the project-specific Vite additions. Medusa combines this result
 * with its own Admin Vite configuration, so copying the incoming plugin array
 * would register Medusa's React Refresh plugin a second time.
 */
export const routineAdminViteConfig = () => ({
  plugins: [routineAdminNavigationPlugin()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
})

