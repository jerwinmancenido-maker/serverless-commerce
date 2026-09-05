import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <Heading level="h2" className="text-base font-bold text-slate-900">
          Already have an Institutional or Researcher Account?
        </Heading>
        <Text className="text-xs text-slate-500 mt-1">
          Sign in for rapid saved protocols, wholesale rates, and batch tracking.
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer">
            Sign in &rarr;
          </span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
