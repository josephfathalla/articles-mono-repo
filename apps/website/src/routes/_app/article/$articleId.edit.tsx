import { Container, LoadingOverlay } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import ArticleForm from "@/components/article/ArticleForm";
import { useAuthentication } from "@/utils/auth/hooks";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/article/$articleId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { articleId } = Route.useParams();
  const { userSession, isAuthenticated } = useAuthentication();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  const { data: article, isLoading } = useQuery(
    orpc.article.getById.queryOptions({
      input: { articleId },
    })
  );
  //  not loggedin return null
  if (!isAuthenticated) {
    return null;
  }
  // loading the article details
  if (isLoading) {
    return (
      <Container py="xl" size="sm">
        <LoadingOverlay visible />
      </Container>
    );
  }
  // if there is not article
  if (!article) {
    return (
      <Container py="xl" size="sm">
        <div>Article not found</div>
      </Container>
    );
  }
  //check for the owner

  const isOwner = isAuthenticated && userSession?.user?.id === article.userId;

  if (!isOwner) {
    navigate({ to: "/article/$articleId", params: { articleId } });
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
