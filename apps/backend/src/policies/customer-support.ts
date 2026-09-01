import { definePolicies, PolicyOperation } from "@medusajs/framework/utils"

export const customerSupportPolicies = definePolicies([
  {
    name: "ReadCustomerSupport",
    resource: "customer_support",
    operation: PolicyOperation.read,
    description: "View private customer support conversations",
  },
  {
    name: "ReplyCustomerSupport",
    resource: "customer_support_reply",
    operation: PolicyOperation.update,
    description: "Reply to private customer support conversations",
  },
  {
    name: "AddCustomerSupportNotes",
    resource: "customer_support_note",
    operation: PolicyOperation.create,
    description: "Add internal notes to customer support conversations",
  },
  {
    name: "UpdateCustomerSupport",
    resource: "customer_support_update",
    operation: PolicyOperation.update,
    description: "Update customer support conversation status",
  },
  {
    name: "AssignCustomerSupport",
    resource: "customer_support_assign",
    operation: PolicyOperation.update,
    description: "Assign conversations and change support priority",
  },
  {
    name: "ReadCustomerSupportSettings",
    resource: "customer_support_settings",
    operation: PolicyOperation.read,
    description: "View support settings and category configuration",
  },
  {
    name: "ManageCustomerSupportSettings",
    resource: "customer_support_settings",
    operation: PolicyOperation.update,
    description: "Manage support settings and category configuration",
  },
  {
    name: "ReadCustomerSupportSavedResponses",
    resource: "customer_support_saved_responses",
    operation: PolicyOperation.read,
    description: "Use active saved support responses",
  },
  {
    name: "ManageCustomerSupportSavedResponses",
    resource: "customer_support_saved_responses",
    operation: PolicyOperation.update,
    description: "Create, edit, reorder, deactivate, and remove saved responses",
  },
  {
    name: "ReadCustomerSupportAttachments",
    resource: "customer_support_attachment",
    operation: PolicyOperation.read,
    description: "Open private customer support attachments",
  },
  {
    name: "UploadCustomerSupportAttachments",
    resource: "customer_support_attachment",
    operation: PolicyOperation.create,
    description: "Upload private customer support attachments",
  },
  {
    name: "ReadCustomerSupportReporting",
    resource: "customer_support_reporting",
    operation: PolicyOperation.read,
    description: "View customer support operational reporting",
  },
])
