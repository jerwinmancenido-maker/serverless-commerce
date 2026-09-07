import { redirect } from "next/navigation"

type Props = {
  params: Promise<{
    countryCode: string
  }>
}

export default async function ResearchProtocolsPage({ params }: Props) {
  const { countryCode } = await params
  redirect(`/${countryCode}/research-library?tab=protocols#protocols`)
}
