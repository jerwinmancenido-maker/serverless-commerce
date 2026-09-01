# Research Protocol Access, Community, and Support Contract

Status: accepted source contract; database migration and runtime acceptance remain separate gates.

## Access levels

- `public`: a discoverable preview containing only fields explicitly marked public.
- `member`: an authenticated customer; full content is disabled by default.
- `purchaser`: a customer with an eligible protocol entitlement from an owned order.
- `admin`: authenticated staff with the applicable policy permission.

The backend projects protocol content for the caller's access level. Restricted fields must never be returned and must not rely on UI hiding.

## Default delivery

- Public pages may show the title, format, category, summary, selected facts, FAQs, references, applicable products, and generic recommendations.
- Complete schedule tables, calculator defaults, reference quantities, preparation, procedure, and full protocol content default to purchaser access.
- Order-linked opaque tokens return the preserved published revision and use private, no-store caching.
- Public updates never replace an order-preserved revision.
- A completed eligible purchase grants historical read access. Cancellation before completion does not grant access. Ordinary refunds retain the preserved document while rewards reverse. Fraud or chargeback revocation remains an explicit Admin operation.

## Community

- Community read and post access default to verified purchasers and may be loosened per protocol to signed-in members.
- Community routes are authenticated, private, no-store, and `noindex, nofollow`.
- A separate private alias is used. Community APIs never return customer name, email, customer ID, order ID, purchase date, line item ID, or QR token.
- Topics, replies, reactions, follows, reports, edit history, moderation history, pins, locks, and answered state remain separate from immutable protocol content.
- New content is held for Admin review by default. Deleted content uses a tombstone.
- Community content cannot update a protocol revision.
- Customer-to-customer direct messaging and public customer profiles are not enabled.

## Private support

- Customer support is a separate `customerSupport` module, not a community thread.
- A conversation may explicitly reference an owned order or protocol. Journal entries, measurements, routines, reminders, timeline events, and calculator history are never attached automatically.
- Customer-visible messages and staff-only internal notes are separate models and responses.
- Customer support routes are authenticated and private/no-store. Admin routes require `customer_support` policies.
- Staff replies can use Admin-managed saved responses, but the selected text remains editable and is never sent automatically.
- Customer PNG, JPEG, and PDF attachments are private, size-limited, owner-checked, and opened by Admin through a separately authorized file URL.
- Community replies, moderation decisions, and support replies use private in-app notifications with independent customer preferences.
- Attachments are private PNG, JPEG, or PDF files up to 10 MiB and are retrieved only after conversation ownership or staff permission is checked.
- Status and assignment changes are audited. Support, protocol publication, and community moderation use separate policy resources.

## Security and privacy

- Protocol preview is the only indexable surface, and indexing remains configurable.
- Protected protocol, QR, account, community, and support routes are not indexable.
- All mutations validate ownership or access inside workflows.
- User-generated text rejects control characters, has length limits, and is rendered as text.
- Posting, reporting, reactions, and support messaging are rate limited.
- Private Research Hub records never appear in public, community, product, recommendation, or support responses.

## Runtime gates

Source compilation does not establish database, browser, deployment, or production acceptance. Generated migrations must be inspected and applied only to an approved disposable/local database before exact-role browser acceptance.
