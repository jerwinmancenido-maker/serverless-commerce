import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveResearchArticle, listResearchArticles } from "@lib/data/research-articles"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCanonicalProductSlug } from "@lib/util/product-handles"
import { Beaker, DocumentText, CheckCircleSolid } from "@medusajs/icons"

type Props = {
  params: Promise<{
    countryCode: string
    slug: string
  }>
}

export async function generateStaticParams() {
  const articles = await listResearchArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await retrieveResearchArticle(slug)

  if (!article) {
    return {
      title: "Article Not Found | Research Library",
    }
  }

  return {
    title: `${article.title} | Research Library`,
    description: article.abstract.slice(0, 160),
    openGraph: {
      title: article.title,
      description: article.abstract.slice(0, 160),
      type: "article",
      publishedTime: article.published_at,
    },
  }
}

export default async function ResearchArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await retrieveResearchArticle(slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* ── Breadcrumb Bar ── */}
      <div className="border-b border-slate-200/80 bg-slate-50/60 py-3">
        <div className="content-container flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <LocalizedClientLink href="/" className="hover:text-slate-800 transition-colors">
            Home
          </LocalizedClientLink>
          <span>/</span>
          <LocalizedClientLink href="/research-library" className="hover:text-slate-800 transition-colors">
            Research Library
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-emerald-800 font-semibold">{article.category}</span>
          <span>/</span>
          <span className="text-slate-800 truncate max-w-xs">{article.title}</span>
        </div>
      </div>

      {/* ── Article Article Header ── */}
      <div className="border-b border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white py-12 sm:py-16">
        <div className="content-container max-w-4xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
              {article.category}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              • {article.reading_time}
            </span>
            <span className="text-xs text-slate-400">
              • Published {new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {article.subtitle}
          </p>

          {/* Peer-Review & Scientific Oversight Banner */}
          <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-200/60 mt-4">
            <CheckCircleSolid className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              <strong className="text-slate-700">Scientific Oversight:</strong> {article.reviewed_by}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Reading Body ── */}
      <article className="content-container max-w-4xl mx-auto py-10 space-y-10">
        {/* Abstract Box */}
        <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/60 p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-950">
            <DocumentText className="h-4 w-4 text-emerald-700" />
            <span>Structured Scientific Abstract</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-slate-800 font-serif italic">
            &ldquo;{article.abstract}&rdquo;
          </p>
        </div>

        {/* Article Content Sections */}
        <div className="space-y-10">
          {article.sections.map((section, idx) => (
            <section key={section.title || idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-2">
                {section.title}
              </h2>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-700">
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── Conversion Bridge: Referenced Compound Specimen Card ── */}
        {article.referenced_compound && (
          <div className="rounded-2xl border border-slate-300 bg-slate-900 text-white p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400">
                  <Beaker className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-emerald-900/60 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wide">
                      Referenced Compound Specimen
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {article.referenced_compound.purity}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                    {article.referenced_compound.name}
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {article.referenced_compound.specification}. Produced under strict analytical quality control with lot-matched certificates of analysis (COA) included in the client dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <LocalizedClientLink
                href={`/products/${getCanonicalProductSlug(article.referenced_compound.handle)}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md text-center"
              >
                <span>View Compound in Store &rarr;</span>
              </LocalizedClientLink>

              <LocalizedClientLink
                href="/research-library#calculator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors text-center"
              >
                <span>Launch Reconstitution Tool 📐</span>
              </LocalizedClientLink>

              {article.referenced_compound.protocol_handle && (
                <LocalizedClientLink
                  href={`/research-protocols/${article.referenced_compound.protocol_handle}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-transparent hover:bg-slate-800/80 text-slate-300 border border-slate-700/80 text-xs font-semibold transition-colors text-center"
                >
                  <span>Product Protocol &rarr;</span>
                </LocalizedClientLink>
              )}
            </div>
          </div>
        )}

        {/* ── Scientific Citations & Bibliography ── */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Peer-Reviewed Literature &amp; Citations ({article.citations.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Verified DOI / PubMed</span>
          </div>

          <ol className="space-y-3.5 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
            {article.citations.map((c) => (
              <li key={c.number} className="pl-1">
                <span className="font-semibold text-slate-800">{c.authors}</span> &ldquo;{c.title}&rdquo;{" "}
                <em className="text-slate-700">{c.journal}</em> ({c.year}).{" "}
                {c.pmid && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-emerald-700 hover:underline font-mono ml-1 font-medium"
                  >
                    [PMID: {c.pmid} &nearr;]
                  </a>
                )}
                {c.doi && !c.pmid && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-emerald-700 hover:underline font-mono ml-1 font-medium"
                  >
                    [DOI: {c.doi} &nearr;]
                  </a>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* ── Mandatory Regulatory Disclaimer ── */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 leading-relaxed text-center sm:text-left">
          <p className="font-bold text-slate-700">Scientific Reference &amp; Regulatory Notice</p>
          <p className="mt-1">
            The articles, protocols, and data published in the Research Library are provided solely for in-vitro laboratory research, academic reference, and chemical education. Compounds supplied by the store are strictly not intended for human consumption, clinical diagnostic use, or veterinary administration.
          </p>
        </div>
      </article>
    </div>
  )
}
