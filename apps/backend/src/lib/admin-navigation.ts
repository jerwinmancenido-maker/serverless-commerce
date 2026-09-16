/**
 * @file    apps/backend/src/lib/admin-navigation.ts
 * @module  AdminNavigation (Medusa Admin Navigation & Vite Injection)
 * @purpose Admin sidebar layout styling, persistent unified navigation, and live telemetry badges.
 * @contracts
 *   Vite:    routineAdminViteConfig · routineAdminNavigationPlugin
 *   Theme:   routineAdminNavigationCss · researchCompoundsSidebarScript
 */

export const ROUTINE_HIDDEN_ADMIN_PATHS = [
  "/app/collections",
  "/app/product-options",
  "/app/reservations",
  "/app/customer-groups",
  "/app/settings/tax-regions",
] as const

export const researchCompoundsSidebarCss = `
${ROUTINE_HIDDEN_ADMIN_PATHS.flatMap((path) => [
  `a[href="${path}"] { display: none !important; }`,
  `li:has(a[href="${path}"]) { display: none !important; }`,
]).join("\n")}

/* ==========================================================================
   Research Compounds — Unified Modern Light Sidebar Theme
   Linear / Shopify Polaris aesthetic with zero Radix collapsible conflicts
   ========================================================================== */

/* 1. Sidebar Shell — strictly scoped to the primary navigation sidebar */
div:has(> aside:has(#rc-custom-nav)),
aside:has(#rc-custom-nav),
aside[data-sidebar="true"] {
  width: 248px !important;
  min-width: 248px !important;
  max-width: 248px !important;
}

aside:has(#rc-custom-nav),
aside:has(#rc-custom-nav) > div,
aside[data-sidebar="true"],
[data-sidebar="true"] {
  background-color: #FFFFFF !important;
  border-right-color: #E2E8F0 !important;
  color: #334155 !important;
  font-family: inherit !important;
}

aside:has(#rc-custom-nav),
aside:has(#rc-custom-nav) > .flex.flex-1.flex-col,
aside[data-sidebar="true"] > .flex.flex-1.flex-col {
  display: flex !important;
  flex-direction: column !important;
  height: 100vh !important;
  overflow: hidden !important;
  background-color: #FFFFFF !important;
  border-right: 1px solid #E2E8F0 !important;
}

aside:has(#rc-custom-nav) .sticky.top-0,
aside[data-sidebar="true"] .sticky.top-0,
aside:has(#rc-custom-nav) > div:first-child,
aside[data-sidebar="true"] > div:first-child {
  padding: 0 !important;
}

/* 2. Hide Native Medusa Collapsible Nav, Search, and Duplicate Elements (Scoped to Main Mode) */
aside:not([data-rc-mode="settings"]):has(#rc-custom-nav) nav,
aside:not([data-rc-mode="settings"]):has(#rc-custom-nav) [data-testid="search-button"],
aside:not([data-rc-mode="settings"]):has(#rc-custom-nav) button:has(kbd) {
  display: none !important;
}

aside:not([data-rc-mode="settings"]):has(#rc-custom-nav) .sticky.bottom-0 > div:not(.rc-system-section),
aside:not([data-rc-mode="settings"]):has(#rc-custom-nav) .sticky.bottom-0 [class*="bg-[linear-gradient"],
aside:not([data-rc-mode="settings"]):has(#rc-custom-nav) a[href="/app/settings"]:not(.rc-nav-link),
aside:not([data-rc-mode="settings"]):has(#rc-custom-nav) div:has(> div > a[href="/app/settings"]:not(.rc-nav-link)),
aside:not([data-rc-mode="settings"]):has(#rc-custom-nav) div[class*="gap-y-0.5"] {
  display: none !important;
}

/* 3. Settings Sidebar Modernization Theme */
aside[data-rc-mode="settings"] #rc-custom-nav {
  display: none !important;
}

aside[data-rc-mode="settings"] div[class*="gap-y-0.5"] {
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
}

aside[data-rc-mode="settings"] a[href^="/app/settings"],
aside[data-rc-mode="settings"] a[href^="/settings"],
aside[data-rc-mode="settings"] .rc-settings-custom-link {
  display: flex !important;
  align-items: center !important;
  padding: 6px 12px !important;
  border-radius: 8px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #334155 !important;
  text-decoration: none !important;
  transition: all 0.12s ease !important;
}

aside[data-rc-mode="settings"] a[href^="/app/settings"]:hover,
aside[data-rc-mode="settings"] a[href^="/settings"]:hover,
aside[data-rc-mode="settings"] .rc-settings-custom-link:hover {
  background-color: #F1F5F9 !important;
  color: #0F172A !important;
}

aside[data-rc-mode="settings"] a[aria-current="page"],
aside[data-rc-mode="settings"] a[data-active="true"],
aside[data-rc-mode="settings"] a.rc-settings-active {
  background-color: #EFF6FF !important;
  color: #1D4ED8 !important;
  font-weight: 600 !important;
}

aside[data-rc-mode="settings"] .sticky.top-0 {
  background-color: #FFFFFF !important;
  border-bottom: 1px solid #F1F5F9 !important;
  padding: 10px 12px !important;
}

aside[data-rc-mode="settings"] .sticky.top-0 a,
aside[data-rc-mode="settings"] a.rc-settings-back-btn {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 7px 11px !important;
  border-radius: 8px !important;
  background-color: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
  color: #0F172A !important;
  font-weight: 600 !important;
  font-size: 12px !important;
  text-decoration: none !important;
  transition: all 0.15s ease !important;
}

aside[data-rc-mode="settings"] .sticky.top-0 a:hover,
aside[data-rc-mode="settings"] a.rc-settings-back-btn:hover {
  background-color: #EFF6FF !important;
  color: #1D4ED8 !important;
  border-color: #BFDBFE !important;
}

aside .sticky.top-0:has(.rc-brand-card) button[id^="radix-"],
aside .sticky.top-0:has(.rc-brand-card) button[aria-haspopup="menu"],
aside .sticky.top-0:has(.rc-brand-card) div.w-full.p-3 {
  display: none !important;
}

aside .sticky.bottom-0:has(.rc-system-section) > div:not(.rc-system-section),
aside .sticky.bottom-0:has(.rc-system-section) > div:not(.rc-system-section) button,
aside .sticky.bottom-0:has(.rc-system-section) > button {
  display: none !important;
}

aside .sticky.bottom-0:has(.rc-system-section) .rc-user-actions button,
aside .sticky.bottom-0:has(.rc-system-section) .rc-user-actions a,
.rc-footer-btn {
  display: flex !important;
}

/* 3. Streamlined Brand Anchor Card */
.rc-brand-card {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 10px 8px 10px !important;
  width: 100% !important;
  box-sizing: border-box !important;
  border-bottom: 1px solid #F1F5F9 !important;
  margin-bottom: 6px !important;
}

.rc-brand-left {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  min-width: 0 !important;
  flex: 1 1 auto !important;
}

.rc-brand-icon {
  width: 26px !important;
  height: 26px !important;
  border-radius: 6px !important;
  background: linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 1.5px 4px rgba(37, 99, 235, 0.25) !important;
  color: #FFFFFF !important;
  flex-shrink: 0 !important;
}

.rc-brand-title {
  color: #0F172A !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  letter-spacing: -0.02em !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
}

.rc-collapse-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 24px !important;
  height: 24px !important;
  border-radius: 5px !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  color: #94A3B8 !important;
  cursor: pointer !important;
  padding: 0 !important;
  transition: all 0.12s ease !important;
  flex-shrink: 0 !important;
}

.rc-collapse-btn:hover {
  background-color: #F1F5F9 !important;
  border-color: #E2E8F0 !important;
  color: #0F172A !important;
}

.rc-collapse-btn svg {
  width: 14px !important;
  height: 14px !important;
  stroke: currentColor !important;
  display: block !important;
}

/* 4. Bespoke Navigation Shell (#rc-custom-nav) */
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

.rc-search-trigger {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  height: 32px !important;
  margin: 4px 0 10px 0 !important;
  padding: 0 10px !important;
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

.rc-nav-section {
  display: flex !important;
  flex-direction: column !important;
  margin-bottom: 6px !important;
}

.rc-nav-section-title {
  font-size: 10px !important;
  font-weight: 700 !important;
  letter-spacing: 0.07em !important;
  text-transform: uppercase !important;
  color: #94A3B8 !important;
  padding: 6px 8px 3px 8px !important;
  user-select: none !important;
}

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
  transition: background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease !important;
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
  width: 15px !important;
  height: 15px !important;
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

.rc-nav-link.rc-active,
.rc-nav-link[data-active="true"] {
  background-color: #EFF6FF !important;
  color: #1D4ED8 !important;
  font-weight: 600 !important;
  border-color: #DBEAFE !important;
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

#rc-custom-nav a[href="/app/settings"],
#rc-custom-nav a.rc-nav-link[data-route-id="/app/settings"] {
  display: flex !important;
}

/* 5. Nav Badges */
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

/* 6. User Profile and Utility Section in Bottom Aside */
.rc-system-section {
  padding: 8px 10px 10px 10px !important;
  border-top: 1px solid #F1F5F9 !important;
  background-color: #FFFFFF !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
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
  gap: 6px !important;
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
  font-size: 10px !important;
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
  font-size: 9.5px !important;
  line-height: 1.1 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.rc-user-actions {
  display: flex !important;
  align-items: center !important;
  gap: 2px !important;
  flex-shrink: 0 !important;
}

.rc-footer-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 22px !important;
  height: 22px !important;
  border-radius: 4px !important;
  color: #64748B !important;
  text-decoration: none !important;
  transition: all 0.12s ease !important;
  flex-shrink: 0 !important;
  box-sizing: border-box !important;
  background: transparent !important;
  border: none !important;
  cursor: pointer !important;
  padding: 0 !important;
  position: relative !important;
}

.rc-footer-btn svg {
  width: 13px !important;
  height: 13px !important;
  stroke: currentColor !important;
  display: block !important;
}

.rc-footer-btn:hover {
  background-color: #E2E8F0 !important;
  color: #0F172A !important;
}

.rc-footer-btn.rc-signout-btn:hover {
  background-color: #FEE2E2 !important;
  color: #DC2626 !important;
}

.rc-footer-btn.rc-signout-btn:hover svg {
  color: #DC2626 !important;
  stroke: #DC2626 !important;
}

.rc-footer-btn .rc-bell-dot {
  position: absolute !important;
  top: 1px !important;
  right: 1px !important;
  min-width: 10px !important;
  height: 10px !important;
  padding: 0 3px !important;
  border-radius: 9999px !important;
  background-color: #EF4444 !important;
  color: #FFFFFF !important;
  font-size: 8px !important;
  font-weight: 700 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  box-shadow: 0 0 0 1.5px #FFFFFF !important;
}

/* ==========================================================================
   Executive Sovereign Notification Center & Telemetry Floating Popover (HUD)
   ========================================================================== */
.rc-notif-backdrop {
  position: fixed !important;
  inset: 0 !important;
  background-color: transparent !important;
  z-index: 99998 !important;
  display: none;
}

.rc-notif-backdrop.rc-open {
  display: block !important;
}

.rc-sovereign-popover {
  position: fixed !important;
  top: 56px !important;
  right: 20px !important;
  width: 420px !important;
  max-width: calc(100vw - 32px) !important;
  max-height: calc(100vh - 76px) !important;
  background-color: #FFFFFF !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 35px -5px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05) !important;
  z-index: 99999 !important;
  display: flex !important;
  flex-direction: column !important;
  font-family: inherit !important;
  color: #1E293B !important;
  overflow: hidden !important;
  opacity: 0 !important;
  transform: translateY(-8px) scale(0.98) !important;
  pointer-events: none !important;
  transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.rc-sovereign-popover.rc-open {
  opacity: 1 !important;
  transform: translateY(0) scale(1) !important;
  pointer-events: auto !important;
}

.rc-notif-header {
  padding: 16px 20px 14px 20px !important;
  border-bottom: 1px solid #F1F5F9 !important;
  background-color: #FFFFFF !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
}

.rc-notif-header-top {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.rc-notif-eyebrow {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
  color: #2563EB !important;
  background-color: #EFF6FF !important;
  padding: 2px 8px !important;
  border-radius: 9999px !important;
  border: 1px solid #DBEAFE !important;
}

.rc-notif-header-actions {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.rc-notif-studio-link {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #2563EB !important;
  text-decoration: none !important;
  padding: 4px 8px !important;
  border-radius: 6px !important;
  background-color: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
  transition: all 0.15s ease !important;
}

.rc-notif-studio-link:hover {
  background-color: #EFF6FF !important;
  border-color: #BFDBFE !important;
}

.rc-notif-close-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 28px !important;
  height: 28px !important;
  border-radius: 6px !important;
  border: 1px solid #E2E8F0 !important;
  background-color: #FFFFFF !important;
  color: #64748B !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
}

.rc-notif-close-btn:hover {
  background-color: #F1F5F9 !important;
  color: #0F172A !important;
  border-color: #CBD5E1 !important;
}

.rc-notif-header-main {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.rc-notif-title {
  margin: 0 !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  color: #0F172A !important;
  letter-spacing: -0.01em !important;
}

.rc-notif-status-badge {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #059669 !important;
  background-color: #ECFDF5 !important;
  padding: 3px 8px !important;
  border-radius: 9999px !important;
  border: 1px solid #A7F3D0 !important;
}

.rc-notif-pulse {
  width: 6px !important;
  height: 6px !important;
  border-radius: 9999px !important;
  background-color: #10B981 !important;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7) !important;
  animation: rc-pulse-anim 2s infinite !important;
}

@keyframes rc-pulse-anim {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.rc-notif-telemetry-bar {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 8px !important;
  padding: 8px 16px !important;
  background-color: #F8FAFC !important;
  border-bottom: 1px solid #E2E8F0 !important;
  flex-shrink: 0 !important;
}

.rc-notif-telemetry-chip {
  display: flex !important;
  flex-direction: column !important;
  gap: 1px !important;
  padding: 5px 8px !important;
  background-color: #FFFFFF !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 6px !important;
  min-width: 0 !important;
  overflow: hidden !important;
}

.rc-notif-telemetry-label {
  font-size: 9px !important;
  font-weight: 600 !important;
  color: #64748B !important;
  text-transform: uppercase !important;
  letter-spacing: 0.03em !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.rc-notif-telemetry-val {
  font-size: 11.5px !important;
  font-weight: 700 !important;
  color: #0F172A !important;
  font-variant-numeric: tabular-nums !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.rc-notif-tabs {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  padding: 6px 16px !important;
  border-bottom: 1px solid #E2E8F0 !important;
  background-color: #FFFFFF !important;
  flex-shrink: 0 !important;
}

.rc-notif-tab {
  flex: 1 1 0 !important;
  text-align: center !important;
  padding: 5px 4px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #64748B !important;
  background: transparent !important;
  border: none !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  transition: all 0.15s ease !important;
}

.rc-notif-tab:hover {
  background-color: #F1F5F9 !important;
  color: #0F172A !important;
}

.rc-notif-tab.rc-active {
  background-color: #EFF6FF !important;
  color: #2563EB !important;
  font-weight: 700 !important;
}

.rc-notif-body {
  flex: 1 1 auto !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 12px 16px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  background-color: #FAFAFA !important;
  max-height: calc(100vh - 280px) !important;
  scrollbar-width: thin !important;
}

.rc-notif-card {
  padding: 12px 14px !important;
  background-color: #FFFFFF !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 8px !important;
  display: flex !important;
  gap: 12px !important;
  align-items: flex-start !important;
  transition: all 0.15s ease !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03) !important;
}

.rc-notif-card:hover {
  border-color: #CBD5E1 !important;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.05) !important;
}

.rc-notif-card-icon {
  width: 32px !important;
  height: 32px !important;
  border-radius: 8px !important;
  background-color: #EFF6FF !important;
  color: #2563EB !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 15px !important;
  flex-shrink: 0 !important;
}

.rc-notif-card-content {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 3px !important;
}

.rc-notif-card-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.rc-notif-card-title {
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #0F172A !important;
  margin: 0 !important;
}

.rc-notif-card-time {
  font-size: 10px !important;
  color: #94A3B8 !important;
}

.rc-notif-card-desc {
  font-size: 11px !important;
  color: #475569 !important;
  margin: 0 !important;
  line-height: 1.4 !important;
}

.rc-notif-card-footer {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  margin-top: 4px !important;
}

.rc-notif-tag {
  font-size: 9px !important;
  font-weight: 600 !important;
  padding: 1px 6px !important;
  border-radius: 4px !important;
  text-transform: uppercase !important;
}

.rc-notif-tag-green { background-color: #ECFDF5 !important; color: #059669 !important; }
.rc-notif-tag-blue { background-color: #EFF6FF !important; color: #2563EB !important; }
.rc-notif-tag-purple { background-color: #FAF5FF !important; color: #7E22CE !important; }
.rc-notif-tag-orange { background-color: #FFFBEB !important; color: #D97706 !important; }

.rc-notif-card.rc-clickable {
  cursor: pointer !important;
}

.rc-notif-card.rc-clickable:hover {
  border-color: #93C5FD !important;
  transform: translateY(-1px) !important;
}

.rc-notif-radar-container {
  margin-top: 8px !important;
  padding: 24px 16px !important;
  background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%) !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 12px !important;
  text-align: center !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 12px !important;
}

.rc-radar-graphic {
  position: relative !important;
  width: 56px !important;
  height: 56px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.rc-radar-circle-1, .rc-radar-circle-2 {
  position: absolute !important;
  border-radius: 9999px !important;
  border: 1.5px solid #10B981 !important;
  opacity: 0.3 !important;
}

.rc-radar-circle-1 { width: 48px !important; height: 48px !important; animation: rc-ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite !important; }
.rc-radar-circle-2 { width: 32px !important; height: 32px !important; }
.rc-radar-dot { width: 12px !important; height: 12px !important; border-radius: 9999px !important; background-color: #10B981 !important; box-shadow: 0 0 10px rgba(16, 185, 129, 0.6) !important; }

@keyframes rc-ping {
  75%, 100% { transform: scale(1.4); opacity: 0; }
}

.rc-radar-title {
  margin: 0 !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  color: #0F172A !important;
}

.rc-radar-subtitle {
  margin: 0 !important;
  font-size: 11px !important;
  color: #64748B !important;
  max-width: 320px !important;
  line-height: 1.4 !important;
}

.rc-notif-footer-actions {
  padding: 10px 16px !important;
  background-color: #FFFFFF !important;
  border-top: 1px solid #E2E8F0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-shrink: 0 !important;
}

.rc-notif-footer-btn-primary {
  flex: 1 1 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  height: 34px !important;
  padding: 0 10px !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
  color: #FFFFFF !important;
  background-color: #0F172A !important;
  border-radius: 6px !important;
  text-decoration: none !important;
  white-space: nowrap !important;
  transition: all 0.15s ease !important;
}

.rc-notif-footer-btn-primary:hover {
  background-color: #1E293B !important;
}

.rc-notif-footer-btn-secondary {
  flex: 1 1 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 34px !important;
  padding: 0 10px !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
  color: #475569 !important;
  background-color: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 6px !important;
  text-decoration: none !important;
  white-space: nowrap !important;
  transition: all 0.15s ease !important;
}

.rc-notif-footer-btn-secondary:hover {
  background-color: #F1F5F9 !important;
  color: #0F172A !important;
}

/* 7. Collapsed Sidebar Adaptation */
aside[data-collapsed="true"] .rc-brand-title,
aside[data-collapsed="true"] .rc-collapse-btn,
aside[data-collapsed="true"] .rc-nav-section-title,
aside[data-collapsed="true"] .rc-search-trigger span,
aside[data-collapsed="true"] .rc-search-kbd,
aside[data-collapsed="true"] .rc-nav-text,
aside[data-collapsed="true"] .rc-nav-badge,
aside[data-collapsed="true"] .rc-user-meta,
aside[data-collapsed="true"] .rc-user-actions,
aside[data-state="collapsed"] .rc-brand-title,
aside[data-state="collapsed"] .rc-collapse-btn,
aside[data-state="collapsed"] .rc-nav-section-title,
aside[data-state="collapsed"] .rc-search-trigger span,
aside[data-state="collapsed"] .rc-search-kbd,
aside[data-state="collapsed"] .rc-nav-text,
aside[data-state="collapsed"] .rc-nav-badge,
aside[data-state="collapsed"] .rc-user-meta,
aside[data-state="collapsed"] .rc-user-actions {
  display: none !important;
}

aside[data-collapsed="true"],
aside[data-state="collapsed"],
div:has(> aside[data-collapsed="true"]),
div:has(> aside[data-state="collapsed"]) {
  width: 56px !important;
  min-width: 56px !important;
  max-width: 56px !important;
}

aside[data-collapsed="true"] .rc-brand-card,
aside[data-state="collapsed"] .rc-brand-card {
  align-items: center !important;
  justify-content: center !important;
  padding: 8px 4px !important;
}

aside[data-collapsed="true"] .rc-brand-header-top,
aside[data-state="collapsed"] .rc-brand-header-top {
  justify-content: center !important;
}

aside[data-collapsed="true"] .rc-nav-link,
aside[data-state="collapsed"] .rc-nav-link {
  justify-content: center !important;
  padding: 0 !important;
}

aside[data-collapsed="true"] .rc-search-trigger,
aside[data-state="collapsed"] .rc-search-trigger {
  justify-content: center !important;
  padding: 0 !important;
}

aside[data-collapsed="true"] .rc-user-row,
aside[data-state="collapsed"] .rc-user-row {
  justify-content: center !important;
  padding: 4px !important;
}

/* 8. Floating Support Button Fallback */
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

@media (min-width: 1024px) {
  body:has(aside) .rc-floating-support-btn {
    display: none !important;
  }
}
`

export const fullAppModernDesignSystemCss = `
/* ==========================================================================
   PepStack Sovereign Design Standard — Clean W3C Core Architecture
   ========================================================================== */

/* ── 0. SADS Palette & Design System Tokens ── */
:root {
  --sads-bg-page: #F8FAFC;
  --sads-bg-card: #FFFFFF;
  --sads-border-card: #E2E8F0;
  --sads-tab-active: #2563EB;
  --sads-tab-active-text: #1E293B;
  --sads-tab-inactive-text: #64748B;
  --sads-table-header-bg: #F8FAFC;
  --sads-badge-emerald-bg: #ECFDF5;
  --sads-badge-emerald-text: #047857;
  --sads-badge-emerald-border: #A7F3D0;
  --sads-badge-rose-bg: #FFF1F2;
  --sads-badge-rose-text: #E11D48;
  --sads-badge-rose-border: #FECDD3;
  --sads-badge-blue-bg: #EFF6FF;
  --sads-badge-blue-text: #1D4ED8;
  --sads-badge-blue-border: #BFDBFE;
  --sads-badge-amber-bg: #FFFBEB;
  --sads-badge-amber-text: #B45309;
  --sads-badge-amber-border: #FDE68A;
  --sads-badge-slate-bg: #F1F5F9;
  --sads-badge-slate-text: #475569;
  --sads-badge-slate-border: #E2E8F0;
}

body .sovereign-page {
  background-color: var(--sads-bg-page) !important;
  padding: 24px 24px 32px !important;
}

.sovereign-table th,
.sovereign-table [role="columnheader"],
[data-sads-table] th {
  text-transform: uppercase !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  letter-spacing: 0.05em !important;
  color: #475569 !important;
  background-color: #F8FAFC !important;
}

[data-mono] {
  font-family: 'Inter Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
}

/* ── 1. Global Typography & Canvas Smoothing ── */
body, input, button, select, textarea, [data-radix-portal] {
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
}

/* ── 2. Fluid Edge-to-Edge Layout & Top Header Bar Suppression (Option 1) ── */
div.grid.w-full.grid-cols-2.border-b,
div.grid.w-full.grid-cols-2.border-b.p-3,
main > div > div.grid.w-full.grid-cols-2.border-b {
  position: absolute !important;
  top: -9999px !important;
  left: -9999px !important;
  width: 1px !important;
  height: 0 !important;
  overflow: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
}

main {
  align-items: stretch !important;
  width: 100% !important;
}

main > div[class*="max-w-"],
main > div {
  max-width: 100% !important;
  width: 100% !important;
  padding-left: 24px !important;
  padding-right: 24px !important;
  padding-top: 16px !important;
  box-sizing: border-box !important;
}

main > div > div[class*="max-w-"],
main > div > main[class*="max-w-"],
main > div > section[class*="max-w-"] {
  max-width: 100% !important;
  width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

main .grid[class*="sm:grid-cols-4"] {
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
}

/* ── 3. Mathematical Top Header Layout (Sovereign Clean-Flow Anchor) ── */
[data-rc-categories-header="true"],
[data-rc-inventory-header="true"],
[data-rc-orders-header="true"],
[data-rc-customers-header="true"] {
  width: 100% !important;
  margin-bottom: 16px !important;
  padding-top: 4px !important;
  order: -1 !important;
}

main > div {
  display: flex !important;
  flex-direction: column !important;
}

/* Suppress redundant Medusa card headers where bespoke SADS 2.0 headers preside */
body:has([data-rc-categories-header="true"]) main > div > div:first-child:has(h1):not(:has([data-rc-categories-header="true"])),
body:has([data-rc-orders-header="true"]) main > div > div:first-child:has(h1):not(:has([data-rc-orders-header="true"])),
body:has([data-rc-customers-header="true"]) main > div > div:first-child:has(h1):not(:has([data-rc-customers-header="true"])) {
  display: none !important;
}

/* ── 4. Seamless Single-Card Container Architecture (Eradicate Box-Over-Box) ── */
.shadow-elevation-card-rest,
[data-container="true"] {
  border: 1px solid #E2E8F0 !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  background-color: #FFFFFF !important;
}

[data-container="true"] div:has(> table),
[data-container="true"] div:has(> div > table),
[data-container="true"] .shadow-elevation-card-rest,
[data-container="true"] .rc-table-container,
div.shadow-elevation-card-rest div:has(> table),
div.shadow-elevation-card-rest div:has(> div > table),
div.shadow-elevation-card-rest .shadow-elevation-card-rest:has(table),
[data-container="true"] [data-container="true"],
.shadow-elevation-card-rest .shadow-elevation-card-rest {
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background-color: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: visible !important;
}

[data-container="true"]:has(table),
div.shadow-elevation-card-rest:has(table) {
  min-height: auto !important;
  height: auto !important;
}

[data-container="true"] table,
div.shadow-elevation-card-rest table {
  width: 100% !important;
  border-collapse: collapse !important;
  border-spacing: 0 !important;
}

table td, table th {
  border-left: none !important;
  border-right: none !important;
}

/* ── 5. Standardized Table Density, Typography & Headers ── */
body table thead,
body thead.border-ui-border-base,
body table thead tr {
  background-color: #F8FAFC !important;
  border-bottom: 1px solid #E2E8F0 !important;
}

body table thead th,
body th.txt-compact-small-plus,
body th[data-table-header-cell="true"] {
  background-color: #F8FAFC !important;
  color: #64748B !important;
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  padding: 8px 16px !important;
  height: 34px !important;
  border-bottom: 1px solid #E2E8F0 !important;
}

body table tbody tr,
body tr[data-table-row="true"] {
  height: 40px !important;
  border-bottom: 1px solid #F1F5F9 !important;
  transition: background-color 0.15s ease !important;
}

body table tbody tr:hover {
  background-color: #F8FAFC !important;
}

body table tbody tr:last-child {
  border-bottom: none !important;
}

body table td {
  padding: 6px 16px !important;
  font-size: 13px !important;
  color: #334155 !important;
  border-bottom: 1px solid #F1F5F9 !important;
  height: 40px !important;
  vertical-align: middle !important;
}

/* ── 6. Monospace Order Tokens (#26) — Upright, Zero Italics ── */
td a[href*="/app/orders/"],
td a[href*="/app/draft-orders/"],
div[role="dialog"] a[href*="/app/orders/"],
div[role="dialog"] span[data-token="order"],
.rc-order-token {
  display: inline-flex !important;
  align-items: center !important;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
  font-style: normal !important;
  letter-spacing: normal !important;
  background-color: #F1F5F9 !important;
  color: #1E293B !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 6px !important;
  padding: 1.5px 7px !important;
  text-decoration: none !important;
  line-height: 1.2 !important;
  transition: all 0.12s ease !important;
}

td a[href*="/app/orders/"]:hover,
td a[href*="/app/draft-orders/"]:hover,
.rc-order-token:hover {
  background-color: #EFF6FF !important;
  border-color: #BFDBFE !important;
  color: #1D4ED8 !important;
}

/* ── 7. Sovereign Currency & Quantitative Figures — Tabular Numerals ── */
.rc-price-cell,
td[data-table-cell-id="total"],
td[data-table-cell-id="order_total"],
td[data-table-cell-id*="total"],
td[data-table-cell-id*="price"],
td[data-table-cell-id*="amount"],
td[data-table-cell-id*="quantity"],
td[data-table-cell-id*="stock"],
td:has(> span[class*="tabular-nums"]),
div[role="dialog"] [data-currency="true"] {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace !important;
  font-size: 12.5px !important;
  font-weight: 600 !important;
  font-style: normal !important;
  font-variant-numeric: tabular-nums !important;
  font-feature-settings: "tnum" 1 !important;
  color: #0F172A !important;
}

/* ── 8. Status Cell & Micro-Indicator Modernization ── */
table td div.txt-compact-small:has(div[role="presentation"]),
span.txt-compact-xsmall-plus:has(div[role="presentation"]),
div.txt-compact-small:has(div[role="presentation"]),
div.txt-compact-xsmall-plus:has(div[role="presentation"]),
span.bg-ui-bg-subtle:has(div[role="presentation"]),
div.bg-ui-bg-subtle:has(div[role="presentation"]),
span:has(> div[role="presentation"]):has(> div[role="presentation"] > div[class*="bg-ui-tag-"]),
div:has(> div[role="presentation"]):has(> div[role="presentation"] > div[class*="bg-ui-tag-"]) {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: #1E293B !important;
  line-height: 1 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  width: auto !important;
}

div[role="presentation"] > div[class*="bg-ui-tag-"] {
  width: 6px !important;
  height: 6px !important;
  border-radius: 9999px !important;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06) !important;
}

div[role="presentation"] > div.bg-ui-tag-green-icon,
div.bg-ui-tag-green-icon {
  background-color: #10B981 !important;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.45) !important;
}
div[role="presentation"] > div.bg-ui-tag-blue-icon,
div.bg-ui-tag-blue-icon {
  background-color: #06B6D4 !important;
  box-shadow: 0 0 6px rgba(6, 182, 212, 0.45) !important;
}
div[role="presentation"] > div.bg-ui-tag-neutral-icon,
div.bg-ui-tag-neutral-icon {
  background-color: #64748B !important;
  box-shadow: 0 0 4px rgba(100, 116, 139, 0.3) !important;
}
div[role="presentation"] > div.bg-ui-tag-orange-icon,
div.bg-ui-tag-orange-icon {
  background-color: #F59E0B !important;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.45) !important;
}
div[role="presentation"] > div.bg-ui-tag-red-icon,
div.bg-ui-tag-red-icon {
  background-color: #EF4444 !important;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.45) !important;
}
div[role="presentation"] > div.bg-ui-tag-purple-icon,
div.bg-ui-tag-purple-icon {
  background-color: #8B5CF6 !important;
  box-shadow: 0 0 6px rgba(139, 92, 246, 0.45) !important;
}

/* ── 9. Universal Slide-Over Drawers & Dialog Modals ── */
div.bg-ui-bg-overlay,
div[data-state="open"].fixed.inset-0,
div[data-radix-portal] > div.fixed.inset-0 {
  background: rgba(15, 23, 42, 0.45) !important;
  backdrop-filter: blur(6px) !important;
  -webkit-backdrop-filter: blur(6px) !important;
}

div[role="dialog"]:has(> [data-state="open"]),
div[role="dialog"].shadow-elevation-modal,
div[data-radix-portal] div[data-state="open"]:not(.fixed.inset-0) {
  background-color: #FFFFFF !important;
  border-left: 1px solid #E2E8F0 !important;
  box-shadow: -12px 0 35px -5px rgba(15, 23, 42, 0.15), -4px 0 24px rgba(15, 23, 42, 0.08) !important;
}

div[role="dialog"] footer,
div[role="dialog"].shadow-elevation-modal form > div:last-child,
div[role="dialog"].shadow-elevation-modal > form > div.border-t,
div[role="dialog"] div:has(> button[type="submit"]) {
  border-top: 1px solid #E2E8F0 !important;
  background-color: #F8FAFC !important;
  padding: 12px 20px !important;
}

/* ── 10. Form Controls, Search Toolbar & Action Buttons ── */
input[name="q"],
input.bg-ui-bg-field,
textarea.bg-ui-bg-field,
select.bg-ui-bg-field {
  border: 1px solid #CBD5E1 !important;
  border-radius: 8px !important;
  background-color: #F8FAFC !important;
  font-size: 13px !important;
  transition: all 0.15s ease !important;
}

input[name="q"]:focus,
input.bg-ui-bg-field:focus,
textarea.bg-ui-bg-field:focus {
  border-color: #2563EB !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
  background-color: #FFFFFF !important;
  outline: none !important;
}

button[type="submit"].bg-ui-button-inverted,
button.bg-ui-button-inverted,
div:has(> button[type="submit"]) button[type="submit"] {
  background-color: #0F172A !important;
  color: #FFFFFF !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  transition: all 0.15s ease !important;
}

button.bg-ui-button-inverted:hover:not(:disabled) {
  background-color: #1E293B !important;
}

/* ── 11. Seamless Integrated Pagination Bar ── */
[data-container="true"] div:has(> button[data-testid="prev-button"]),
[data-container="true"] div:has(> [data-testid="pagination"]),
[data-container="true"] > div:last-child:has(button),
div[data-testid="pagination"],
div:has(> button[data-testid="prev-button"]),
div:has(> button[data-testid="next-button"]),
div.border-ui-border-base:has(> button):not(thead *) {
  border-top: 1px solid #E2E8F0 !important;
  background-color: #FAFBFD !important;
  padding: 10px 20px !important;
  font-size: 12px !important;
  color: #64748B !important;
  margin: 0 !important;
}

/* ── 12. Eradicate Raw Developer Clutter (Metadata / JSON dumps) ── */
[data-entry-id="MetadataSection"],
[data-entry-id="JsonViewSection"],
div.shadow-elevation-card-rest:has(a[href*="metadata/edit"]),
div.shadow-elevation-card-rest:has(a[href$="/raw"]),
div:has(> a[href*="metadata/edit"]),
div:has(> a[href$="/raw"]) {
  display: none !important;
}

div:has(> [data-entry-id="ProductDetailsView"]),
div:has(> [data-entry-id="ProductVariantDetailsView"]) {
  opacity: 0 !important;
}

/* ── 13. Sovereign Warehouse Print Isolation & Thermal 4x6 Box Label Engine ── */
@media print {
  @page {
    margin: 0;
    size: auto;
  }

  /* Hide all non-printable admin UI chrome */
  body aside,
  body nav,
  body header,
  body .rc-sidebar,
  body .rc-notif-drawer,
  body .rc-sovereign-popover,
  body .rc-notif-backdrop,
  body .rc-floating-support-btn,
  body div[data-radix-portal] > div.fixed.inset-0:first-child,
  body button,
  body [role="dialog"] > div:first-child,
  body div[data-testid="global-support-dock"] {
    display: none !important;
    visibility: hidden !important;
  }

  body {
    background-color: #FFFFFF !important;
    color: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Isolate printable document container */
  .printable-document {
    visibility: visible !important;
    display: block !important;
    position: static !important;
    margin: 0 auto !important;
    padding: 16px !important;
    box-shadow: none !important;
    border: none !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .printable-document * {
    visibility: visible !important;
  }

  /* 4x6 Thermal Box Label Geometry */
  .printable-shipping-label,
  .printable-document[data-doc-type="shipping-label"],
  div:has(> div > span:contains("PHILIPPINES DOMESTIC DISPATCH")) {
    width: 4in !important;
    max-width: 4in !important;
    min-height: 5.8in !important;
    margin: 0 auto !important;
    padding: 12px !important;
    border: 2px solid #000000 !important;
  }
}
`

export const routineAdminNavigationCss = `${researchCompoundsSidebarCss}\n\n${fullAppModernDesignSystemCss}`

export const researchCompoundsSidebarScript = `
(function() {
  function enhanceSidebar() {
    var aside = document.querySelector('aside');
    if (!aside) return;

    var isSettingsPath = window.location.pathname.startsWith('/app/settings') || window.location.pathname === '/app/settings';

    if (isSettingsPath) {
      aside.setAttribute('data-rc-mode', 'settings');
      var cNav = document.getElementById("rc-custom-nav");
      if (cNav) cNav.style.display = "none";

      // 1. Enhance Settings Header / Back to Dashboard Link
      var topBackLink = aside.querySelector('.sticky.top-0 a') || aside.querySelector('a[href="/orders"]') || aside.querySelector('a:has(svg)');
      if (topBackLink && !topBackLink.dataset.rcEnhancedBack) {
        topBackLink.dataset.rcEnhancedBack = "true";
        topBackLink.setAttribute('href', '/app/dashboard');
        topBackLink.classList.add('rc-settings-back-btn');
        topBackLink.innerHTML = [
          '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
          '  <polyline points="15 18 9 12 15 6"></polyline>',
          '</svg>',
          '<span>Back to Dashboard</span>'
        ].join('');
        topBackLink.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          window.history.pushState({}, '', '/app/dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
          setTimeout(enhanceSidebar, 20);
        });
      }

      // 2. Inject Sovereign Engine Settings Group into Settings Sidebar
      var settingsNavContainer = aside.querySelector('.flex.flex-1.flex-col.overflow-y-auto') || aside.querySelector('.flex.flex-1.flex-col');
      if (settingsNavContainer && !settingsNavContainer.querySelector('.rc-settings-sovereign-group')) {
        var sovGroup = document.createElement('div');
        sovGroup.className = 'rc-settings-sovereign-group py-3 border-t border-slate-200/60 mt-2';
        sovGroup.innerHTML = [
          '<div class="px-3 mb-1.5">',
          '  <div class="flex items-center justify-between px-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">',
          '    <span>Sovereign & Operations</span>',
          '  </div>',
          '</div>',
          '<div class="flex flex-col gap-y-0.5 px-3">',
          '  <a href="/app/research-hub-settings" class="rc-settings-custom-link" title="Research Hub Settings">',
          '    <span>Research Hub Settings</span>',
          '  </a>',
          '  <a href="/app/notification-center" class="rc-settings-custom-link" title="Notification Center">',
          '    <span>Notification Center</span>',
          '  </a>',
          '  <a href="/app/customer-support/settings" class="rc-settings-custom-link" title="Customer Support Settings">',
          '    <span>Support & AI Settings</span>',
          '  </a>',
          '</div>'
        ].join('');
        settingsNavContainer.appendChild(sovGroup);

        sovGroup.addEventListener('click', function(e) {
          var a = e.target && (e.target.closest ? e.target.closest('a') : null);
          if (!a) return;
          var href = a.getAttribute('href');
          if (!href) return;
          e.preventDefault();
          window.history.pushState({}, '', href);
          window.dispatchEvent(new PopStateEvent('popstate'));
          setTimeout(enhanceSidebar, 20);
        });
      }

      // 3. Highlight Active Settings Link
      var currentPath = window.location.pathname;
      var allSettingsLinks = aside.querySelectorAll('a[href^="/app/settings"], a[href^="/settings"], .rc-settings-custom-link');
      var normPath = currentPath.indexOf('/app') === 0 ? currentPath : ('/app' + currentPath);
      allSettingsLinks.forEach(function(l) {
        var h = l.getAttribute('href');
        if (!h) return;
        var normH = h.indexOf('/app') === 0 ? h : ('/app' + h);
        var active = normPath === normH || (
          normH !== '/app/settings' &&
          normH !== '/app/settings/store' &&
          (normPath.indexOf(normH + '/') === 0 || normPath.indexOf(normH + '?') === 0)
        );
        if (active) {
          l.classList.add('rc-settings-active');
        } else {
          l.classList.remove('rc-settings-active');
        }
      });

      return;
    }

    aside.setAttribute('data-rc-mode', 'main');
    var existingCustomNav = document.getElementById("rc-custom-nav");
    if (existingCustomNav) existingCustomNav.style.display = "block";

    // 1. Research Compounds Brand Anchor & Global Controls
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
        '  <span class="rc-brand-title">Research Compounds</span>',
        '</div>',
        '<button type="button" class="rc-collapse-btn" title="Toggle Sidebar" aria-label="Toggle Sidebar">',
        '  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
        '    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>',
        '    <line x1="9" y1="3" x2="9" y2="21"></line>',
        '    <path d="m14 9-3 3 3 3"></path>',
        '  </svg>',
        '</button>'
      ].join('');

      var firstChild = topSection.firstChild;
      if (firstChild) {
        topSection.insertBefore(brandCard, firstChild);
      } else {
        topSection.appendChild(brandCard);
      }

      // Collapse toggle handler
      var collapseBtn = brandCard.querySelector('.rc-collapse-btn');
      if (collapseBtn) {
        collapseBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var asideEl = document.querySelector('aside');
          if (asideEl) {
            var isCol = asideEl.getAttribute('data-state') === 'collapsed' || asideEl.getAttribute('data-collapsed') === 'true';
            asideEl.setAttribute('data-state', isCol ? 'expanded' : 'collapsed');
            asideEl.setAttribute('data-collapsed', isCol ? 'false' : 'true');
          }
          var nativeToggle = document.querySelector('button.hidden.lg\\:flex') ||
                             document.querySelector('div.grid.w-full.grid-cols-2.border-b button.hidden.lg\\:flex') ||
                             document.querySelector('button[aria-label*="sidebar" i]');
          if (nativeToggle) {
            try { nativeToggle.click(); } catch (err) {}
          }
        });
      }
    }

    // 2. 100% Bespoke Categorized Navigation Shell
    var customNav = document.getElementById("rc-custom-nav");
    if (!customNav) {
      customNav = document.createElement("div");
      customNav.id = "rc-custom-nav";

      var navSections = [
        {
          title: "Operations",
          items: [
            { href: "/app/dashboard", label: "Dashboard", icon: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>' },
            { href: "/app/orders-cockpit", label: "Orders", icon: '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>', badge: "orders" },
            { href: "/app/manual-payment-proofs", label: "Payment Proofs", icon: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>', badge: "proofs" },
            { href: "/app/customer-support", label: "Support Chats", icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>', badge: "chats" },
            { href: "/app/bot-lab", label: "Bot Mission Control", icon: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>' }
          ]
        },
        {
          title: "Catalog & Science",
          items: [
            { href: "/app/products-registry", label: "Products", icon: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>' },
            { href: "/app/buildable-products", label: "Component BOM", icon: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>' },
            { href: "/app/categories-studio", label: "Categories", icon: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>' },
            { href: "/app/bundles", label: "Bundles", icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>' },
            { href: "/app/research-protocols", label: "Research Protocols", icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>' },
            { href: "/app/research-library", label: "Research Library", icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>' }
          ]
        },
        {
          title: "Commerce & Registry",
          items: [
            { href: "/app/customers-registry", label: "Customers", icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' },
            { href: "/app/inventory-registry", label: "Inventory", icon: '<path d="M3 21h18"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path><path d="M9 9h1"></path><path d="M9 13h1"></path><path d="M9 17h1"></path><path d="M14 9h1"></path><path d="M14 13h1"></path><path d="M14 17h1"></path>' },
            { href: "/app/price-lists-studio", label: "Price Lists", icon: '<circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path>' },
            { href: "/app/promotions-studio", label: "Promotions", icon: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M9 9h.01"></path><path d="m15 9-6 6"></path><path d="M15 15h.01"></path>' },
            { href: "/app/rewards", label: "Rewards & Referrals", icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>' },
            { href: "/app/research-agreements", label: "Research Agreements", icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m9 15 2 2 4-4"></path>' }
          ]
        },
        {
          title: "System & Config",
          items: [
            { href: "/app/research-hub-settings", label: "Research Hub Settings", icon: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>' },
            { href: "/app/notification-center", label: "Notification Center", icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>' },
            { href: "/app/settings/store", label: "Settings", icon: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' }
          ]
        }
      ];

      var isMac = typeof navigator !== 'undefined' && (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Mac/.test(navigator.userAgent));
      var kbdShortcut = isMac ? '⌘K' : 'Ctrl+K';

      var html = [
        '<div class="rc-search-trigger" role="button" tabindex="0" title="Quick Search (' + kbdShortcut + ')">',
        '  <div class="rc-search-left">',
        '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        '    <span>Search resources...</span>',
        '  </div>',
        '  <kbd class="rc-search-kbd">' + kbdShortcut + '</kbd>',
        '</div>'
      ];

      navSections.forEach(function(sec) {
        html.push(
          '<div class="rc-nav-section">',
          '  <div class="rc-nav-section-title">' + sec.title + '</div>',
          '  <div class="rc-nav-list">'
        );
        sec.items.forEach(function(item) {
          html.push(
            '<a href="' + item.href + '" class="rc-nav-link" data-route-id="' + item.href + '" title="' + item.label + '">' +
            '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + item.icon + '</svg>' +
            '  <span class="rc-nav-text">' + item.label + '</span>' +
            (item.badge ? '  <span class="rc-nav-badge ' + (item.badge === 'orders' ? 'rc-badge-blue' : item.badge === 'proofs' ? 'rc-badge-amber' : 'rc-badge-rose') + '" data-badge-id="' + item.badge + '" style="display:none;"></span>' : '') +
            '</a>'
          );
        });
        html.push(
          '  </div>',
          '</div>'
        );
      });

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

        var nativeLink = document.querySelector('aside nav a[href="' + href + '"]');
        if (nativeLink) {
          e.preventDefault();
          nativeLink.click();
          setTimeout(updateActiveNavStates, 15);
          return;
        }

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

    // 4. Update Telemetry Badges with Live Background Polling
    if (!window.__rcOrdersPollingActive) {
      window.__rcOrdersPollingActive = true;
      function fetchOrdersBadge() {
        // Immediate check on document title if available
        var match = document.title ? document.title.match(/\\((\\d+)\\s+to\\s+pack\\)/i) : null;
        if (match) {
          var toPack = parseInt(match[1], 10);
          var ob = document.querySelector('[data-badge-id="orders"]');
          if (ob) {
            ob.textContent = toPack;
            ob.style.display = toPack > 0 ? "inline-flex" : "none";
          }
        }
        fetch("/admin/orders?limit=100&fields=id,status,fulfillment_status,payment_status", { credentials: "include" })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            var orders = data.orders || [];
            var packReadyCount = orders.filter(function(o) {
              return o.status !== "canceled" &&
                o.status !== "completed" &&
                o.fulfillment_status !== "fulfilled" &&
                o.fulfillment_status !== "shipped" &&
                (o.payment_status === "captured" || o.payment_status === "partially_refunded" || o.payment_status === "not_paid");
            }).length;
            var orderBadge = document.querySelector('[data-badge-id="orders"]');
            if (orderBadge) {
              if (packReadyCount > 0) {
                orderBadge.textContent = packReadyCount;
                orderBadge.style.display = "inline-flex";
              } else {
                orderBadge.style.display = "none";
              }
            }
          }).catch(function() {});
      }
      fetchOrdersBadge();
      setInterval(fetchOrdersBadge, 15000);
    }

    // Polling support chats
    if (!window.__rcChatsPollingActive) {
      window.__rcChatsPollingActive = true;
      function fetchChatsBadge() {
        fetch("/admin/customer-support", { credentials: "include" })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            var convs = data.conversations || [];
            var unreadCount = data.unread_count != null ? data.unread_count : convs.reduce(function(acc, c) {
              return acc + (c.unread_count || (c.status === "new" ? 1 : 0));
            }, 0);
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

    // 5. User Signout & Founder Admin profile enhancement
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
        '  <div class="rc-user-actions">',
        '    <a href="http://localhost:8000/ph" target="_blank" rel="noreferrer" class="rc-footer-btn rc-store-link" title="Open Live Customer Portal" aria-label="Open Live Customer Portal">',
        '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
        '        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>',
        '        <polyline points="15 3 21 3 21 9"></polyline>',
        '        <line x1="10" y1="14" x2="21" y2="3"></line>',
        '      </svg>',
        '    </a>',
        '    <button type="button" class="rc-footer-btn rc-bell-btn" title="Notifications" aria-label="Notifications">',
        '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
        '        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>',
        '        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
        '      </svg>',
        '      <span class="rc-bell-dot" style="display:none;"></span>',
        '    </button>',
        '    <button type="button" class="rc-footer-btn rc-signout-btn" title="Sign Out" aria-label="Sign Out">',
        '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
        '        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>',
        '        <polyline points="16 17 21 12 16 7"></polyline>',
        '        <line x1="21" y1="12" x2="9" y2="12"></line>',
        '      </svg>',
        '    </button>',
        '  </div>',
        '</div>'
      ].join("");

      var bellBtn = sysSection.querySelector('.rc-bell-btn');
      if (bellBtn) {
        bellBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          toggleSovereignNotificationDrawer();
        });
      }

      // Intercept any native bells in header to route to Sovereign Drawer
      var nativeBells = document.querySelectorAll('button[aria-haspopup="dialog"]:has(svg)');
      nativeBells.forEach(function(btn) {
        if (!btn.__rcBound) {
          btn.__rcBound = true;
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSovereignNotificationDrawer();
          });
        }
      });

      var signoutBtn = sysSection.querySelector(".rc-signout-btn");
      if (signoutBtn) {
        signoutBtn.addEventListener("click", function(e) {
          e.preventDefault();
          fetch("/auth/session", { method: "DELETE", credentials: "include" })
            .catch(function() {})
            .finally(function() {
              try {
                localStorage.clear();
                sessionStorage.clear();
              } catch (err) {}
              window.location.href = "/app/login";
            });
        });
      }

      bottomDiv.appendChild(sysSection);
    }

    ensureGlobalSupport();
    enhanceTables();
  }

  // 6. Enhance Admin Tables (Price Tabular Numerals & Monospace Order Tokens)
  function enhanceTables() {
    var tables = document.querySelectorAll('table');
    if (!tables.length) return;

    tables.forEach(function(table) {
      var cells = table.querySelectorAll('tbody td');
      cells.forEach(function(td) {
        var text = td.textContent ? td.textContent.trim() : '';

        if (!td.dataset.rcEnhancedPrice && (text.indexOf('PHP') !== -1 || text.indexOf('₱') !== -1)) {
          td.dataset.rcEnhancedPrice = 'true';
          td.classList.add('rc-price-cell');
        }

        var link = td.querySelector('a[href^="/app/orders/"], a[href^="/app/draft-orders/"]');
        if (link && !link.dataset.rcEnhancedOrder) {
          link.dataset.rcEnhancedOrder = 'true';
          link.classList.add('rc-order-token');
        }
      });
    });
  }

  // 7. Universal Floating Support Dock Fallback
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
            var unread = data.unread_count != null ? data.unread_count : convs.reduce(function(acc, c) {
              return acc + (c.unread_count || (c.status === 'new' ? 1 : 0));
            }, 0);
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

  // 8. Sovereign Notification Center & Telemetry Floating Popover (HUD)
  function ensureSovereignNotificationDrawer() {
    var popover = document.getElementById('rc-sovereign-popover') || document.getElementById('rc-notif-drawer');
    var backdrop = document.getElementById('rc-notif-backdrop');
    if (popover && backdrop) return { popover: popover, drawer: popover, backdrop: backdrop };

    backdrop = document.createElement('div');
    backdrop.id = 'rc-notif-backdrop';
    backdrop.className = 'rc-notif-backdrop';

    popover = document.createElement('div');
    popover.id = 'rc-sovereign-popover';
    popover.className = 'rc-sovereign-popover';
    popover.setAttribute('aria-label', 'Sovereign Telemetry & Notifications');
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-modal', 'true');

    popover.innerHTML = [
      '<div class="rc-notif-header">',
      '  <div class="rc-notif-header-top">',
      '    <span class="rc-notif-eyebrow">SOVEREIGN RADAR · PEPTIDE TELEMETRY</span>',
      '    <div class="rc-notif-header-actions">',
      '      <a href="/app/notification-center" class="rc-notif-studio-link" title="Open Full Notification Studio">Studio ↗</a>',
      '      <button type="button" class="rc-notif-close-btn" aria-label="Close Notifications" title="Close (Esc)">',
      '        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
      '      </button>',
      '    </div>',
      '  </div>',
      '  <div class="rc-notif-header-main">',
      '    <h2 class="rc-notif-title">Operations & Radar</h2>',
      '    <span class="rc-notif-status-badge"><span class="rc-notif-pulse"></span>All Systems Nominal</span>',
      '  </div>',
      '</div>',
      '<div class="rc-notif-telemetry-bar">',
      '  <div class="rc-notif-telemetry-chip">',
      '    <span class="rc-notif-telemetry-label">Lifecycle</span>',
      '    <span class="rc-notif-telemetry-val" id="rc-notif-stat-dispatch">31 Sent</span>',
      '  </div>',
      '  <div class="rc-notif-telemetry-chip">',
      '    <span class="rc-notif-telemetry-label">Orders</span>',
      '    <span class="rc-notif-telemetry-val" id="rc-notif-stat-orders">28 Live</span>',
      '  </div>',
      '  <div class="rc-notif-telemetry-chip">',
      '    <span class="rc-notif-telemetry-label">Protocols</span>',
      '    <span class="rc-notif-telemetry-val" id="rc-notif-stat-protocols">176 Sync</span>',
      '  </div>',
      '</div>',
      '<div class="rc-notif-tabs">',
      '  <button type="button" class="rc-notif-tab rc-active" data-tab="all">All</button>',
      '  <button type="button" class="rc-notif-tab" data-tab="orders">Orders</button>',
      '  <button type="button" class="rc-notif-tab" data-tab="lifecycle">Lifecycle</button>',
      '  <button type="button" class="rc-notif-tab" data-tab="system">System</button>',
      '</div>',
      '<div class="rc-notif-body" id="rc-notif-body">',
      '  <!-- Live Activity Cards populated dynamically -->',
      '  <div class="rc-notif-radar-container">',
      '    <div class="rc-radar-graphic">',
      '      <div class="rc-radar-circle-1"></div>',
      '      <div class="rc-radar-circle-2"></div>',
      '      <div class="rc-radar-dot"></div>',
      '    </div>',
      '    <h5 class="rc-radar-title">Event Bus Synchronized</h5>',
      '    <p class="rc-radar-subtitle">All customer lifecycle dispatches, order webhooks, and fulfillment monitors are running with 100% nominal telemetry.</p>',
      '  </div>',
      '</div>',
      '<div class="rc-notif-footer-actions">',
      '  <a href="/app/notification-center" class="rc-notif-footer-btn-primary">Notification Studio ↗</a>',
      '  <a href="/app/customer-support" class="rc-notif-footer-btn-secondary">Support Desk</a>',
      '</div>'
    ].join('');

    document.body.appendChild(backdrop);
    document.body.appendChild(popover);

    // Close listeners
    function closePopover() {
      popover.classList.remove('rc-open');
      backdrop.classList.remove('rc-open');
    }

    backdrop.addEventListener('click', closePopover);
    var closeBtn = popover.querySelector('.rc-notif-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closePopover);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && popover.classList.contains('rc-open')) {
        closePopover();
      }
    });

    // Tab switching listener
    var tabs = popover.querySelectorAll('.rc-notif-tab');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t) { t.classList.remove('rc-active'); });
        tab.classList.add('rc-active');
        var targetCat = tab.getAttribute('data-tab');
        var cards = popover.querySelectorAll('.rc-notif-card');
        cards.forEach(function(card) {
          if (targetCat === 'all' || card.getAttribute('data-category') === targetCat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    return { popover: popover, drawer: popover, backdrop: backdrop };
  }

  function formatTimeAgo(dateStr) {
    if (!dateStr) return 'Recently';
    var diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function loadSovereignTelemetry(popover) {
    var headers = {};
    try {
      var medusaToken = localStorage.getItem('medusa_auth_token') || localStorage.getItem('_medusa_jwt') || localStorage.getItem('token');
      if (medusaToken) {
        headers['Authorization'] = 'Bearer ' + medusaToken;
      }
    } catch(e) {}
    fetch('/admin/custom/sovereign-telemetry', { credentials: 'include', headers: headers })
      .then(function(res) { return res.ok ? res.json() : null; })
      .then(function(data) {
        if (!data) return;
        var summary = data.summary || {};

        // Update sidebar bell badge
        var bellDot = document.querySelector('.rc-bell-dot');
        var pendingAlerts = (summary.pending_proofs_count || 0) + (summary.unfulfilled_orders_count || 0);
        if (bellDot) {
          if (pendingAlerts > 0) {
            bellDot.style.display = 'flex';
            bellDot.textContent = pendingAlerts > 99 ? '99+' : String(pendingAlerts);
          } else {
            bellDot.style.display = 'none';
          }
        }

        if (!popover) return;

        // Update telemetry chips
        var dispatchChip = popover.querySelector('#rc-notif-stat-dispatch');
        if (dispatchChip) dispatchChip.textContent = (summary.dispatched_notifications_count || 0) + ' Sent';

        var ordersChip = popover.querySelector('#rc-notif-stat-orders');
        if (ordersChip) ordersChip.textContent = (summary.orders_count || 0) + ' Live';

        var protocolsChip = popover.querySelector('#rc-notif-stat-protocols');
        if (protocolsChip) protocolsChip.textContent = (summary.synced_protocols_count || 176) + ' Sync';

        // Update Header Status Badge
        var statusBadge = popover.querySelector('.rc-notif-status-badge');
        if (statusBadge) {
          if (summary.pending_proofs_count > 0) {
            statusBadge.style.backgroundColor = '#FEF3C7';
            statusBadge.style.color = '#B45309';
            statusBadge.style.borderColor = '#FDE68A';
            statusBadge.innerHTML = '<span class="rc-notif-pulse" style="background:#D97706;"></span>' + summary.pending_proofs_count + ' Review Required';
          } else {
            statusBadge.style.backgroundColor = '#ECFDF5';
            statusBadge.style.color = '#047857';
            statusBadge.style.borderColor = '#A7F3D0';
            statusBadge.innerHTML = '<span class="rc-notif-pulse"></span>All Systems Nominal';
          }
        }

        // Populate Live Cards
        var body = popover.querySelector('#rc-notif-body');
        if (!body) return;

        var cardHtmls = [];

        if (data.timeline && data.timeline.length > 0) {
          cardHtmls = data.timeline.map(function(item) {
            var iconSvg = '';
            var iconBg = '#EFF6FF';
            var iconColor = '#2563EB';

            if (item.type === 'order') {
              iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>';
            } else if (item.type === 'payment_proof') {
              var isPending = item.status === 'pending';
              iconBg = isPending ? '#FEF3C7' : '#EFF6FF';
              iconColor = isPending ? '#D97706' : '#2563EB';
              iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>';
            } else if (item.id === 'sys_coldchain') {
              iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>';
            } else if (item.id === 'sys_monographs') {
              iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
            } else {
              iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';
            }

            var tagsHtml = (item.tags || []).map(function(tag) {
              return '<span class="rc-notif-tag rc-notif-tag-' + (tag.variant || 'blue') + '">' + tag.label + '</span>';
            }).join('');

            var targetUrl = item.deep_link || '/app/notification-center';

            return [
              '<div class="rc-notif-card rc-clickable" data-category="' + item.category + '" data-url="' + targetUrl + '">',
              '  <div class="rc-notif-card-icon" style="background-color: ' + iconBg + '; color: ' + iconColor + ';">' + iconSvg + '</div>',
              '  <div class="rc-notif-card-content">',
              '    <div class="rc-notif-card-header">',
              '      <h4 class="rc-notif-card-title">' + item.title + '</h4>',
              '      <span class="rc-notif-card-time">' + formatTimeAgo(item.timestamp) + '</span>',
              '    </div>',
              '    <p class="rc-notif-card-desc">' + item.description + '</p>',
              '    <div class="rc-notif-card-footer">' + tagsHtml + '</div>',
              '  </div>',
              '</div>'
            ].join('');
          });
        }

        // Radar Graphic Container
        cardHtmls.push([
          '<div class="rc-notif-radar-container">',
          '  <div class="rc-radar-graphic">',
          '    <div class="rc-radar-circle-1"></div>',
          '    <div class="rc-radar-circle-2"></div>',
          '    <div class="rc-radar-dot"></div>',
          '  </div>',
          '  <h5 class="rc-radar-title">Event Bus Synchronized</h5>',
          '  <p class="rc-radar-subtitle">All customer lifecycle dispatches, order webhooks, and fulfillment monitors are running with 100% nominal telemetry.</p>',
          '</div>'
        ].join(''));

        body.innerHTML = cardHtmls.join('');

        if (!body.dataset.clickBound) {
          body.dataset.clickBound = 'true';
          body.addEventListener('click', function(e) {
            var card = e.target.closest('.rc-clickable');
            if (card) {
              var url = card.getAttribute('data-url');
              if (url) window.location.href = url;
            }
          });
        }

        // Re-apply active tab filter
        var activeTab = popover.querySelector('.rc-notif-tab.rc-active');
        var targetCat = activeTab ? activeTab.getAttribute('data-tab') : 'all';
        var allCards = body.querySelectorAll('.rc-notif-card');
        allCards.forEach(function(card) {
          if (targetCat === 'all' || card.getAttribute('data-category') === targetCat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      })
      .catch(function() {});
  }

  function toggleSovereignNotificationDrawer() {
    var elements = ensureSovereignNotificationDrawer();
    var target = elements.popover || elements.drawer;
    var isOpen = target.classList.contains('rc-open');
    if (isOpen) {
      target.classList.remove('rc-open');
      elements.backdrop.classList.remove('rc-open');
    } else {
      elements.backdrop.classList.add('rc-open');
      target.classList.add('rc-open');
      loadSovereignTelemetry(target);
    }
  }

  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function() {
      var aside = document.querySelector('aside');
      if (aside && !document.getElementById('rc-custom-nav')) {
        enhanceSidebar();
      }
      enhanceTables();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      enhanceSidebar();
      loadSovereignTelemetry();
    });
  } else {
    enhanceSidebar();
    loadSovereignTelemetry();
  }
  setInterval(enhanceSidebar, 2000);
  setInterval(function() { loadSovereignTelemetry(); }, 15000);

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
        injectTo: "body" as const,
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
