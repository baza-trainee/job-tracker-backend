import configureOpenAPI from "@/lib/openapi";

import createApp from "./lib/create-app";
import auth from "./routes/auth.route";
import users from "./routes/users.route";

const app = createApp();

configureOpenAPI(app);

const routes = [
  auth,
  users,
] as const;

routes.forEach((route) => {
  app.route("/api", route);
});

export default app;
