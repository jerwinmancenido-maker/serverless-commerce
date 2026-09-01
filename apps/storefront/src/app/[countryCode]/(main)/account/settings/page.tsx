import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import AddressBook from "@modules/account/components/address-book"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import ProfilePhone from "@modules/account/components/profile-phone"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Profile & Settings",
  description: "Manage personal information, addresses and account settings.",
}

export default async function SettingsPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const [customer, region] = await Promise.all([retrieveCustomer(), getRegion(countryCode)])
  if (!customer || !region) notFound()

  return (
    <div className="w-full space-y-10" data-testid="profile-settings-page">
      <header>
        <h1 className="text-2xl-semi">Profile & Settings</h1>
        <p className="mt-2 text-base-regular text-ui-fg-subtle">Manage your personal information, saved addresses and account choices.</p>
      </header>
      <section>
        <h2 className="mb-5 text-xl-semi">Personal information</h2>
        <div className="space-y-6"><ProfileName customer={customer} /><ProfileEmail customer={customer} /><ProfilePhone customer={customer} /></div>
      </section>
      <section id="addresses">
        <h2 className="text-xl-semi">Addresses</h2>
        <p className="mt-2 text-sm text-ui-fg-subtle">Saved addresses are available during checkout.</p>
        <AddressBook customer={customer} region={region} />
      </section>
      <section className="grid gap-4 medium:grid-cols-2">
        <div className="rounded-xl border border-ui-border-base p-5"><h2 className="font-semibold">Communication preferences</h2><p className="mt-2 text-sm text-ui-fg-subtle">Product news, SMS and routine reminders remain optional.</p><LocalizedClientLink href="/account/settings/reminders" className="mt-3 inline-block text-sm font-medium underline">Manage Research Hub reminders</LocalizedClientLink></div>
        <div className="rounded-xl border border-ui-border-base p-5"><h2 className="font-semibold">Privacy & Data</h2><p className="mt-2 text-sm text-ui-fg-subtle">View agreements and manage private Research Hub records.</p><LocalizedClientLink href="/account/settings/privacy" className="mt-3 inline-block text-sm font-medium underline">Manage privacy and data</LocalizedClientLink></div>
      </section>
    </div>
  )
}
