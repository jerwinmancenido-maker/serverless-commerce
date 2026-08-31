import type { ResearchTimelineEvent } from "@lib/data/research-tracking"

export default function ActivityTimeline({
  events,
  runtimeReady,
}: {
  events: ResearchTimelineEvent[]
  runtimeReady: boolean
}) {
  return (
    <section className="mt-10" data-testid="research-timeline">
      <h2 className="text-lg font-semibold">Research timeline</h2>
      <p className="mt-1 text-sm text-ui-fg-subtle">
        Protocol, routine, activity, measurement, supply, and Journal events in one history.
      </p>
      <div className="mt-4 rounded-xl border border-ui-border-base bg-white p-5">
        {!runtimeReady ? (
          <p className="text-sm text-amber-700">Timeline could not be loaded.</p>
        ) : events.length ? (
          <ol className="space-y-4">
            {events.slice(0, 20).map((event) => (
              <li key={event.id} className="grid grid-cols-[0.75rem_1fr] gap-3">
                <span className="mt-1.5 size-2 rounded-full bg-blue-600" />
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium capitalize">{event.title}</p>
                    <time className="text-xs text-ui-fg-muted">
                      {new Date(event.occurred_at).toLocaleString("en-PH")}
                    </time>
                  </div>
                  {event.detail ? (
                    <p className="mt-1 line-clamp-2 text-sm text-ui-fg-subtle">{event.detail}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-ui-fg-subtle">Your timeline will build as you use Research & Tracking.</p>
        )}
      </div>
    </section>
  )
}
