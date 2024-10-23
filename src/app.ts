import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

// import createApp from "./lib/create-app";
import configureOpenAPI from "./lib/openapi";
import auth from "./routes/auth.route";
import users from "./routes/users.route";

export function createRouter() {
  return new OpenAPIHono({
    strict: false,
    defaultHook,
  });
}

const app = createRouter();

app.notFound(notFound);
app.onError(onError);

// const app = createApp();

configureOpenAPI(app);

const routes = [
  auth,
  users,
] as const;

routes.forEach((route) => {
  app.route("/api", route);
});

export default app;
