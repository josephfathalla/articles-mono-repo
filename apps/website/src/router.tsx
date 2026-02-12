import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals"; // Add this import
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { theme } from "./components/theme";
import { routeTree } from "./routeTree.gen";
import { queryClient } from "./utils/orpc";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: { queryClient },
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <Notifications />
            {children}
          </ModalsProvider>
        </MantineProvider>
      </QueryClientProvider>
    ),
  });

  return router;
};
