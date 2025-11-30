import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/my-articles/add")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_app/my-articles/add"!</div>;
}
