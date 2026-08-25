"use client"

import {
  listPhilippineAddressAreas,
  listPhilippineBarangays,
  listPhilippineCitiesMunicipalities,
} from "@lib/data/philippine-address"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import {
  PhilippineAddressArea,
  PhilippineAddressOption,
} from "../../../../types/philippine-address"
import { ReactNode, useEffect, useMemo, useState } from "react"

const EXISTING_VALUE = "__existing_value__"

type AddressValues = {
  province?: string | null
  city?: string | null
  barangay?: string | null
}

type PhilippineAddressFieldsProps = {
  fieldNames?: {
    province: string
    city: string
    barangay: string
  }
  initialValues?: AddressValues
  testIdPrefix?: string
  layout?: "single" | "two-column"
  children?: ReactNode
}

const normalizeName = (value: string) =>
  value
    .normalize("NFKD")
    .toLocaleLowerCase("en-PH")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

const findMatchingOption = <T extends PhilippineAddressOption>(
  options: T[],
  value: string
) => {
  const normalizedValue = normalizeName(value)
  return options.find((option) => normalizeName(option.name) === normalizedValue)
}

const SelectField = ({
  label,
  value,
  onChange,
  options,
  disabled,
  loading,
  existingValue,
  testId,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: PhilippineAddressOption[]
  disabled?: boolean
  loading?: boolean
  existingValue?: string
  testId: string
}) => (
  <label>
    <span className="sr-only">{label}</span>
    <NativeSelect
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={loading ? `Loading ${label.toLowerCase()}...` : label}
      disabled={disabled || loading}
      required
      aria-label={label}
      data-testid={testId}
    >
      {value === EXISTING_VALUE && existingValue && (
        <option value={EXISTING_VALUE}>{existingValue}</option>
      )}
      {options.map((option) => (
        <option key={option.code} value={option.code}>
          {option.name}
        </option>
      ))}
    </NativeSelect>
  </label>
)

const PhilippineAddressFields = ({
  fieldNames = {
    province: "province",
    city: "city",
    barangay: "address_2",
  },
  initialValues = {},
  testIdPrefix = "address",
  layout = "single",
  children,
}: PhilippineAddressFieldsProps) => {
  const [areas, setAreas] = useState<PhilippineAddressArea[]>([])
  const [cities, setCities] = useState<PhilippineAddressOption[]>([])
  const [barangays, setBarangays] = useState<PhilippineAddressOption[]>([])
  const [selectedAreaCode, setSelectedAreaCode] = useState("")
  const [selectedCityCode, setSelectedCityCode] = useState("")
  const [selectedBarangayCode, setSelectedBarangayCode] = useState("")
  const [province, setProvince] = useState(initialValues.province || "")
  const [city, setCity] = useState(initialValues.city || "")
  const [barangay, setBarangay] = useState(initialValues.barangay || "")
  const [loadingAreas, setLoadingAreas] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)
  const [error, setError] = useState("")
  const [manualMode, setManualMode] = useState(false)

  useEffect(() => {
    setProvince(initialValues.province || "")
    setCity(initialValues.city || "")
    setBarangay(initialValues.barangay || "")
    setSelectedAreaCode("")
    setSelectedCityCode("")
    setSelectedBarangayCode("")
  }, [initialValues.province, initialValues.city, initialValues.barangay])

  useEffect(() => {
    let active = true

    setLoadingAreas(true)
    listPhilippineAddressAreas()
      .then((items) => {
        if (active) {
          setAreas(items)
          setError("")
          setManualMode(false)
        }
      })
      .catch(() => {
        if (active) {
          setError("Automatic address lookup is temporarily unavailable.")
          setManualMode(true)
        }
      })
      .finally(() => {
        if (active) {
          setLoadingAreas(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!areas.length || selectedAreaCode || !province) {
      return
    }

    const match = findMatchingOption(areas, province)
    setSelectedAreaCode(match?.code || EXISTING_VALUE)
  }, [areas, province, selectedAreaCode])

  const selectedArea = useMemo(
    () => areas.find((area) => area.code === selectedAreaCode),
    [areas, selectedAreaCode]
  )

  useEffect(() => {
    if (!selectedArea) {
      setCities([])
      setLoadingCities(false)
      return
    }

    let active = true
    setLoadingCities(true)
    listPhilippineCitiesMunicipalities(selectedArea)
      .then((items) => {
        if (active) {
          setCities(items)
          setError("")
        }
      })
      .catch(() => {
        if (active) {
          setCities([])
          setError("Automatic address lookup is temporarily unavailable.")
          setManualMode(true)
        }
      })
      .finally(() => {
        if (active) {
          setLoadingCities(false)
        }
      })

    return () => {
      active = false
    }
  }, [selectedArea])

  useEffect(() => {
    if (!cities.length || selectedCityCode || !city) {
      return
    }

    const match = findMatchingOption(cities, city)
    setSelectedCityCode(match?.code || EXISTING_VALUE)
  }, [cities, city, selectedCityCode])

  useEffect(() => {
    if (!selectedCityCode || selectedCityCode === EXISTING_VALUE) {
      setBarangays([])
      setLoadingBarangays(false)
      return
    }

    let active = true
    setLoadingBarangays(true)
    listPhilippineBarangays(selectedCityCode)
      .then((items) => {
        if (active) {
          setBarangays(items)
          setError("")
        }
      })
      .catch(() => {
        if (active) {
          setBarangays([])
          setError("Automatic address lookup is temporarily unavailable.")
          setManualMode(true)
        }
      })
      .finally(() => {
        if (active) {
          setLoadingBarangays(false)
        }
      })

    return () => {
      active = false
    }
  }, [selectedCityCode])

  useEffect(() => {
    if (!barangays.length || selectedBarangayCode || !barangay) {
      return
    }

    const match = findMatchingOption(barangays, barangay)
    setSelectedBarangayCode(match?.code || EXISTING_VALUE)
  }, [barangays, barangay, selectedBarangayCode])

  const handleAreaChange = (code: string) => {
    const area = areas.find((item) => item.code === code)
    setSelectedAreaCode(code)
    setSelectedCityCode("")
    setSelectedBarangayCode("")
    setProvince(area?.name || "")
    setCity("")
    setBarangay("")
    setCities([])
    setBarangays([])
  }

  const handleCityChange = (code: string) => {
    const option = cities.find((item) => item.code === code)
    setSelectedCityCode(code)
    setSelectedBarangayCode("")
    setCity(option?.name || "")
    setBarangay("")
    setBarangays([])
  }

  const handleBarangayChange = (code: string) => {
    const option = barangays.find((item) => item.code === code)
    setSelectedBarangayCode(code)
    setBarangay(option?.name || "")
  }

  const retryAutomaticLookup = () => {
    setError("")
    setManualMode(false)
    setLoadingAreas(true)
    setSelectedAreaCode("")
    setSelectedCityCode("")
    setSelectedBarangayCode("")
    setCities([])
    setBarangays([])

    listPhilippineAddressAreas()
      .then((items) => {
        setAreas(items)
        setError("")
      })
      .catch(() => {
        setError("Automatic address lookup is temporarily unavailable.")
        setManualMode(true)
      })
      .finally(() => setLoadingAreas(false))
  }

  const gridClassName =
    layout === "two-column"
      ? "grid grid-cols-1 gap-2 sm:grid-cols-2"
      : "grid grid-cols-1 gap-y-2"

  if (manualMode) {
    return (
      <div className={gridClassName}>
        <Input
          label="Province"
          name={fieldNames.province}
          value={province}
          onChange={(event) => setProvince(event.target.value)}
          autoComplete="address-level1"
          required
          data-testid={`${testIdPrefix}-province-input`}
        />
        <Input
          label="City / Municipality"
          name={fieldNames.city}
          value={city}
          onChange={(event) => setCity(event.target.value)}
          autoComplete="address-level2"
          required
          data-testid={`${testIdPrefix}-city-input`}
        />
        <Input
          label="Barangay"
          name={fieldNames.barangay}
          value={barangay}
          onChange={(event) => setBarangay(event.target.value)}
          autoComplete="address-line2"
          required
          data-testid={`${testIdPrefix}-barangay-input`}
        />

        {children}

        <div className="flex items-center justify-between gap-3 rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2 text-small-regular text-ui-fg-subtle sm:col-span-2">
          <span>{error} Enter the location manually.</span>
          <button
            type="button"
            onClick={retryAutomaticLookup}
            className="shrink-0 font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={gridClassName}>
      <input type="hidden" name={fieldNames.province} value={province} />
      <input type="hidden" name={fieldNames.city} value={city} />
      <input type="hidden" name={fieldNames.barangay} value={barangay} />

      <SelectField
        label="Province"
        value={selectedAreaCode}
        onChange={handleAreaChange}
        options={areas}
        loading={loadingAreas}
        existingValue={province}
        testId={`${testIdPrefix}-province-select`}
      />
      <SelectField
        label="City / Municipality"
        value={selectedCityCode}
        onChange={handleCityChange}
        options={cities}
        disabled={!selectedArea || selectedAreaCode === EXISTING_VALUE}
        loading={loadingCities}
        existingValue={city}
        testId={`${testIdPrefix}-city-select`}
      />
      <SelectField
        label="Barangay"
        value={selectedBarangayCode}
        onChange={handleBarangayChange}
        options={barangays}
        disabled={!selectedCityCode || selectedCityCode === EXISTING_VALUE}
        loading={loadingBarangays}
        existingValue={barangay}
        testId={`${testIdPrefix}-barangay-select`}
      />

      {children}

      {error && (
        <p
          className="text-small-regular text-ui-fg-subtle sm:col-span-2"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default PhilippineAddressFields
