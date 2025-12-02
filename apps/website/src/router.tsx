import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { theme } from "./components/theme";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { queryClient } from "./utils/orpc";

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: { queryClient },
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <Notifications />
          {children}
        </MantineProvider>
      </QueryClientProvider>
    ),
  });

  return router;
};
