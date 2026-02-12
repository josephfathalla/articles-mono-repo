import { Container } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import ArticleForm from "@/components/article/ArticleForm";

export const Route = createFileRoute("/_app/article/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <Container py="xl" size="sm">
      <ArticleForm
        mode="create"
        onCancel={() => navigate({ to: "/articles" })}
        onSuccess={(articleId) => {
          if (articleId) {
            navigate({ to: "/article/$articleId", params: { articleId } });
          } else {
            navigate({ to: "/articles" });
          }
        }}
      />
    </Container>
  );
}
