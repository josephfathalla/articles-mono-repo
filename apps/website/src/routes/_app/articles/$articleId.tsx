import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/articles/$articleId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { articleId } = Route.useParams();
  return <div>Hello "/articles/$articleId" {articleId}!</div>;
}
