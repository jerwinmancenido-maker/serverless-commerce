import { retrieveCustomer } from "@lib/data/customer"
import { retrieveResearchTrackingConfiguration } from "@lib/data/research-tracking"
// TODO: Re-add Toaster component when needed
import AccountLayout from "@modules/account/templates/account-layout"
import LoginTemplate from "@modules/account/templates/login-template"

export default async function AccountPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)
  const researchTrackingAvailable = customer
    ? await retrieveResearchTrackingConfiguration()
        .then((configuration) => configuration.available)
        .catch(() => false)
    : false

  return (
    <AccountLayout
      customer={customer}
      researchTrackingAvailable={researchTrackingAvailable}
    >
      {customer ? children : <LoginTemplate />}
      {/* TODO: Re-add Toaster component when needed */}
    </AccountLayout>
  )
}
