import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/articles/")({
  component: RouteComponent,
});

function RouteComponent() {
  const articles = useQuery(
    orpc.article.list.queryOptions({
      input: {
        page: "1",
        limit: "10",
        select: "all",
        sort: { field: "title", criteria: "asc" },
        filter: [{ path: "title", operator: "contains", value: "awd" }],
        populate: [{ path: "user", select: "name" }],
      },
    })
  );

  return (
    <div>
      Hello "/articles/ "
      {articles.data?.data.map((article) => (
        <div key={article.id}>
          {article.title} - {article.description} - {article.user?.name}
          {JSON.stringify(article)}
        </div>
      ))}
    </div>
  );
}
