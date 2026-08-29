# Configurable Compounded Product Contract

Status: approved implementation contract; implementation, migration, database,
deployment, and production activation remain separately unauthorized.

This contract defines a configurable Medusa product-creation workflow for
Research Compounds catalog items. It covers vial, nasal, topical, oral, and
future presentations without creating a parallel product catalog or hardcoding
operational product choices in application source.

## Objectives

The product-creation workflow must:

- Preserve Medusa products, product options, variants, prices, inventory kits,
  reservations, and stock movements as the operational sources of truth.
- Present product options as ordered `Variation 1`, `Variation 2`, and any
  additional administrator-configured variations.
- Keep each variation's semantic name, values, ordering, and availability
  configurable through Admin-managed data.
- Support structured `mcg`, `mg`, `g`, `µL`, `mL`, product-specific `IU`, and
  count quantities without treating different measurement dimensions as
  interchangeable.
- Keep net content, concentration, fill quantity, metered output, package
  quantity, and BOM consumption as separate concepts.
- Generate native Medusa variants from configured variation combinations.
- Make draft creation safe while clearly identifying data that blocks catalog
  publication.
- Remain extensible to presentations and measurement fields that do not exist
  when this contract is implemented.

## Non-goals

This contract does not:

- Define medical dosing, administration instructions, treatment protocols, or
  clinical interpretation.
- Certify that a product, formulation, claim, batch, or presentation is legally
  approved.
- Hardcode marketplace identifiers, prices, SKUs, carrier rules, payment
  methods, component recipes, or publication decisions.
- Replace Medusa's product, pricing, inventory, reservation, fulfillment, or
  promotion modules.
- Authorize a custom-module schema, migration, seed, database write, provider
  connection, deployment, or production activation.

## Source-of-truth boundaries

Medusa remains authoritative for:

- Product identity, description, handle, status, media, categories, tags,
  sales channels, and shipping profile.
- Product option names and values.
- Sellable product variants and their option combinations.
- Variant SKU, barcode, prices, inventory policy, and product metadata.
- Native product-variant to inventory-item links and required BOM quantities.
- Stock levels, reservations, adjustments, fulfillment, and returns.

The planned configurable-product subsystem may own configuration and governance
state only. It has two separate logical ownership areas even if a later approved
implementation places both in one custom Medusa module.

The configuration aggregate may own reusable creation guidance:

- Presentation profiles.
- Ordered variation templates and suggested values.
- Structured measurement-field definitions.
- Field visibility, requirement, ordering, and validation policy.
- Configurable SKU suggestion templates.
- Draft-readiness and publication-readiness policies.

The governance aggregate may own enforcement records:

- Governed-product registrations that link a Medusa product to its immutable
  configuration snapshot and readiness policy.
- Durable idempotency records and canonical payload fingerprints.
- Immutable configuration and governed-product audit events.

Neither aggregate may own a second copy of a created product, sellable variant,
price, stock quantity, reservation, or operational component recipe.

## Configuration rules

Operational catalog choices must be persisted as Admin-managed records rather
than source-code conditionals or constants. Administrators must be able to add,
edit, activate, deactivate, and reorder configuration records without an
application rebuild.

Configuration records require stable internal IDs. Display labels may change
without changing the identity of products or variants that already use them.
Deactivation prevents future selection but does not rewrite historical product
or order data.

The following are configurable data:

- Presentation names and descriptions.
- Variation count, order, semantic name, help text, and allowed values.
- Suggested inclusion, package, container, device, or quantity values.
- Measurement fields exposed for a presentation.
- Whether a field is optional, required for draft, or required for publication.
- Allowed display units for each configured measurement field.
- Variant-title and SKU suggestion templates.
- Draft-readiness and publication-readiness policies.
- Which fields are copied into native product or variant metadata.

Scientific and data-integrity invariants are validation rules rather than
operational hardcoding. For example, one milligram is exactly one thousand
micrograms. These fixed conversions cannot be changed by an administrator.
`IU` has no universal mass or volume conversion and always requires the
applicable verified material or product profile.

### Configuration revisions and historical stability

Every activated configuration change creates a new immutable revision. Editing
a draft configuration record before its first activation may update that draft,
but an activated revision is never rewritten in place.

Each product-creation session pins the exact revisions of its presentation,
variation templates, measurement definitions, SKU suggestion policy, and
readiness policy. The resulting product and variants retain a versioned
configuration snapshot or immutable revision references sufficient to interpret
their structured metadata without resolving mutable current labels.

Configuration lifecycle rules are:

- Existing products and order data retain the configuration meaning captured
  when the product was created.
- Renaming, reordering, replacing, or deactivating a current configuration
  creates or activates a new revision and does not mutate earlier revisions.
- Referenced revisions are archived rather than destructively deleted.
- Deactivated records remain readable for historical and draft interpretation
  but cannot be selected for a new product or variant.
- An in-progress creation session checks its pinned revisions before submission.
  If a newer revision exists or a pinned choice is inactive, submission pauses
  and presents an impact comparison.
- The administrator explicitly chooses to retain an eligible pinned revision or
  migrate the unfinished session to a newer revision. Migration previews every
  affected field, variant, SKU, price, measurement, and BOM choice and never
  discards downstream work silently.
- A pinned revision that has been administratively blocked for integrity or
  security reasons cannot be retained for a new submission.

## Presentation profiles

A presentation profile is a reusable Admin-managed definition of which fields
and variation suggestions should be shown during product creation. The profile
does not create a product by itself.

### Vial presentation

A vial profile may expose:

- Physical form, such as powder or liquid.
- Net active content.
- Fill volume when applicable.
- Concentration when applicable and explicitly known.
- Container and closure information.
- Inclusion or package choices.
- Storage and product-document references.

Reconstitution liquid supplied in a package is an inclusion or BOM component.
Its presence must not cause the system to infer a final concentration.

### Nasal presentation

A nasal profile may expose:

- Bottle fill volume.
- Total active content.
- Concentration.
- Metered volume per actuation.
- Active quantity per actuation.
- Declared or estimated actuation count, with its evidence status.
- Bottle, pump, cap, carton, and accessory choices.

Total content, concentration, metered output, and actuation count are separate
fields. The system may calculate a derived value only when every required input
and conversion is explicitly present. Derived values must be labeled as
calculated and must never overwrite declared source values.

### Topical presentation

A topical profile may expose:

- Physical form, such as serum, gel, or cream.
- Net fill mass or volume.
- Total active content.
- Concentration with explicit numerator and denominator units.
- Container type, such as bottle, pump, tube, or jar.
- Package and accessory choices.

Mass concentration, volume concentration, and percentage expressions must not
be converted into one another without the additional verified information
required by that conversion.

### Oral presentation

An oral profile may expose:

- Physical form, such as capsule, tablet, liquid, or powder.
- Quantity per package.
- Active content per unit when applicable.
- Total package content.
- Container or blister configuration.
- Package and accessory choices.

Per-unit content and package count remain distinct. The workflow may display a
calculated package total when both declared inputs are valid, but it must retain
the original values and calculation provenance.

### Future presentations

Administrators must be able to create a new presentation profile without
adding a new source-code branch for its name. A future profile is assembled
from supported structured field types and measurement dimensions.

Adding a genuinely new measurement dimension, conversion rule, or workflow
behavior remains a source change requiring its own review and verification. A
free-text field must not be used to bypass quantity validation.

## Structured measurements

A structured measurement contains enough information to interpret the value
without parsing a display label:

- Decimal amount as a normalized string or exact decimal representation.
- Display unit ID and display label.
- Measurement dimension, such as mass, volume, potency, count, or ratio.
- Base unit and exact base-unit conversion when the dimension supports it.
- Display precision.
- Declared, calculated, or estimated provenance.
- Optional source-document or material-profile reference.

Supported fixed ledger conversions remain aligned with the BOM quantity
contract:

| Display quantity | Ledger representation | Rule |
| --- | --- | --- |
| `mcg` | integer micrograms | fixed |
| `mg` | integer micrograms | `1 mg = 1,000 mcg` |
| `g` | integer micrograms | `1 g = 1,000,000 mcg` |
| `µL` | integer microliters | fixed |
| `mL` | integer microliters | `1 mL = 1,000 µL` |
| `IU` | verified profile base unit | no global conversion |
| count | integer pieces | fixed |

Customer-facing values use readable labels such as `1 mg`, `500 mcg`, `10 mL`,
or `5,000 IU`. Internal identity and comparison use the structured value and
unit profile, not capitalization or spacing in the display label.

### Concentration and ratios

Concentration is stored as a structured numerator and denominator, for example
`2 mg / 1 mL` or `100 mcg / actuation`. The system must not store `2 mg/mL` as
the only machine-readable value.

Ratio validation requires:

- A positive numerator amount and allowed numerator unit.
- A positive denominator amount and allowed denominator unit or count basis.
- Compatible presentation policy.
- An explicit conversion profile for `IU`.
- No silent rounding outside the configured precision.

## Variations and native variants

The creation interface renders every configured product option as an ordinal
section:

- `Variation 1 — <semantic name>`
- `Variation 2 — <semantic name>`
- Further ordered variations when configured.

The ordinal communicates order only. The semantic name is the native Medusa
product-option name. A template may suggest common semantics such as
`Inclusion` and `Net Content`, but neither the name nor its values are embedded
as mandatory application constants.

For a vial template, an administrator could configure:

- `Variation 1 — Inclusion`: Vial Only, Vial + BAC, SubQ Set.
- `Variation 2 — Net Content`: structured values selected for the product.

For a nasal template, an administrator could instead configure:

- `Variation 1 — Package`: Bottle Only, Bottle + Accessories.
- `Variation 2 — Net Content`: structured volume or active-content values.

These are examples, not globally required options.

The first custom creation interface supports adding, removing, and reordering
further variation axes rather than imposing a fixed maximum of two. A
presentation template may default to two axes, and an approved readiness policy
may require particular semantics, but those defaults do not reduce Medusa's
native option model to two hardcoded fields.

The workflow generates the Cartesian product of selected option values and
shows the resulting native variants before submission. Administrators may
exclude a generated row before creation.

### Bounded variant generation

Before materializing a variant matrix, the client and server calculate the
complete Cartesian-product count using safe integer arithmetic. No native
product or variant mutation begins until the count is accepted.

Variant-generation limits have two layers:

- An Admin-managed warning threshold controls when the interface requires an
  explicit large-matrix confirmation.
- A deployment-configured server maximum prevents unsafe resource consumption
  regardless of client behavior. It is validated against a non-bypassable
  implementation safety ceiling and cannot be increased through a product or
  presentation template.

The preview shows total combinations, excluded combinations, resulting variant
count, and the variation axes contributing to the count. Exceeding the warning
threshold requires explicit confirmation tied to the current payload
fingerprint. Exceeding the server maximum rejects the request before native
mutations. Changing the matrix invalidates the prior confirmation and produces
a new fingerprint.

Every generated row exposes:

- Option combination and generated title preview.
- Editable SKU suggestion.
- Region-aware price fields, including PHP when the selected region uses PHP.
- Inventory management and backorder policy.
- Optional structured measurement and concentration metadata.
- Native inventory-kit/BOM configuration or readiness status.
- Image assignment and publication-readiness status.

Variant generation must be deterministic for the same ordered inputs. Duplicate
option combinations are rejected. Equivalent normalized quantities, such as
`1 mg` and `1,000 mcg`, cannot be used as duplicate values on the same option
axis unless a later approved policy explicitly distinguishes them.

## Product identity and metadata

The product title identifies the compound or catalog product without forcing a
strength or package value into the title. For example:

- Product title: `5-Amino-1MQ`
- Variation 1: `Vial Only`
- Variation 2: `1 mg`
- Generated variant title: `Vial Only / 1 mg`

The handle is suggested from the title and remains editable. Subtitle and
description placeholders must be presentation-neutral and must not retain
apparel examples from the starter dashboard.

Structured configuration identity and measurements may be copied to Medusa
product or variant metadata. Metadata keys require a versioned namespace so
future schema evolution does not rely on parsing human-readable labels.

Historical orders retain the product and variant information captured by
Medusa. Renaming a configuration label must not silently rewrite order-line
meaning.

### Governed compounded-product registration

A compounded product is identified by an authoritative governed-product
registration linked to the native Medusa product. The registration is not a
second product record. It contains only the governance identity required to
validate the native product:

- Native Medusa product ID through an approved module link.
- Governed catalog kind and contract schema version.
- Immutable configuration snapshot or pinned revision references.
- Pinned readiness-policy revision.
- Registration state and audit identity.

Product metadata may contain a redundant namespaced marker for Admin display or
query convenience, but mutable metadata is not the authoritative registration.
Deleting or editing the metadata marker cannot remove governance.

Presentation configuration identifies which Admin-managed Medusa product types
or other approved classifications require governed registration. This mapping
is configurable data and uses stable Medusa IDs rather than product-title,
handle, SKU, or free-text inference.

Rules for governed classification are:

- The custom creation workflow registers the governed product atomically with
  its native product creation or compensates both on failure.
- A product created by another authorized Medusa path cannot enter a
  classification configured as governed until a valid registration and
  configuration snapshot are attached.
- Removing governed classification or registration is a separate permissioned
  workflow. It is prohibited after publication, order-line use, or any other
  configured irreversible boundary; otherwise it requires an impact preview and
  audit record.
- Ordinary supplies and other classifications not configured as governed remain
  available to Medusa's standard product workflows and are not silently treated
  as compounded products.
- Imports, bulk operations, scripts, custom APIs, and Admin forms are subject to
  the same classification and registration validation as individual edits.

## SKU and marketplace boundaries

SKU generation is a suggestion service, not an authority. Its template,
segments, separators, normalization, and optional presentation codes are
Admin-managed configuration. Every suggested SKU remains editable and must
pass Medusa uniqueness validation.

Marketplace SKU mappings remain separate integration data. A Lazada, TikTok
Shop, or Shopee identifier must not become the canonical Medusa variant ID or
be inferred from a configurable SKU template.

## BOM and inventory boundary

Every sellable combination remains a native Medusa product variant. Its active
recipe remains the native inventory-kit link set defined by the BOM contract.

Presentation or inclusion configuration may suggest a component recipe, but it
must not hardcode operational inventory-item IDs or silently activate a recipe.
The administrator selects configured components or an approved reusable recipe
template, reviews converted base-unit quantities, and explicitly confirms the
variant recipe.

Examples of configurable components include active-material inventory, vial,
stopper, cap, label, diluent, nasal pump, bottle, carton, syringe, or other
accessories. The examples do not create globally required components.

Draft products may exist without a complete recipe when policy allows it.
Publication readiness must clearly identify missing managed-inventory recipes,
invalid conversions, or unavailable component profiles.

## Creation experience

The recommended Admin workflow is a dedicated `Create Compounded Product`
route built with Medusa Admin extensions. The installed Medusa dashboard is not
patched or forked.

The workflow contains these reviewable stages:

1. Product identity — title, presentation, subtitle, handle, description, and
   media.
2. Presentation data — configured structured fields for the selected profile.
3. Variations — ordered variation definitions and values.
4. Variant matrix — generated combinations, SKU, prices, inventory policy, and
   images.
5. BOM — component recipes and conversion preview where applicable.
6. Review — draft readiness, publication blockers, and final payload preview.

Changing a presentation or earlier variation after entering downstream data
requires an impact preview. The interface must not silently discard variant,
price, SKU, measurement, or BOM work.

The initial creation action is always `Save as draft`. Draft-first creation is
a safety and review invariant, not an administrator-configurable catalog value.
Publication is a distinct mutation governed by the pinned publication-readiness
policy and Medusa permissions. No configurable template may convert the draft
action into implicit publication.

### Publication enforcement across Medusa paths

Publication readiness is a server-side invariant for every product whose
classification requires governed registration. It is not limited to the custom
Admin page.

Every path capable of creating or changing a governed product to a sellable or
published state must execute the same readiness workflow, including:

- The custom compounded-product creation and publication interfaces.
- Medusa's native product create and edit APIs.
- Bulk updates and imports.
- Custom workflows, scripts, jobs, or integrations.

The guard resolves the authoritative governed-product registration, pinned
configuration snapshot, readiness-policy revision, structured measurements,
variant matrix, prices, sales-channel requirements, and BOM readiness. A
missing registration for a classification configured as governed is a blocker,
not permission to bypass the policy.

Direct database status changes are prohibited. If a Medusa extension point
cannot reliably enforce the invariant on every supported native mutation path,
that path must be permission-restricted or disabled for governed products until
an equivalent server-side guard exists. Client-only hiding or button disabling
is not enforcement.

## Validation contract

The backend validates all mutation input even when the Admin form has already
validated it. Business validation belongs in workflow steps rather than route
handlers.

At minimum, validation must reject:

- Empty required product identity fields.
- Unknown, inactive, or incompatible configuration references.
- Duplicate variation positions, semantic names, values, or combinations.
- Zero, negative, non-finite, or unsupported structured quantities.
- Invalid fixed-unit conversions.
- `IU` without an applicable explicit conversion profile.
- Concentration missing either side of the ratio.
- Duplicate normalized net-content values on one option axis.
- Duplicate or invalid SKUs.
- A governed classification without an authoritative registration and pinned
  configuration snapshot.
- A requested variant matrix above the deployment-configured server maximum.
- Unsafe integer base-unit conversions or silent fractional ledger values.
- Publication when a configured blocker remains unresolved.

Draft-readiness errors and publication-readiness errors are reported
separately. A failed workflow leaves no partially created product, price,
variant, or recipe from that submission.

### Idempotency and concurrent submission

Every product-creation mutation requires a server-validated idempotency key and
a canonical payload fingerprint. Idempotency is durable in the approved
database-backed implementation and cannot depend only on process memory.

The mutation contract is:

- Replaying the same accepted key with the same canonical payload returns the
  original product and variant result without repeating native mutations.
- Reusing an accepted or in-progress key with a different canonical payload is
  rejected with HTTP `409 Conflict`.
- Concurrent requests using the same key and payload produce one committed
  creation result. Other requests replay that result or receive a defined
  in-progress response without creating duplicate records.
- SKU and native uniqueness conflicts are mapped deterministically and do not
  become successful idempotent results.
- Workflow compensation belongs only to the failing execution that created the
  compensated resources. It must not delete or reverse another successful
  concurrent execution.
- A failed attempt may be retried only under a defined key-state transition that
  preserves the failure record and prevents ambiguous partial replay.
- Payload fingerprinting includes pinned configuration revisions and every
  field that can change product, variant, price, metadata, or BOM output.

## Backend and Admin architecture

The planned mutation path follows the Medusa architecture boundary:

```text
Admin configuration and creation form
  -> authenticated Medusa SDK request
  -> validated Admin API route
  -> compounded-product creation workflow
  -> native Medusa product, pricing, and inventory workflows
```

The custom route must use Medusa Admin authentication. The Admin extension uses
the Medusa JS SDK rather than unauthenticated `fetch` calls. All mutations run
through workflows with compensation for partially completed native operations.

The configuration aggregate stores templates, immutable revisions, structured
field definitions, and validation/readiness policy. The governance aggregate
stores governed-product registrations, durable idempotency state, and immutable
audit events. Both use module links or stable configuration references rather
than direct foreign-key ownership of Medusa product tables.

The implementation may place these aggregates in one approved custom module or
separate modules. In either arrangement, services, models, workflows, and tests
must preserve their logical ownership boundary and must not turn governance
records into a parallel commerce catalog.

## Permissions and auditability

Configuration management, product creation, governed registration, and product
publication may have different Admin permissions.

The approved implementation must write an immutable audit event for:

- Configuration creation, activation, replacement, deactivation, and archival.
- Governed-product registration, reclassification, and any permitted removal.
- Retaining or migrating a stale creation session to a configuration revision.
- Large variant-matrix confirmation.
- Product draft creation, readiness evaluation, publication, rejection, and
  withdrawal from publication.

Every event records event ID, action, actor ID, timestamp, affected native
Medusa IDs, configuration and policy revisions, payload or decision fingerprint,
outcome, and a reason when applicable. Audit failure fails the associated
mutation rather than silently completing an unaudited governance action.

Audit records contain operational identifiers and decisions, not duplicated
product descriptions, uploaded files, credentials, or customer data. Retention
and authorized access require an approved policy before production.

Changing a reusable template affects future form defaults only. It does not
silently mutate previously created products, variants, prices, or recipes.

## Acceptance scenarios

| ID | Scenario | Required outcome |
| --- | --- | --- |
| CCP-001 | Administrator creates a vial presentation template | Template becomes selectable without an application rebuild |
| CCP-002 | Administrator creates a nasal presentation template | Nasal fields render from configuration rather than a source-code branch |
| CCP-003 | Product uses two variation axes | Interface labels them Variation 1 and Variation 2 and preserves semantic names |
| CCP-004 | Product uses three configured variation axes | A third ordered axis is supported without changing the product model |
| CCP-005 | Two axes have three and two selected values | Six deterministic native variant rows are previewed |
| CCP-006 | Administrator excludes one generated row | Only five variants are submitted |
| CCP-007 | Values contain `1 mg` and `1,000 mcg` on one axis | Equivalent duplicate is rejected |
| CCP-008 | Product declares `IU` without a profile | Validation rejects the mutation |
| CCP-009 | Nasal product declares volume and metered output | Both values remain distinct and retain provenance |
| CCP-010 | Diluent is included with a vial | No concentration is inferred from the inclusion alone |
| CCP-011 | Template label is renamed | Existing product and order identity remain unchanged |
| CCP-012 | Template value is deactivated | It disappears from future selection without rewriting existing variants |
| CCP-013 | SKU template produces an existing SKU | Administrator must resolve the uniqueness conflict |
| CCP-014 | Managed variant has no valid BOM recipe | Draft policy may allow saving; publication policy reports a blocker |
| CCP-015 | Workflow fails after creating intermediate data | Compensation leaves no partial submitted catalog state |
| CCP-016 | New future presentation uses existing field types | Administrator configures it without a source-code presentation branch |
| CCP-017 | New measurement dimension is requested | It remains blocked pending source, validation, and migration review |
| CCP-018 | Activated presentation configuration is edited | A new immutable revision is created; the prior revision remains readable |
| CCP-019 | In-progress creation uses an outdated configuration revision | Submission pauses and shows an explicit retain-or-migrate impact comparison |
| CCP-020 | Referenced configuration value is deactivated | Existing products remain interpretable; new selection is rejected |
| CCP-021 | Same idempotency key and payload are replayed | Original creation result is returned without duplicate mutation |
| CCP-022 | Same idempotency key is reused with a different payload | Request fails with HTTP 409 and changes nothing |
| CCP-023 | Concurrent creation requests use the same key and payload | Exactly one product/variant result is committed |
| CCP-024 | One concurrent execution fails after another succeeds | Compensation does not alter the successful result |
| CCP-025 | Native Admin attempts to publish a governed product with blockers | Server rejects publication through the shared readiness workflow |
| CCP-026 | Governed product-type mapping exists but registration is missing | Create, reclassify, or publish mutation is rejected |
| CCP-027 | Standard supply belongs to a non-governed classification | Native Medusa workflow remains available without compounded-product inference |
| CCP-028 | Variant count exceeds the warning threshold but not the server maximum | Exact count is shown and explicit fingerprint-bound confirmation is required |
| CCP-029 | Variant count exceeds the server maximum | Request is rejected before any native mutation |
| CCP-030 | Governed publication succeeds | Immutable actor, revision, decision, and outcome audit event exists |
| CCP-031 | Required audit write fails | Governed mutation fails and compensation preserves the prior state |

## Implementation slices and gates

Implementation remains unauthorized until this contract is reviewed and
approved. The proposed slices are:

1. Configuration-module model and API contract, source only.
2. Admin configuration interfaces, source only.
3. Structured measurement and variant-generation library with database-free
   tests.
4. Durable idempotency contract and canonical payload fingerprinting.
5. Governed-product registration and shared publication-readiness enforcement.
6. Compounded-product creation workflow and authenticated Admin API.
7. Admin creation form and bounded native variant-matrix preview, including
   additional ordered variation axes.
8. BOM recipe selection and publication-readiness integration.
9. Required governance audit events and permissions.
10. Migration generation for approved configuration, registration, idempotency,
    or audit models.
11. Disposable-database migration and authenticated HTTP integration tests,
    including replay, conflict, concurrency, native-publication bypass, audit,
    and compensation scenarios.
12. Browser-runtime product-creation smoke testing against approved local data.

Each source review, source fix, local commit, migration generation, migration
application, database test, push, Neon access, deployment, and production
activation remains an independent authorization gate.

## Open decisions before implementation

The contract requires explicit review of:

- The custom configuration-module name and logical record boundaries.
- Whether configuration starts empty or receives separately approved editable
  starter records.
- Which fields are required for draft and which block publication.
- The approved structured field types available to future presentations.
- SKU suggestion policy and any organization-specific prefixes.
- Who may manage configuration, create drafts, and publish products.
- Whether reusable BOM recipe templates belong in this configuration boundary
  or a later BOM-specific contract.
- The durable idempotency-record ownership, retention, and cleanup policy.
- The configurable large-matrix warning threshold, deployment server maximum,
  and non-bypassable implementation safety ceiling.
- The product-type or classification mappings that require governed
  registration.
- Governance-audit retention and authorized-access policy.

Until those decisions and later runtime gates are approved, this document is a
design contract only and is not evidence of implemented or production-ready
behavior.
