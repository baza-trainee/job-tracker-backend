import * as UserController from "@/controllers/user.controller";
import { createRouter } from "@/lib/create-app";
import * as routes from "@/openapi/users.api";

const router = createRouter()
  .openapi(routes.getAll, UserController.getAll)
  .openapi(routes.getOne, UserController.getOne)
  .openapi(routes.updateUser, UserController.updateUser)
  .openapi(routes.removeUser, UserController.removeUser);

export default router;
