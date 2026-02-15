import { Container } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import CategoryForm from "@/components/category/CategoryForm";

export const Route = createFileRoute("/_app/categories/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <Container py="xl" size="sm">
      <CategoryForm
        mode="create"
        onCancel={() => navigate({ to: "/categories" })}
        onSuccess={() => navigate({ to: "/categories" })}
      />
    </Container>
  );
}
