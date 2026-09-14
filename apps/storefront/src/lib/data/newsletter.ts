import { sdk } from "@lib/config"

export type NewsletterSubscriptionResponse = {
  success: boolean
  message: string
  discountCode?: string
}

export async function subscribeToNewsletter(
  email: string,
  source: string = "footer_lead_widget"
): Promise<NewsletterSubscriptionResponse> {
  try {
    const response = await sdk.client.fetch<NewsletterSubscriptionResponse>(
      "/store/newsletter",
      {
        method: "POST",
        body: { email, source },
      }
    )
    return response
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { data?: { message?: string } } } | undefined
    const message =
      err?.message ||
      err?.response?.data?.message ||
      "Unable to complete subscription. Please verify your email."
    return {
      success: false,
      message,
    }
  }
}
