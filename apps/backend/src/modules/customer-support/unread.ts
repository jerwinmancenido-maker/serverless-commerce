import type CustomerSupportModuleService from "./service"

export async function supportUnreadCount(
  service: CustomerSupportModuleService,
  conversationId: string,
  participantType: "customer" | "staff",
  participantId: string,
) {
  const [participant] = await service.listSupportParticipants(
    {
      conversation_id: conversationId,
      participant_type: participantType,
      participant_id: participantId,
    },
    { take: 1 },
  )
  const messages = await service.listSupportMessages(
    { conversation_id: conversationId },
    { order: { sent_at: "DESC" }, take: 250 },
  )
  const readAt = participant?.last_read_at
    ? new Date(participant.last_read_at).getTime()
    : 0

  return messages.filter((message) => {
    const isUnreadSender = participantType === "customer"
      ? message.sender_type === "staff" || message.sender_type === "system"
      : message.sender_type === "customer"

    return isUnreadSender && new Date(message.sent_at).getTime() > readAt
  }).length
}
