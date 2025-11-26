import { queryOptions } from "@tanstack/react-query";
import { authClient } from "@/utils/auth/auth-client";

export const authQueries = {
  all: ["auth"],
  user: () =>
    queryOptions({
      queryKey: [...authQueries.all, "user"],
      queryFn: async () => {
        const userSession = await authClient.getSession();
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
