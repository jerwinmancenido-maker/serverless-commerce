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

/* 1. Clean Light Sidebar Shell matching Body */
aside,
aside > div,
[data-sidebar="true"] {
  background-color: #FFFFFF !important;
  border-right-color: #E2E8F0 !important;
  color: #475569 !important;
}

/* 2. Hide redundant search bar inside sidebar */
aside button:has(kbd),
aside [data-testid="search-button"] {
  display: none !important;
}

/* 3. Research Compounds Brand Card */
button[data-rc-branded="true"] {
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
  gap: 10px !important;
  padding: 8px 10px !important;
  border-radius: 10px !important;
  background-color: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
  width: 100% !important;
  box-sizing: border-box !important;
  margin-bottom: 6px !important;
}

.rc-brand-icon {
  width: 32px !important;
  height: 32px !important;
  border-radius: 8px !important;
  background: linear-gradient(135deg, #059669 0%, #0D9488 100%) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25) !important;
  color: #FFFFFF !important;
  flex-shrink: 0 !important;
}

.rc-brand-text {
  display: flex !important;
  flex-direction: column !important;
  min-width: 0 !important;
  text-align: left !important;
}

.rc-brand-title {
  color: #0F172A !important;
  font-weight: 700 !important;
  font-size: 13px !important;
  letter-spacing: -0.01em !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
}

.rc-brand-sub {
  color: #64748B !important;
  font-size: 10.5px !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
}

/* 4. Section Headers matching Body's Telemetry Label Styling */
.rc-sidebar-section {
  padding: 12px 10px 4px 10px !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  color: #94A3B8 !important;
}

/* 5. Navigation Links */
aside a,
aside nav a,
aside ul a {
  color: #475569 !important;
  border-radius: 8px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  padding: 7px 10px !important;
  transition: all 0.15s ease !important;
}

aside a:hover,
aside nav a:hover,
aside ul a:hover {
  background-color: #F1F5F9 !important;
  color: #0F172A !important;
}

/* 6. Active Item - Soft Emerald Pill matching Body's Verified Ops Badge */
aside a[aria-current="page"],
aside a.bg-ui-bg-base,
aside a[data-active="true"] {
  background-color: #ECFDF5 !important;
  color: #065F46 !important;
  border: 1px solid rgba(16, 185, 129, 0.4) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03) !important;
  font-weight: 600 !important;
}

aside a[aria-current="page"] svg,
aside a.bg-ui-bg-base svg,
aside a[data-active="true"] svg {
  color: #059669 !important;
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
  font-size: 10px !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  box-sizing: border-box !important;
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
  padding: 10px 8px 6px 8px !important;
  border-top: 1px solid #E2E8F0 !important;
  background-color: #FFFFFF !important;
}

.rc-user-row {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 5px 8px !important;
  border-radius: 8px !important;
  background-color: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
  margin-bottom: 6px !important;
}

.rc-user-avatar {
  width: 26px !important;
  height: 26px !important;
  border-radius: 9999px !important;
  background-color: #0D9488 !important;
  color: #FFFFFF !important;
  font-size: 11px !important;
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
  text-align: left !important;
}

.rc-user-name {
  color: #0F172A !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
}

.rc-user-role {
  color: #64748B !important;
  font-size: 10px !important;
  line-height: 1.1 !important;
}

.rc-signout-btn {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  padding: 5px 8px !important;
  border-radius: 6px !important;
  color: #64748B !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  text-decoration: none !important;
  transition: all 0.15s ease !important;
}

.rc-signout-btn:hover {
  background-color: #F1F5F9 !important;
  color: #0F172A !important;
}

/* ==========================================================================
   Research Compounds — Modern High-End SaaS List & Table Views
   Harmonized with Founder Command Center Body Aesthetic
   ========================================================================== */

/* 1. Elevated Table Card Container */
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

/* Emerald Pill (Captured, Fulfilled, Shipped, Published, Registered) */
.rc-status-emerald {
  background-color: #ECFDF5 !important;
  color: #047857 !important;
  border: 1px solid rgba(16, 185, 129, 0.4) !important;
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
  color: #059669 !important;
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
  accent-color: #059669 !important;
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
  border-color: #059669 !important;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
  background-color: #FFFFFF !important;
}

/* 7. Action Buttons (Create, Export) */
button:has-text("Create"),
a[href$="/create"] button {
  background-color: #059669 !important;
  color: #FFFFFF !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  border: none !important;
  box-shadow: 0 1px 2px rgba(5, 150, 105, 0.3) !important;
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
    { section: 'COMMAND', href: '/app/dashboard' },
    { section: 'COMMERCE & ORDERS', href: '/app/orders' },
    { href: '/app/manual-payment-proofs' },
    { href: '/app/customers' },
    { section: 'CLINICAL & BOM', href: '/app/products' },
    { href: '/app/buildable-products' },
    { href: '/app/bundles' },
    { href: '/app/research-protocols' },
    { href: '/app/inventory' },
    { href: '/app/price-lists' },
    { section: 'ENGAGEMENT & SUPPORT', href: '/app/customer-support' },
    { href: '/app/promotions' },
    { href: '/app/notification-center' },
    { href: '/app/rewards' }
  ];

  function enhanceSidebar() {
    var aside = document.querySelector('aside');
    if (!aside) return;

    // 1. Research Compounds Brand Card
    var topSection = aside.querySelector('.sticky.top-0') || aside.firstElementChild;
    var storeTrigger = topSection ? (topSection.querySelector('[data-testid="store-name"]') || topSection.querySelector('.truncate')) : null;
    if (storeTrigger) {
      var parentBtn = storeTrigger.closest('button') || storeTrigger.closest('div');
      if (parentBtn && (!parentBtn.dataset.rcBranded || !parentBtn.querySelector('.rc-brand-card'))) {
        parentBtn.dataset.rcBranded = 'true';
        parentBtn.style.display = 'block';
        parentBtn.style.gridTemplateColumns = 'none';
        parentBtn.style.padding = '0';
        parentBtn.style.width = '100%';
        parentBtn.style.border = 'none';
        parentBtn.style.background = 'transparent';
        parentBtn.style.boxShadow = 'none';

        var brandCard = document.createElement('div');
        brandCard.className = 'rc-brand-card';
        brandCard.innerHTML = [
          '<div class="rc-brand-icon">',
          '  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
          '    <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0"></path>',
          '  </svg>',
          '</div>',
          '<div class="rc-brand-text">',
          '  <span class="rc-brand-title">Research Compounds</span>',
          '  <span class="rc-brand-sub">Founder Operations</span>',
          '</div>'
        ].join('');
        parentBtn.innerHTML = '';
        parentBtn.appendChild(brandCard);
      }
    }

    // 2. Navigation Ordering & Grouped Sections
    var links = Array.from(aside.querySelectorAll('a[href^="/app/"]'));
    if (links.length > 0) {
      var firstLink = links[0];
      var container = firstLink;
      while (container.parentElement && !container.parentElement.classList.contains('gap-y-1')) {
        container = container.parentElement;
      }
      container = container.parentElement;

      if (container) {
        var linkMap = {};
        links.forEach(function(l) {
          var h = l.getAttribute('href');
          var w = l;
          while (w.parentElement && w.parentElement !== container) {
            w = w.parentElement;
          }
          if (h && w) linkMap[h] = w;
        });

        // Clean out existing custom headers before repopulating
        aside.querySelectorAll('.rc-sidebar-section').forEach(function(h) {
          h.remove();
        });

        desiredOrder.forEach(function(item) {
          if (item.section) {
            var sectionHeader = document.createElement('div');
            sectionHeader.className = 'rc-sidebar-section';
            sectionHeader.textContent = item.section;
            container.appendChild(sectionHeader);
          }

          var el = linkMap[item.href];
          if (el && el.parentElement === container) {
            container.appendChild(el);
          }
        });
      }
    }

    // 3. System Section at the bottom of aside
    var bottomDiv = aside.querySelector('.sticky.bottom-0') || aside.lastElementChild;
    if (bottomDiv && !bottomDiv.querySelector('.rc-system-section')) {
      bottomDiv.innerHTML = '';
      var sysSection = document.createElement('div');
      sysSection.className = 'rc-system-section';
      sysSection.innerHTML = [
        '<div class="rc-sidebar-section" style="padding:0 0 6px 0 !important; color:#94A3B8 !important;">SYSTEM</div>',
        '<div class="rc-user-row">',
        '  <div class="rc-user-avatar">JM</div>',
        '  <div class="rc-user-meta">',
        '    <div class="rc-user-name">Jerwin Mancenido</div>',
        '    <div class="rc-user-role">Founder Admin</div>',
        '  </div>',
        '</div>',
        '<a href="/app/logout" class="rc-signout-btn">',
        '  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
        '  <span>Sign Out</span>',
        '</a>'
      ].join('');
      bottomDiv.appendChild(sysSection);
    }

    // 4. Live Telemetry Badges
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
      setInterval(updateChatsBadge, 10000);
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
      setInterval(updateProofsBadge, 10000);
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
            var dot = td.querySelector('.bg-ui-tag-green-icon, .bg-ui-tag-orange-icon, .bg-ui-tag-red-icon');
            if (dot || text === 'Draft' || text === 'Registered' || text === 'Published') {
              td.dataset.rcEnhancedStatus = 'true';
              var wrapper = td.querySelector('.flex.items-center') || td.firstElementChild;
              if (wrapper) {
                if ((dot && dot.classList.contains('bg-ui-tag-green-icon')) || text === 'Captured' || text === 'Shipped' || text === 'Fulfilled' || text === 'Published' || text === 'Registered') {
                  wrapper.className = 'rc-status-pill rc-status-emerald';
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

