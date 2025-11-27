import type { auth } from "@my-better-t-app/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // baseURL: "https://backend.boilerplate.determinds.com",
  baseURL: import.meta.env.VITE_SERVER_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});
