import { Container } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import ArticleForm from "@/components/article/ArticleForm";
import { useAuthentication } from "@/utils/auth/hooks";

export const Route = createFileRoute("/_app/article/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthentication();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({
        to: "/login", // or "/_auth/login", depending on your routing
        search: { redirect: "/article/add" }, // optional: for post-login redirect
      });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    // You can show a simple message or loader while redirecting
    return null;
  }

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
