import { model } from "@medusajs/framework/utils"

const ResearchProtocolCommentEdit = model
  .define("research_protocol_comment_edit", {
    id: model.id().primaryKey(),
    comment_id: model.text(),
    edited_by_customer_id: model.text(),
    previous_body: model.text(),
    edited_at: model.dateTime(),
  })
  .indexes([{ on: ["comment_id", "edited_at"] }])

export default ResearchProtocolCommentEdit

