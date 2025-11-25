import { contract } from "@my-better-t-app/contracts";
import { createORPCClient } from "@orpc/client";
// import { createContext } from "@tanstackstart/api/context";
// import { appRouter } from "@tanstackstart/api/routers/index";
import type { ContractRouterClient } from "@orpc/contract";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
// import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // onError: (error) => {
    // 	toast.error(`Error: ${error.message}`, {
    // 		action: {
    // 			label: "retry",
    // 			onClick: () => {
    // 				queryClient.invalidateQueries();
    // 			},
    // 		},
    // 	});
    // },
  }),
});

const getORPCClient = createIsomorphicFn()
  .server((): ContractRouterClient<typeof contract> => {
    console.log("Server request");
    const link = new OpenAPILink(contract, {
      url: "http://localhost:4000",
      fetch: (url, options) => {
        // TODO: Add headers from the server request here to support SSR with auth
        const headers = getRequestHeaders();
        return fetch(url, {
          ...options,
          headers,
        });
      },
    });

    return createORPCClient(link);
  })
  .client((): ContractRouterClient<typeof contract> => {
    console.log("Client request");
    const link = new OpenAPILink(contract, {
      //   url: `${import.meta.env.VITE_SERVER_URL}/rpc`,
      url: "http://localhost:4000",
      fetch(_url, options) {
        return fetch(_url, {
          ...options,
          credentials: "include",
        });
      },
    });

    return createORPCClient(link);
  });

export const client: ContractRouterClient<typeof contract> = getORPCClient();

export const orpc = createTanstackQueryUtils(client);
