import { redirect } from "next/navigation"

export default async function Profile({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  redirect(`/${countryCode}/account/settings`)
}
