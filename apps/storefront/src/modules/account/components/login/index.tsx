import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useSearchParams } from "next/navigation"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const searchParams = useSearchParams()
  const isCheckoutRedirect = searchParams.get("redirect") === "checkout"

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      {isCheckoutRedirect && (
        <div
          className="w-full mb-6 rounded-rounded border border-amber-300 bg-amber-50 p-4 text-center text-small-regular text-amber-900"
          data-testid="checkout-login-notice"
        >
          <p className="font-semibold text-amber-950 mb-1">
            🔒 Account Required for Clinical Checkout
          </p>
          <p>
            Please sign in or create an account to verify formulation protocols and complete your compound order.
          </p>
        </div>
      )}
      <div className="w-full text-center mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 border border-slate-200">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Researcher Portal Authentication
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome Back
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          Sign in to access your verified research orders, dispatch tracking, and protocol workspace.
        </p>
      </div>
      {message?.state === "verification_required" && (
        <div
          className="w-full mb-6 text-center text-xs text-slate-700 bg-emerald-50/90 border border-emerald-200/90 rounded-xl p-4 shadow-2xs"
          data-testid="login-verification-message"
        >
          We sent a verification link to <strong className="font-bold text-emerald-950">{message.email}</strong>.
          Please verify your email, then sign in.
        </div>
      )}
      <form id="customer-login-form" name="customer-login" className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            id="email"
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="username"
            required
            data-testid="email-input"
          />
          <Input
            id="password"
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>

        {/* Terms and Conditions & Privacy Policy Agreement Checkbox */}
        <div className="mt-4 flex items-start gap-2.5 text-xs text-slate-600">
          <input
            type="checkbox"
            id="login-terms-agreement"
            name="terms_agreement"
            required
            data-testid="login-terms-agreement"
            className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
          />
          <label htmlFor="login-terms-agreement" className="cursor-pointer leading-tight text-[11px] sm:text-xs">
            I have read and agree to the{" "}
            <a
              href="/legal/terms"
              target="_blank"
              rel="noreferrer"
              className="text-slate-900 underline font-semibold hover:text-black"
            >
              Terms &amp; Conditions
            </a>{" "}
            and{" "}
            <a
              href="/legal/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-slate-900 underline font-semibold hover:text-black"
            >
              Privacy Policy
            </a>
            .
          </label>
        </div>

        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-5">
          Sign in
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Join us
        </button>
        .
      </span>
    </div>
  )
}

export default Login
