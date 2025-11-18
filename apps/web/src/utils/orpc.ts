// import type { AppRouterClient } from "@my-better-t-app/api/routers/index";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { contract } from "@my-better-t-app/contracts";
import type { ContractRouterClient } from "@orpc/contract";
import { OpenAPILink } from '@orpc/openapi-client/fetch'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

// export const link = new RPCLink({
//   url: `${import.meta.env.VITE_SERVER_URL}/rpc`,
//   fetch(url, options) {
//     return fetch(url, {
//       ...options,
//       credentials: "include",
//     });
//   },
// });

export const link = new OpenAPILink(contract,{
  url:"http://localhost:4000",
})

export const client: ContractRouterClient<typeof contract> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
