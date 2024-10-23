import * as AuthController from "@/controllers/auth.controller";
import { createRouter } from "@/lib/create-app";
import * as routes from "@/openapi/auth.api";

const router = createRouter()
  .openapi(routes.register, AuthController.registerUser);

export default router;
