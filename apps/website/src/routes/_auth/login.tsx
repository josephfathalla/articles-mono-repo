import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.authState?.user) {
      throw redirect({ to: "/", replace: true });
    }

    return {};
  },
});

function RouteComponent() {
  return <div>Hello "/login"!</div>;
}
