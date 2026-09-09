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
aside,
aside > div,
[data-sidebar="true"] {
  background-color: #FFFFFF !important;
  border-right-color: #E2E8F0 !important;
  color: #334155 !important;
  font-family: inherit !important;
}

aside:not([data-collapsed="true"]):not([data-state="collapsed"]) {
  width: 248px !important;
  min-width: 248px !important;
}

aside .sticky.top-0,
aside > div:first-child {
  padding: 0 !important;
}

/* 2. Style Native Medusa Searchbar instead of hiding it */
aside [data-testid="search-button"],
aside button:has(kbd) {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: calc(100% - 16px) !important;
  margin: 4px 8px 6px 8px !important;
  padding: 5px 9px !important;
  height: 30px !important;
  border-radius: 6px !important;
  background-color: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
  color: #64748B !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  transition: all 0.15s ease !important;
  outline: none !important;
  box-sizing: border-box !important;
}
aside [data-testid="search-button"]:hover,
aside button:has(kbd):hover {
  background-color: #F1F5F9 !important;
  border-color: #CBD5E1 !important;
  color: #0F172A !important;
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

/* 4b. Eradicate Native Medusa Radix Collapsibles and Hidden Accordion Wrappers */
aside nav div:has(> [data-state]),
aside nav [data-state],
aside nav [data-radix-collapsible-content],
aside nav button[aria-controls],
aside nav div.px-3.flex.flex-col > div:not(ul) {
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  border: none !important;
}

/* 5. Navigation Items: Strictly 1 Item Per Row, Balanced 32px SaaS Layout */
.rc-sidebar-item {
  display: flex !important;
  width: 100% !important;
  height: 32px !important;
  margin: 2px 0 !important;
  padding: 0 !important;
  list-style: none !important;
  box-sizing: border-box !important;
}

aside a:not(.rc-storefront-link):not(.rc-signout-btn) {
  display: flex !important;
  align-items: center !important;
  gap: 9px !important;
  width: 100% !important;
  height: 32px !important;
  padding: 0 10px !important;
  border-radius: 6px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #334155 !important;
  text-decoration: none !important;
  transition: all 0.12s ease !important;
  position: relative !important;
  box-sizing: border-box !important;
}

aside a:not(.rc-storefront-link):not(.rc-signout-btn) span {
  font-weight: inherit !important;
  font-size: inherit !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

aside a:not(.rc-storefront-link):not(.rc-signout-btn) svg {
  width: 16px !important;
  height: 16px !important;
  color: #64748B !important;
  flex-shrink: 0 !important;
  transition: color 0.12s ease !important;
}

aside a:not(.rc-storefront-link):not(.rc-signout-btn):hover {
  background-color: #F8FAFC !important;
  color: #0F172A !important;
}

aside a:not(.rc-storefront-link):not(.rc-signout-btn):hover svg {
  color: #0F172A !important;
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
  display: inline-flex !important;
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

/* 8. Bottom System & User Section */
.rc-system-section {
  padding: 6px 8px 8px 8px !important;
  border-top: 1px solid #E2E8F0 !important;
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
  border: 1px solid #E2E8F0 !important;
  margin-top: 4px !important;
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
`

export const routineAdminNavigationCss = researchCompoundsSidebarCss

export const researchCompoundsSidebarScript = `
(function() {
  var desiredOrder = [
    { href: '/app/dashboard' },
    { href: '/app/orders' },
    { href: '/app/manual-payment-proofs' },
    { href: '/app/customers' },
    { href: '/app/products' },
    { href: '/app/categories' },
    { href: '/app/buildable-products' },
    { href: '/app/bundles' },
    { href: '/app/research-protocols' },
    { href: '/app/inventory' },
    { href: '/app/price-lists' },
    { href: '/app/promotions' },
    { href: '/app/customer-support' },
    { href: '/app/notification-center' },
    { href: '/app/research-agreements' },
    { href: '/app/rewards' },
    { href: '/app/settings' }
  ];

  function enhanceSidebar() {
    var aside = document.querySelector('aside');
    if (!aside) return;

    // 1. Research Compounds Brand Anchor & Storefront Link
    var topSection = aside.querySelector('.sticky.top-0') || aside.firstElementChild;
    var storeTrigger = topSection ? (topSection.querySelector('[data-testid="store-name"]') || topSection.querySelector('.truncate')) : null;
    if (storeTrigger) {
      var parentBtn = storeTrigger.closest('button') || storeTrigger.closest('div');
      if (parentBtn && (!parentBtn.dataset.rcBranded || !parentBtn.querySelector('.rc-brand-card'))) {
        parentBtn.dataset.rcBranded = 'true';
        parentBtn.style.setProperty('display', 'block', 'important');
        parentBtn.style.setProperty('grid-template-columns', 'none', 'important');
        parentBtn.style.setProperty('width', '100%', 'important');
        parentBtn.style.setProperty('padding', '0', 'important');
        parentBtn.style.setProperty('border', 'none', 'important');
        parentBtn.style.setProperty('background', 'transparent', 'important');
        parentBtn.style.setProperty('box-shadow', 'none', 'important');

        var brandCard = document.createElement('div');
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
        parentBtn.innerHTML = '';
        parentBtn.appendChild(brandCard);
      }
    }

    // 2. Navigation Ordering: Strictly 1 Item Per Row, Decoupled List Items
    var links = Array.from(aside.querySelectorAll('a[href^="/app/"]'));
    if (links.length > 0) {
      var firstLink = links[0];
      var container = firstLink;
      while (container.parentElement && !container.parentElement.classList.contains('gap-y-1')) {
        container = container.parentElement;
      }
      container = container.parentElement;

      if (container) {
        // Clean out empty list items before processing
        Array.from(container.children).forEach(function(child) {
          if (child.tagName === 'LI' && (!child.children.length || !child.querySelector('a'))) {
            child.remove();
          }
        });

        var linkMap = {};
        links.forEach(function(l) {
          var h = l.getAttribute('href');
          if (!h) return;
          var itemWrapper;
          if (l.parentElement && l.parentElement.classList.contains('rc-sidebar-item')) {
            itemWrapper = l.parentElement;
          } else {
            itemWrapper = document.createElement('li');
            itemWrapper.className = 'rc-sidebar-item';
            itemWrapper.appendChild(l);
          }
          linkMap[h] = itemWrapper;
        });

        var routeIcons = {
          '/app/dashboard': '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
          '/app/orders': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path>',
          '/app/manual-payment-proofs': '<rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line>',
          '/app/customers': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
          '/app/products': '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path>',
          '/app/categories': '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
          '/app/buildable-products': '<path d="M12 2 2 7l10 5 10-5-10-5Z"></path><path d="m2 17 10 5 10-5"></path><path d="m2 12 10 5 10-5"></path>',
          '/app/bundles': '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
          '/app/research-protocols': '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10"></path><path d="M6 10h10"></path>',
          '/app/inventory': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
          '/app/price-lists': '<circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path>',
          '/app/promotions': '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>',
          '/app/customer-support': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
          '/app/notification-center': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>',
          '/app/research-agreements': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',
          '/app/rewards': '<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>',
          '/app/settings': '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>'
        };

        var routeLabels = {
          '/app/dashboard': 'Dashboard',
          '/app/orders': 'Orders',
          '/app/manual-payment-proofs': 'Payment Proofs',
          '/app/customers': 'Customers',
          '/app/products': 'Products',
          '/app/categories': 'Categories',
          '/app/buildable-products': 'Component Inventory',
          '/app/bundles': 'Bundles',
          '/app/research-protocols': 'Research Protocols',
          '/app/inventory': 'Inventory',
          '/app/price-lists': 'Price Lists',
          '/app/promotions': 'Promotions',
          '/app/customer-support': 'Customer Support',
          '/app/notification-center': 'Notification Center',
          '/app/research-agreements': 'Research Agreements',
          '/app/rewards': 'Rewards Program',
          '/app/settings': 'Settings'
        };

        // Clean out existing custom headers before repopulating
        aside.querySelectorAll('.rc-sidebar-section').forEach(function(h) {
          h.remove();
        });

        // Eradicate native Medusa Radix accordion wrappers that create ghost gaps
        if (container.parentElement) {
          Array.from(container.parentElement.children).forEach(function(sibling) {
            if (sibling !== container && sibling.tagName !== 'UL') {
              sibling.style.setProperty('display', 'none', 'important');
              sibling.style.setProperty('height', '0px', 'important');
              sibling.style.setProperty('min-height', '0px', 'important');
              sibling.style.setProperty('max-height', '0px', 'important');
              sibling.style.setProperty('margin', '0px', 'important');
              sibling.style.setProperty('padding', '0px', 'important');
              sibling.style.setProperty('overflow', 'hidden', 'important');
            }
          });
        }

        // Ensure container and parent scroll smoothly with compact padding
        container.style.setProperty('padding-bottom', '24px', 'important');
        container.style.setProperty('overflow-y', 'auto', 'important');
        container.style.setProperty('max-height', 'calc(100vh - 120px)', 'important');
        if (container.parentElement) {
          container.parentElement.style.setProperty('overflow-y', 'auto', 'important');
          container.parentElement.style.setProperty('max-height', 'calc(100vh - 110px)', 'important');
          container.parentElement.style.setProperty('padding-bottom', '24px', 'important');
        }

        var currentPath = window.location.pathname;

        desiredOrder.forEach(function(item) {
          var el = linkMap[item.href];
          if (!el) {
            var a = document.createElement('a');
            a.setAttribute('href', item.href);
            a.className = 'flex items-center gap-x-2';
            var iconSvg = routeIcons[item.href] || '';
            var labelText = routeLabels[item.href] || item.href.replace('/app/', '');
            a.innerHTML = [
              '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
              iconSvg,
              '</svg>',
              '<span>' + labelText + '</span>'
            ].join('');
            var wrapper = document.createElement('li');
            wrapper.className = 'rc-sidebar-item';
            wrapper.appendChild(a);
            el = wrapper;
            linkMap[item.href] = el;
          }

          var linkEl = el.querySelector('a');
          if (linkEl) {
            linkEl.classList.remove('pl-[34px]', 'pl-8', 'pl-7');
            if (!linkEl.querySelector('svg') && routeIcons[item.href]) {
              var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              svg.setAttribute('viewBox', '0 0 24 24');
              svg.setAttribute('width', '16');
              svg.setAttribute('height', '16');
              svg.setAttribute('fill', 'none');
              svg.setAttribute('stroke', 'currentColor');
              svg.setAttribute('stroke-width', '2');
              svg.setAttribute('stroke-linecap', 'round');
              svg.setAttribute('stroke-linejoin', 'round');
              svg.innerHTML = routeIcons[item.href];
              linkEl.insertBefore(svg, linkEl.firstChild);
            }

            var isExact = currentPath === item.href;
            var isNested = currentPath.startsWith(item.href + '/') && item.href !== '/app';
            if (isExact || isNested) {
              linkEl.setAttribute('data-active', 'true');
            } else {
              linkEl.removeAttribute('data-active');
            }
          }

          container.appendChild(el);
        });
      }
    }

    // 3. System Section at the bottom of aside (User Profile)
    var bottomDiv = aside.querySelector('.sticky.bottom-0') || aside.lastElementChild;
    if (bottomDiv && (!bottomDiv.querySelector('.rc-system-section') || !bottomDiv.querySelector('.rc-signout-btn'))) {
      bottomDiv.innerHTML = '';
      var sysSection = document.createElement('div');
      sysSection.className = 'rc-system-section';
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
      ].join('');
      bottomDiv.appendChild(sysSection);
    }

    // 4. Live Telemetry Badges (Orders to pack, Support Chats, Payment Proofs)
    var ordersLink = aside.querySelector('a[href="/app/orders"]');
    if (ordersLink && !ordersLink.dataset.rcBadgePolling) {
      ordersLink.dataset.rcBadgePolling = 'true';
      function updateOrdersBadge() {
        var match = document.title ? document.title.match(/\\((\\d+)\\s+to\\s+pack\\)/i) : null;
        var toPack = match ? parseInt(match[1], 10) : 0;
        var existingBadge = ordersLink.querySelector('.rc-badge-blue');
        if (toPack > 0) {
          if (!existingBadge) {
            existingBadge = document.createElement('span');
            existingBadge.className = 'rc-nav-badge rc-badge-blue';
            ordersLink.appendChild(existingBadge);
          }
          existingBadge.textContent = toPack;
        } else if (existingBadge) {
          existingBadge.remove();
        }
      }
      updateOrdersBadge();
      setInterval(updateOrdersBadge, 4000);
    }

    var chatsLink = aside.querySelector('a[href="/app/customer-support"]');
    if (chatsLink && !chatsLink.dataset.rcBadgePolling) {
      chatsLink.dataset.rcBadgePolling = 'true';
      function updateChatsBadge() {
        fetch('/admin/customer-support', { credentials: 'include' })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            var convs = data.conversations || [];
            var unreadCount = convs.reduce(function(acc, c) {
              return acc + (c.unread_count || (c.status === 'new' ? 1 : 0));
            }, 0);
            if (unreadCount === 0 && convs.length > 0) {
              unreadCount = convs.length;
            }
            var existingBadge = chatsLink.querySelector('.rc-badge-rose');
            if (unreadCount > 0) {
              if (!existingBadge) {
                existingBadge = document.createElement('span');
                existingBadge.className = 'rc-nav-badge rc-badge-rose';
                chatsLink.appendChild(existingBadge);
              }
              existingBadge.textContent = unreadCount;
            } else if (existingBadge) {
              existingBadge.remove();
            }
          }).catch(function() {});
      }
      updateChatsBadge();
      setInterval(updateChatsBadge, 15000);
    }

    var proofsLink = aside.querySelector('a[href="/app/manual-payment-proofs"]');
    if (proofsLink && !proofsLink.dataset.rcBadgePolling) {
      proofsLink.dataset.rcBadgePolling = 'true';
      function updateProofsBadge() {
        fetch('/admin/manual-payment-proofs?status=pending', { credentials: 'include' })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            var proofs = data.manual_payment_proofs || [];
            var pendingCount = proofs.filter(function(p) { return p.status === 'pending'; }).length;
            var existingBadge = proofsLink.querySelector('.rc-badge-amber');
            if (pendingCount > 0) {
              if (!existingBadge) {
                existingBadge = document.createElement('span');
                existingBadge.className = 'rc-nav-badge rc-badge-amber';
                proofsLink.appendChild(existingBadge);
              }
              existingBadge.textContent = pendingCount;
            } else if (existingBadge) {
              existingBadge.remove();
            }
          }).catch(function() {});
      }
      updateProofsBadge();
      setInterval(updateProofsBadge, 15000);
    }

    // 5. Enhance Admin Tables (Orders, Customers, Products, etc.)
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

          if (!td.dataset.rcEnhancedOrder && text.match(/^#\d+$/)) {
            td.dataset.rcEnhancedOrder = 'true';
            td.classList.add('rc-order-token');
          }
        });

        // Ensure Categories Clinical Operations Header is placed before table
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

    // 6. Universal Floating Support Dock Fallback
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

    enhanceTables();
    ensureGlobalSupport();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceSidebar);
  } else {
    enhanceSidebar();
  }
  setInterval(enhanceSidebar, 1500);
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

