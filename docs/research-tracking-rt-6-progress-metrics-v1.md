# Research Tracking RT-6 Progress Metrics v1

## Founder authorization and supersession

This decision records the Founder-approved initial measurement allowlist for the
Research Protocol, Personal Routines, Journal, and progress-tracking experience.
It supersedes only the earlier `empty-unapproved-v1` measurement-allowlist gate
in the RT-6 planning and privacy decision records. All other ownership,
purpose-specific consent, privacy, revision, deletion, telemetry-redaction, and
no-automatic-collection controls remain in force.

The approved server-owned allowlist version is `progress-metrics-v1`.

## Approved metrics

| Metric | Accepted units | Normalized unit | Initial chart |
| --- | --- | --- | --- |
| Weight | `kg`, `lb` | `kg` | Weight trend |
| Waist | `cm`, `in` | `cm` | Future selectable trend |
| Body fat | `percent` | `percent` | Future selectable trend |

No free-form metric names or units are accepted. Original values and units are
retained with their normalized representation. New metrics require a new
allowlist version and an explicit Founder decision.

## Collection rules

- Measurements are optional and customer-created only.
- A purchase or protocol entitlement never creates a measurement.
- Measurements require current, purpose-specific Measurements consent.
- Every create, revise, void, and restore mutation is idempotent and preserves
  immutable revision history.
- A measurement may reference an owned routine, protocol revision, protocol
  access, tracked material, or activity log for provenance.
- Measurement values and notes are prohibited from logs, analytics, and
  recommendation events.
- Measurements never mutate Medusa inventory, a customer supply balance, an
  order, a routine schedule, or published protocol content.

## Progress presentation

The first customer progress view includes current, starting, change,
percentage-change, low, high, count, weekly-average, and a chronological weight
trend. It presents recorded observations without automatically creating goals,
diagnoses, alerts, or protocol changes.

## Separate merchandising boundary

Product recommendations may use protocol, order, and routine context, but must
not receive raw measurement or Journal content. Recommendation events may store
only controlled identifiers, placement, relationship type, and event type.
