/**
 * @file apps/storefront/src/lib/util/money.ts
 * @module Util (Currency & Financial Telemetry)
 * @purpose Formats clinical currency amounts with thousands separators and guaranteed two decimal places.
 * @contracts Section 3 Clinical Usability Standard | Currency: PHP / en-PH
 */

import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
  locale,
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }

  const normalizedCurrency = currency_code.toUpperCase()
  const resolvedLocale =
    locale || (normalizedCurrency === "PHP" ? "en-PH" : "en-US")

  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency: normalizedCurrency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

