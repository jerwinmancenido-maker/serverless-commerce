const TECHNICAL_PRODUCT_ERROR =
  /(variant|matrix) row|resolved\s+\d|must resolve|\b(?:prod|variant|item)_[a-z0-9]+\b|pattern\s+\//i

export const merchantProductErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  if (!(error instanceof Error)) {
    return fallback
  }

  const message = error.message.trim()

  if (!message || TECHNICAL_PRODUCT_ERROR.test(message)) {
    return fallback
  }

  return message
}
