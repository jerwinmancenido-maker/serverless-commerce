import { retrieveResearchAgreementStatus } from "@lib/data/research-agreement"
import CompleteSetup from "@modules/account/components/complete-setup"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function CompleteSetupPage() {
  const status = await retrieveResearchAgreementStatus().catch(() => null)
  if (!status?.active_agreement_bundle) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl-semi">Account setup</h1>
        <p className="mt-3 text-ui-fg-subtle">
          The current account agreement is temporarily unavailable. Your
          orders and existing records have not been changed.
        </p>
      </div>
    )
  }
  if (!status.setup_required) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl-semi">Your account is ready</h1>
        <LocalizedClientLink href="/account/research-hub" className="mt-4 inline-block underline">
          Open Research Hub
        </LocalizedClientLink>
      </div>
    )
  }
  return <CompleteSetup agreement={status.active_agreement_bundle} />
}
