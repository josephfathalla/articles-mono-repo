import { queryOptions } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { authClient } from "@/utils/auth/auth-client";

export const authQueries = {
  all: ["auth"],
  user: () =>
    queryOptions({
      queryKey: [...authQueries.all, "user"],
      queryFn: getUserSession,
    }),
};

const getUserSession = createIsomorphicFn()
  .server(async () => {
    const headers = getRequestHeaders();
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
  })
  .client(async () => {
    const userSession = await authClient.getSession();
    if (!userSession) {
      return null;
    }
    return {
      user: userSession.data?.user,
      session: userSession.data?.session,
    };
  });
