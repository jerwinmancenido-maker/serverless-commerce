"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { signup } from "@lib/data/customer"
import type { ResearchAgreementBundle } from "@lib/data/research-agreement"
import { useSearchParams } from "next/navigation"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  agreement: ResearchAgreementBundle | null
}

const Register = ({ setCurrentView, agreement }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const searchParams = useSearchParams()

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Create your account
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Keep your orders, protocols, routines, progress, Journal and rewards in
        one private account.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="w-full mb-4 text-center text-base-regular text-ui-fg-base bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4"
          data-testid="register-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please check your inbox to verify your email, then sign in.
        </div>
      )}
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
          <Input
            label="Confirm password"
            name="confirm_password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="confirm-password-input"
          />
          <Input
            label="Referral code (optional)"
            name="referral_code"
            defaultValue={searchParams.get("ref") || ""}
            autoComplete="off"
            data-testid="referral-code-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <input
          type="hidden"
          name="agreement_bundle_id"
          value={agreement?.id || ""}
        />
        <input
          type="hidden"
          name="agreement_idempotency_key"
          value={`signup-${agreement?.id || "unavailable"}`}
        />
        <label className="mt-6 flex items-start gap-3 text-small-regular text-ui-fg-base">
          <input
            type="checkbox"
            name="agreement_accepted"
            required
            disabled={!agreement}
            className="mt-1"
          />
          <span>
            I agree to the{" "}
          <a
            href={agreement?.terms_url || "#"}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href={agreement?.privacy_url || "#"}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Privacy Policy
          </a>
          , including the use of private{" "}
          <a
            href={agreement?.research_hub_url || "#"}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Research Hub features
          </a>
          .
          </span>
        </label>
        <label className="mt-4 flex items-start gap-3 text-small-regular text-ui-fg-base">
          <input type="checkbox" name="marketing_opt_in" className="mt-1" />
          <span>Send me optional product news and promotions.</span>
        </label>
        {!agreement && (
          <p className="mt-4 text-small-regular text-ui-fg-error">
            Account registration is temporarily unavailable while the current
            agreement is being prepared.
          </p>
        )}
        <SubmitButton
          className="w-full mt-6"
          data-testid="register-button"
          disabled={!agreement}
        >
          Join
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
