import ResearchHubNav from "@modules/account/components/research-hub-nav"

export default function ResearchHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ResearchHubNav />
      {children}
    </div>
  )
}
