import { queryOptions } from "@tanstack/react-query";
import { authClient } from "@/utils/auth/auth-client";

export const authQueries = {
  all: ["auth"],
  user: () =>
    queryOptions({
      queryKey: [...authQueries.all, "user"],
      queryFn: async () => {
        let headers: HeadersInit | undefined;

        if (typeof window === "undefined") {
          const { getRequestHeaders } = await import(
            "@tanstack/react-start/server"
          );
          headers = getRequestHeaders();
        }

        const userSession = await authClient.getSession({
          fetchOptions: {
            headers,
          },
        });

        if (!userSession) {
          return null;
        }
        return {
          user: userSession.data?.user,
          session: userSession.data?.session,
        };
      },
    }),
};
