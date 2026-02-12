import { Container, LoadingOverlay } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import ArticleForm from "@/components/article/ArticleForm";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/article/$articleId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { articleId } = Route.useParams();

  const { data: article, isLoading } = useQuery(
    orpc.article.getById.queryOptions({
      input: { articleId },
    })
  );

  if (isLoading) {
    return (
      <Container py="xl" size="sm">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (!article) {
    return (
      <Container py="xl" size="sm">
        <div>Article not found</div>
      </Container>
    );
  }

  return (
    <Container py="xl" size="sm">
      <ArticleForm
        initialValues={{
          id: article.id,
          title: article.title,
          description: article.description,
          isPublished: article.isPublished,
          categoryIds: article.categories?.map((c) => c.id) ?? [],
        }}
        mode="edit"
        onCancel={() =>
          navigate({ to: "/article/$articleId", params: { articleId } })
        }
        onSuccess={() =>
          navigate({ to: "/article/$articleId", params: { articleId } })
        }
      />
    </Container>
  );
}
