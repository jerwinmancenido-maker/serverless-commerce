/**
 * Customer Support AI Assistant & Smart Operations Layer.
 * Provides Gemini-powered smart replies, heuristic fallback, sentiment/urgency analysis,
 * and automated first-responder generation.
 */

type ConversationContext = {
  subject: string
  category: string
  customerName?: string
  messages: Array<{ sender_type: string; body: string }>
}

export type SmartReply = {
  id: string
  label: string
  text: string
}

export type SentimentAnalysis = {
  sentiment: "positive" | "neutral" | "frustrated" | "urgent"
  priorityScore: "low" | "normal" | "high" | "urgent"
  urgencyReasons: string[]
}

const URGENT_KEYWORDS = [
  "urgent",
  "damaged",
  "broken",
  "leak",
  "leaking",
  "missing",
  "wrong item",
  "refund",
  "cancel",
  "allergic",
  "reaction",
  "scam",
  "fraud",
  "unauthorized",
  "delay",
  "late",
]

const FRUSTRATED_KEYWORDS = [
  "bad",
  "terrible",
  "disappointed",
  "frustrated",
  "horrible",
  "worst",
  "angry",
  "complaint",
  "waiting too long",
]

const POSITIVE_KEYWORDS = [
  "thank",
  "thanks",
  "great",
  "awesome",
  "love",
  "appreciated",
  "helpful",
  "perfect",
  "excellent",
]

export function analyzeSentimentAndUrgency(text: string): SentimentAnalysis {
  const lower = text.toLowerCase()
  const matchedUrgent = URGENT_KEYWORDS.filter((kw) => lower.includes(kw))
  const matchedFrustrated = FRUSTRATED_KEYWORDS.filter((kw) => lower.includes(kw))
  const matchedPositive = POSITIVE_KEYWORDS.filter((kw) => lower.includes(kw))

  let sentiment: SentimentAnalysis["sentiment"] = "neutral"
  let priorityScore: SentimentAnalysis["priorityScore"] = "normal"

  if (matchedUrgent.length > 0) {
    sentiment = "urgent"
    priorityScore = matchedUrgent.some((kw) => ["allergic", "reaction", "leak", "scam"].includes(kw))
      ? "urgent"
      : "high"
  } else if (matchedFrustrated.length > 0) {
    sentiment = "frustrated"
    priorityScore = "high"
  } else if (matchedPositive.length > 0) {
    sentiment = "positive"
    priorityScore = "normal"
  }

  return {
    sentiment,
    priorityScore,
    urgencyReasons: [...matchedUrgent, ...matchedFrustrated],
  }
}

export async function generateSmartReplies(
  context: ConversationContext
): Promise<SmartReply[]> {
  const apiKey = process.env.GEMINI_API_KEY

  if (apiKey) {
    try {
      const prompt = `You are a helpful customer support agent for PepStack, a high-purity research peptide and compound commerce platform in the Philippines.
Subject: "${context.subject}"
Category: "${context.category}"
Customer Name: "${context.customerName || "Customer"}"
Recent message history:
${context.messages.slice(-4).map((m) => `${m.sender_type}: ${m.body}`).join("\n")}

Generate exactly 3 diverse, professional, concise response options in JSON format:
[
  { "id": "ack", "label": "Brief label (max 4 words)", "text": "Friendly acknowledgment message" },
  { "id": "solution", "label": "Brief label (max 4 words)", "text": "Specific actionable solution or guidance" },
  { "id": "followup", "label": "Brief label (max 4 words)", "text": "Follow-up or alternative recommendation" }
]
`
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      )

      if (res.ok) {
        const json = await res.json()
        const textResponse = json.candidates?.[0]?.content?.parts?.[0]?.text
        if (textResponse) {
          const parsed = JSON.parse(textResponse)
          if (Array.isArray(parsed) && parsed.length >= 2) {
            return parsed.slice(0, 3)
          }
        }
      }
    } catch {
      // Fallback to intelligent heuristics below
    }
  }

  // Intelligent Contextual Heuristics Fallback
  const name = context.customerName ? ` ${context.customerName}` : ""
  const category = context.category.toLowerCase()
  const latestCustomerMsg =
    [...context.messages].reverse().find((m) => m.sender_type === "customer")?.body || ""
  const analysis = analyzeSentimentAndUrgency(latestCustomerMsg)

  if (analysis.sentiment === "urgent" || analysis.sentiment === "frustrated") {
    return [
      {
        id: "urgent-apology",
        label: "Priority Care & Investigation",
        text: `Hi${name}, thank you for reaching out and bringing this to our attention. I understand how important this is and I'm actively reviewing your case with our fulfillment team right now. We will resolve this for you immediately.`,
      },
      {
        id: "replacement-offer",
        label: "Direct Replacement / Settlement",
        text: `Hi${name}, I sincerely apologize for the inconvenience. We stand behind our research standards 100%. I can arrange an immediate priority dispatch or issue a full refund to your original payment method. Which would you prefer?`,
      },
      {
        id: "request-details",
        label: "Request Photo / Batch ID",
        text: `Hi${name}, to ensure our quality assurance team investigates the exact lot, could you please share a quick photo of the vial or packaging using the attachment button below? We'll prioritize this right away.`,
      },
    ]
  }

  if (category.includes("shipping") || category.includes("order")) {
    return [
      {
        id: "shipping-update",
        label: "Tracking & Dispatch Status",
        text: `Hi${name}, thank you for checking in. Your order is being handled under secure protective packaging and is on track for delivery. You will receive an SMS and email notification with live tracking as soon as our courier scans it.`,
      },
      {
        id: "shipping-speed",
        label: "Express Shipping ETA",
        text: `Hi${name}, for Metro Manila orders, typical delivery is 1–2 business days. For provincial orders, it takes 3–5 business days. Please let us know if you have specific delivery instructions for the rider.`,
      },
      {
        id: "order-inquiry",
        label: "Order Verification",
        text: `Hi${name}, I've located your order details in our system. Everything is confirmed and packaged. Is there anything specific you would like adjusted before dispatch?`,
      },
    ]
  }

  if (category.includes("protocol") || category.includes("product")) {
    return [
      {
        id: "protocol-guidance",
        label: "Protocol Access Details",
        text: `Hi${name}, thank you for your inquiry. You can access full dosage, reconstitution guidelines, and scientific references in our Research Hub under your account. Let me know if you need specific guidance for your research sequence!`,
      },
      {
        id: "compound-recommendation",
        label: "Reconstitution Recommendation",
        text: `Hi${name}, for optimal reconstitution, we recommend using Bacteriostatic Water (0.9% Benzyl Alcohol) and storing reconstituted solutions between 2°C–8°C away from direct light.`,
      },
      {
        id: "protocol-library",
        label: "Link to Research Library",
        text: `Hi${name}, feel free to explore our step-by-step Research Protocol guides for comprehensive timelines, tracking sheets, and measurement calculators.`,
      },
    ]
  }

  return [
    {
      id: "general-greeting",
      label: "Helpful Greeting",
      text: `Hi${name}, thank you for contacting PepStack Support! How can I assist you with your research order or compounds today?`,
    },
    {
      id: "general-checking",
      label: "Reviewing Account",
      text: `Hi${name}, thank you for reaching out. I'm reviewing your account details now to assist you as quickly as possible.`,
    },
    {
      id: "general-closing",
      label: "Resolution Check",
      text: `Hi${name}, please let me know if everything is working smoothly or if you have any further questions for our team!`,
    },
  ]
}

export function generateFirstResponderMessage(category: string): string {
  if (category.includes("order") || category.includes("payment")) {
    return "Thank you for reaching out to PepStack Support! Our team has received your message regarding your order. A support specialist will respond shortly during active hours (8:00 AM – 8:00 PM PHT)."
  }
  return "Thank you for contacting PepStack Support! Your message has been routed to our research and customer care team. We will review your inquiry and reply as soon as possible."
}
