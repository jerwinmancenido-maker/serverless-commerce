import {
  Checkbox,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from "@medusajs/ui"

import type {
  ConfiguredField,
  ConfiguredValue,
  ResearchBaseUnit,
  ResearchDisplayUnit,
  ResearchQuantityDimension,
  StructuredMeasurementInput,
} from "./types"

type MeasurementConfiguration = {
  dimension: ResearchQuantityDimension
  units: ResearchDisplayUnit[]
  countBases?: Array<{ key: string; label: string; active: boolean }>
}

const emptyMeasurement = (
  configuration: MeasurementConfiguration,
): StructuredMeasurementInput => ({
  amount: "",
  displayUnit: configuration.units[0],
  dimension: configuration.dimension,
  displayPrecision: 0,
  provenance: "declared",
  materialProfileId: null,
  sourceDocumentId: null,
  countBasis:
    configuration.dimension === "count"
      ? configuration.countBases?.find((basis) => basis.active)?.key || null
      : null,
})

const isMeasurement = (
  value: ConfiguredValue | undefined,
): value is StructuredMeasurementInput =>
  typeof value === "object" && value !== null && "displayUnit" in value

const isDocumentReference = (
  value: ConfiguredValue | undefined,
): value is { documentId: string; documentType: string } =>
  typeof value === "object" &&
  value !== null &&
  "documentId" in value &&
  "documentType" in value

const MeasurementInput = ({
  id,
  label,
  configuration,
  value,
  onChange,
}: {
  id: string
  label: string
  configuration: MeasurementConfiguration
  value: StructuredMeasurementInput | undefined
  onChange: (value: StructuredMeasurementInput) => void
}) => {
  const current = value || emptyMeasurement(configuration)
  const isIu = current.displayUnit === "IU"

  const update = (patch: Partial<StructuredMeasurementInput>) => {
    const next = { ...current, ...patch }

    if (patch.displayUnit && patch.displayUnit !== "IU") {
      delete next.unitProfile
      next.materialProfileId = null
    }

    onChange(next)
  }

  return (
    <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
      <Text size="small" leading="compact" weight="plus">
        {label}
      </Text>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor={`${id}-amount`}>Amount</Label>
          <Input
            id={`${id}-amount`}
            inputMode="decimal"
            value={current.amount}
            onChange={(event) => update({ amount: event.target.value })}
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Unit</Label>
          <Select
            value={current.displayUnit}
            onValueChange={(displayUnit) =>
              update({ displayUnit: displayUnit as ResearchDisplayUnit })
            }
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {configuration.units.map((unit) => (
                <Select.Item key={unit} value={unit}>
                  {unit}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor={`${id}-precision`}>Display precision</Label>
          <Input
            id={`${id}-precision`}
            type="number"
            min={0}
            max={6}
            value={current.displayPrecision}
            onChange={(event) =>
              update({ displayPrecision: Number(event.target.value) })
            }
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-y-2">
          <Label>Provenance</Label>
          <Select
            value={current.provenance}
            onValueChange={(provenance) =>
              update({
                provenance: provenance as StructuredMeasurementInput["provenance"],
              })
            }
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="declared">Declared</Select.Item>
              <Select.Item value="calculated">Calculated</Select.Item>
              <Select.Item value="estimated">Estimated</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label htmlFor={`${id}-source`}>Source document reference</Label>
          <Input
            id={`${id}-source`}
            value={current.sourceDocumentId || ""}
            onChange={(event) =>
              update({ sourceDocumentId: event.target.value || null })
            }
          />
        </div>
      </div>

      {configuration.dimension === "count" &&
      configuration.countBases?.length ? (
        <div className="flex flex-col gap-y-2">
          <Label>Count basis</Label>
          <Select
            value={current.countBasis || undefined}
            onValueChange={(countBasis) => update({ countBasis })}
          >
            <Select.Trigger>
              <Select.Value placeholder="Select count basis" />
            </Select.Trigger>
            <Select.Content>
              {configuration.countBases
                .filter((basis) => basis.active)
                .map((basis) => (
                  <Select.Item key={basis.key} value={basis.key}>
                    {basis.label}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select>
        </div>
      ) : null}

      {isIu ? (
        <div className="flex flex-col gap-y-3 rounded-lg bg-ui-bg-subtle p-4">
          <Text size="small" leading="compact" weight="plus">
            Product-specific IU conversion authority
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            IU has no universal mass or volume conversion. Record the verified
            material profile and its exact ledger conversion.
          </Text>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor={`${id}-material-profile`}>Material profile ID</Label>
              <Input
                id={`${id}-material-profile`}
                value={current.materialProfileId || ""}
                onChange={(event) =>
                  update({ materialProfileId: event.target.value || null })
                }
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <Label>Ledger base unit</Label>
              <Select
                value={current.unitProfile?.baseUnit}
                onValueChange={(baseUnit) =>
                  update({
                    unitProfile: {
                      displayUnit: "IU",
                      baseUnit: baseUnit as ResearchBaseUnit,
                      baseUnitsPerDisplayUnit:
                        current.unitProfile?.baseUnitsPerDisplayUnit || 1,
                      displayPrecision: current.displayPrecision,
                    },
                  })
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select base unit" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="microgram">Microgram</Select.Item>
                  <Select.Item value="microliter">Microliter</Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div className="flex flex-col gap-y-2">
              <Label htmlFor={`${id}-iu-factor`}>Base units per IU</Label>
              <Input
                id={`${id}-iu-factor`}
                type="number"
                min={1}
                step={1}
                value={current.unitProfile?.baseUnitsPerDisplayUnit || ""}
                onChange={(event) =>
                  update({
                    unitProfile: {
                      displayUnit: "IU",
                      baseUnit:
                        current.unitProfile?.baseUnit || "microgram",
                      baseUnitsPerDisplayUnit: Number(event.target.value),
                      displayPrecision: current.displayPrecision,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export const ConfiguredFieldInput = ({
  field,
  value,
  onChange,
}: {
  field: ConfiguredField
  value: ConfiguredValue | undefined
  onChange: (value: ConfiguredValue | undefined) => void
}) => {
  const enabled = value !== undefined
  const required = field.requirement === "draft"
  const visible = required || enabled

  const enable = () => {
    if (field.kind === "boolean") {
      onChange(false)
    } else if (field.kind === "measurement") {
      onChange(
        emptyMeasurement({
          dimension: field.dimension,
          units: field.allowed_display_units,
        }),
      )
    } else if (field.kind === "ratio") {
      onChange({
        numerator: emptyMeasurement({
          dimension: field.numerator_dimension,
          units: field.numerator_allowed_display_units,
        }),
        denominator: emptyMeasurement({
          dimension: field.denominator_dimension,
          units: field.denominator_allowed_display_units,
          countBases: field.denominator_count_bases,
        }),
      })
    } else if (field.kind === "document_reference") {
      onChange({
        documentId: "",
        documentType: field.allowed_document_types[0],
      })
    } else {
      onChange("")
    }
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between gap-x-4">
        <div className="flex flex-col gap-y-1">
          <Label htmlFor={`configured-${field.key}`}>
            {field.label}
            {required ? " *" : ""}
          </Label>
          {field.help_text ? (
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              {field.help_text}
            </Text>
          ) : null}
        </div>
        {!required ? (
          <div className="flex items-center gap-x-2">
            <Checkbox
              id={`configured-${field.key}-enabled`}
              checked={enabled}
              onCheckedChange={(checked) =>
                checked === true ? enable() : onChange(undefined)
              }
            />
            <Label htmlFor={`configured-${field.key}-enabled`}>Include</Label>
          </div>
        ) : null}
      </div>

      {visible && field.kind === "text" ? (
        field.multiline ? (
          <Textarea
            id={`configured-${field.key}`}
            maxLength={field.max_length}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <Input
            id={`configured-${field.key}`}
            maxLength={field.max_length}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
          />
        )
      ) : null}

      {visible && field.kind === "boolean" ? (
        <Select
          value={typeof value === "boolean" ? String(value) : undefined}
          onValueChange={(selected) => onChange(selected === "true")}
        >
          <Select.Trigger id={`configured-${field.key}`}>
            <Select.Value placeholder={`Select ${field.label}`} />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="true">Yes</Select.Item>
            <Select.Item value="false">No</Select.Item>
          </Select.Content>
        </Select>
      ) : null}

      {visible && field.kind === "single_select" ? (
        <Select
          value={typeof value === "string" ? value : undefined}
          onValueChange={onChange}
        >
          <Select.Trigger id={`configured-${field.key}`}>
            <Select.Value placeholder={`Select ${field.label}`} />
          </Select.Trigger>
          <Select.Content>
            {field.values
              .filter((option) => option.active)
              .sort((left, right) => left.position - right.position)
              .map((option) => (
                <Select.Item key={option.key} value={option.key}>
                  {option.label}
                </Select.Item>
              ))}
          </Select.Content>
        </Select>
      ) : null}

      {visible && field.kind === "measurement" ? (
        <MeasurementInput
          id={`configured-${field.key}`}
          label={field.label}
          configuration={{
            dimension: field.dimension,
            units: field.allowed_display_units,
          }}
          value={isMeasurement(value) ? value : undefined}
          onChange={onChange}
        />
      ) : null}

      {visible && field.kind === "ratio" ? (
        <div className="grid gap-3 xl:grid-cols-2">
          <MeasurementInput
            id={`configured-${field.key}-numerator`}
            label="Numerator"
            configuration={{
              dimension: field.numerator_dimension,
              units: field.numerator_allowed_display_units,
            }}
            value={
              typeof value === "object" &&
              value !== null &&
              "numerator" in value
                ? value.numerator
                : undefined
            }
            onChange={(numerator) =>
              onChange({
                numerator,
                denominator:
                  typeof value === "object" &&
                  value !== null &&
                  "denominator" in value
                    ? value.denominator
                    : emptyMeasurement({
                        dimension: field.denominator_dimension,
                        units: field.denominator_allowed_display_units,
                        countBases: field.denominator_count_bases,
                      }),
              })
            }
          />
          <MeasurementInput
            id={`configured-${field.key}-denominator`}
            label="Denominator"
            configuration={{
              dimension: field.denominator_dimension,
              units: field.denominator_allowed_display_units,
              countBases: field.denominator_count_bases,
            }}
            value={
              typeof value === "object" &&
              value !== null &&
              "denominator" in value
                ? value.denominator
                : undefined
            }
            onChange={(denominator) =>
              onChange({
                numerator:
                  typeof value === "object" &&
                  value !== null &&
                  "numerator" in value
                    ? value.numerator
                    : emptyMeasurement({
                        dimension: field.numerator_dimension,
                        units: field.numerator_allowed_display_units,
                      }),
                denominator,
              })
            }
          />
        </div>
      ) : null}

      {visible && field.kind === "document_reference" ? (
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="flex flex-col gap-y-2">
            <Label htmlFor={`configured-${field.key}`}>Document ID</Label>
            <Input
              id={`configured-${field.key}`}
              value={isDocumentReference(value) ? value.documentId : ""}
              onChange={(event) =>
                onChange({
                  documentId: event.target.value,
                  documentType: isDocumentReference(value)
                    ? value.documentType
                    : field.allowed_document_types[0],
                })
              }
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Document type</Label>
            <Select
              value={
                isDocumentReference(value)
                  ? value.documentType
                  : field.allowed_document_types[0]
              }
              onValueChange={(documentType) =>
                onChange({
                  documentId: isDocumentReference(value)
                    ? value.documentId
                    : "",
                  documentType,
                })
              }
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {field.allowed_document_types.map((documentType) => (
                  <Select.Item key={documentType} value={documentType}>
                    {documentType}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
      ) : null}
    </div>
  )
}
