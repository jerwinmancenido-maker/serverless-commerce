import { defineMiddlewares } from "@medusajs/framework/http"

import { adminBomMiddlewares } from "./admin/bom/middlewares"

export default defineMiddlewares({
  routes: [...adminBomMiddlewares],
})
