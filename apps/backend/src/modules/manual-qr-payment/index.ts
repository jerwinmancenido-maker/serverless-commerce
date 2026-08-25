import { ModuleProvider, Modules } from "@medusajs/framework/utils"

import ManualQrPaymentProviderService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [ManualQrPaymentProviderService],
})
