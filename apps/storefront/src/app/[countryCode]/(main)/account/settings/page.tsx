import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import AddressBook from "@modules/account/components/address-book"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import ProfilePhone from "@modules/account/components/profile-phone"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BellAlert, ShieldCheck } from "@medusajs/icons"

export const metadata: Metadata = {
  title: "Profile & Settings",
  description: "Manage personal information, addresses and account settings.",
}

function ClockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default async function SettingsPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const [customer, region] = await Promise.all([retrieveCustomer(), getRegion(countryCode)])
  if (!customer || !region) notFound()

  return (
    <div className="w-full space-y-12" data-testid="profile-settings-page">
      {/* Section 1: Personal Information */}
      <section id="personal-information" className="scroll-mt-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200/80 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Clinical Identifier &amp; Research Telemetry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Personal Information
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-xl leading-relaxed">
              Manage your verified researcher credentials, primary email, and dispatch notification numbers.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 self-start sm:self-auto">
            <span className="size-1.5 rounded-full bg-slate-400" />
            Encrypted &amp; Confidential
          </span>
        </div>

        <div className="space-y-4">
          <ProfileName customer={customer} />
          <ProfileEmail customer={customer} />
          <ProfilePhone customer={customer} />
        </div>
      </section>

      {/* Section 2: Delivery Addresses */}
      <section id="addresses" className="scroll-mt-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200/80 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Logistics &amp; Delivery Destinations
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Delivery Addresses
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-xl leading-relaxed">
              Saved delivery destinations utilized for 1-click checkout, address verification, and nationwide J&amp;T Express delivery.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200/80 self-start sm:self-auto">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Nationwide J&amp;T Express
          </span>
        </div>

        <AddressBook customer={customer} region={region} />
      </section>

      {/* Section 3: Preference & Data Sovereignty Tiles */}
      <section id="preferences" className="scroll-mt-32">
        <div className="pb-3 mb-5 border-b border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Account Governance &amp; Controls
          </span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Preferences &amp; Data Sovereignty
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Reminders */}
          <LocalizedClientLink
            href="/account/settings/reminders"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-200 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <ClockIcon className="size-5 text-emerald-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  Schedules
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                Research Hub Reminders
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Configure dosing protocol alerts, recurring schedule reminders, and clean-bench quiet hours.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
              <span>Manage Reminders</span>
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
            </div>
          </LocalizedClientLink>

          {/* Card 2: Notifications */}
          <LocalizedClientLink
            href="/account/settings/notifications"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-200 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <BellAlert className="size-5 text-blue-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50/90 border border-blue-200/80 px-2 py-0.5 rounded-full">
                  Channels
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                Notification Preferences
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Choose optional support notices, community forum updates, protocol releases, and rewards updates.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
              <span>Manage Notifications</span>
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
            </div>
          </LocalizedClientLink>

          {/* Card 3: Privacy & Data */}
          <LocalizedClientLink
            href="/account/settings/privacy"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-200 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="size-5 text-slate-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  Confidential
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                Privacy &amp; Data Controls
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Review consolidated legal agreements, export private research telemetry, or manage records retention.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
              <span>Manage Privacy &amp; Data</span>
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
            </div>
          </LocalizedClientLink>
        </div>
      </section>
    </div>
  )
}
