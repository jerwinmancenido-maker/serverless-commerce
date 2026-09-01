"use client"

import { useActionState } from "react"

import { acceptCurrentResearchAgreementAction } from "@lib/data/research-agreement"
import type { ResearchAgreementBundle } from "@lib/data/research-agreement"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CompleteSetup({
  agreement,
}: {
  agreement: ResearchAgreementBundle
}) {
  const [state, action] = useActionState(
    acceptCurrentResearchAgreementAction,
    null,
  )

  return (
    <section className="max-w-xl" data-testid="complete-account-setup">
      <p className="text-small-regular uppercase tracking-wide text-ui-fg-subtle">
        One-time account update
      </p>
      <h1 className="mt-2 text-2xl-semi">Finish setting up your account</h1>
      <p className="mt-3 text-base-regular text-ui-fg-subtle">
        One agreement covers your account, Research Hub, private Journal,
        measurements, routines and progress. You will not be asked to manage
        these choices again inside each tool unless the agreement materially
        changes.
      </p>
      <form action={action} className="mt-8 rounded-xl border border-ui-border-base p-6">
        <input type="hidden" name="agreement_bundle_id" value={agreement.id} />
        <input
          type="hidden"
          name="idempotency_key"
          value={`account-upgrade-${agreement.id}`}
        />
        <label className="flex items-start gap-3 text-small-regular">
          <input
            type="checkbox"
            name="agreement_accepted"
            required
            className="mt-1"
          />
          <span>
            I agree to the{" "}
            <a className="underline" href={agreement.terms_url}>
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="underline" href={agreement.privacy_url}>
              Privacy Policy
            </a>
            , including private{" "}
            <a className="underline" href={agreement.research_hub_url}>
              Research Hub features
            </a>
            .
          </span>
        </label>
        {state?.error && (
          <p className="mt-4 text-small-regular text-ui-fg-error">{state.error}</p>
        )}
        {state?.success ? (
          <div className="mt-5 rounded-lg bg-ui-bg-subtle p-4 text-small-regular">
            Setup complete. <LocalizedClientLink href="/account/research-hub">Open Research Hub</LocalizedClientLink>
          </div>
        ) : (
          <SubmitButton className="mt-6">Continue</SubmitButton>
        )}
      </form>
    </section>
  )
}
