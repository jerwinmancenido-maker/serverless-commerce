import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BookOpen, Plus } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"

import { sdk } from "../../lib/sdk"
import type { ResearchAgreementListResponse } from "./types"

const color = (status: string) => {
  if (status === "active") return "green" as const
  if (status === "draft" || status === "scheduled") return "orange" as const
  return "grey" as const
}

const ResearchAgreementsPage = () => {
  const query = useQuery({
    queryKey: ["research-agreements"],
    queryFn: () =>
      sdk.client.fetch<ResearchAgreementListResponse>(
        "/admin/research-agreements",
      ),
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-start justify-between gap-4 px-6 py-4">
        <div>
          <Heading>Customer agreements</Heading>
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            Version the combined Terms, Privacy and Research Hub agreement used
            at signup and one-time account setup.
          </Text>
        </div>
        <Button asChild size="small">
          <Link to="/research-agreements/new"><Plus />Add agreement</Link>
        </Button>
      </div>
      {query.isLoading ? (
        <Text className="px-6 py-8">Loading agreements…</Text>
      ) : query.isError ? (
        <Text className="text-ui-fg-error px-6 py-8">
          Agreements could not be loaded.
        </Text>
      ) : query.data?.agreement_bundles.length ? (
        <div className="divide-y">
          {query.data.agreement_bundles.map((bundle) => (
            <div key={bundle.id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="min-w-0">
                <Link to={`/research-agreements/${bundle.id}`} className="text-ui-fg-interactive hover:underline">
                  <Text weight="plus">Version {bundle.public_version}</Text>
                </Link>
                <Text size="small" className="mt-1 text-ui-fg-subtle">
                  {bundle.locale} · effective {new Date(bundle.effective_at).toLocaleString()} · {query.data.acceptance_counts[bundle.id] || 0} acceptances
                </Text>
              </div>
              <Badge color={color(bundle.status)}>{bundle.status}</Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <BookOpen />
          <Text weight="plus">No agreement bundle yet</Text>
          <Text size="small" className="text-ui-fg-subtle">
            Create a draft before opening signup for Research Hub accounts.
          </Text>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Agreements" })

export default ResearchAgreementsPage
