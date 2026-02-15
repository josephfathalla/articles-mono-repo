import { Container, LoadingOverlay } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import CategoryForm from "@/components/category/CategoryForm";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/categories/$categoryId")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { categoryId } = Route.useParams();

  const { data: category, isLoading } = useQuery(
    orpc.category.getById.queryOptions({
      input: { categoryId },
    })
  );

  if (isLoading) {
    return (
      <Container py="xl" size="sm">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (!category) {
    return (
      <Container py="xl" size="sm">
        <div>Category not found</div>
      </Container>
    );
  }

  return (
    <Container py="xl" size="sm">
      <CategoryForm
        initialValues={{
          id: category.id,
          name: category.name,
          type: category.type,
        }}
        mode="edit"
        onCancel={() => navigate({ to: "/categories" })}
        onSuccess={() => navigate({ to: "/categories" })}
      />
    </Container>
  );
}
