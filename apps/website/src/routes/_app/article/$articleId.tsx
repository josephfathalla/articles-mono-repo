import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthentication } from "@/utils/auth/hooks";
import { orpc, queryClient } from "@/utils/orpc";

export const Route = createFileRoute("/_app/article/$articleId")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { articleId } = Route.useParams();
  const { userSession, isAuthenticated } = useAuthentication();

  const { data: article, isLoading } = useQuery(
    orpc.article.getById.queryOptions({
      input: { articleId },
    })
  );

  const deleteMutation = useMutation(
    orpc.article.delete.mutationOptions({
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Article deleted successfully",
          color: "green",
        });
        queryClient.invalidateQueries({
          queryKey: orpc.article.listMy.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.article.list.queryKey(),
        });
        navigate({ to: "/my-articles" });
      },
      onError: (error) => {
        notifications.show({
          title: "Error",
          message: (error as Error).message || "Failed to delete article",
          color: "red",
        });
      },
    })
  );

  const handleDelete = () => {
    modals.openConfirmModal({
      title: "Delete Article",
      children: `Are you sure you want to delete "${article?.title}"? This action cannot be undone.`,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteMutation.mutate({ id: articleId });
      },
    });
  };

  if (isLoading) {
    return (
      <Container py="xl" size="md">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (!article) {
    return (
      <Container py="xl" size="md">
        <Text>Article not found</Text>
      </Container>
    );
  }

  const isOwner = isAuthenticated && userSession?.user?.id === article.userId;

  return (
    <Container py="xl" size="md">
      <Card padding="lg" radius="md" shadow="sm" withBorder>
        <Stack gap="md">
          <Group align="flex-start" justify="space-between">
            <Title order={1}>{article.title}</Title>
            <Badge color={article.isPublished ? "green" : "gray"} size="lg">
              {article.isPublished ? "Published" : "Draft"}
            </Badge>
          </Group>

          <Text size="md">{article.description}</Text>

          {article.categories && article.categories.length > 0 && (
            <Group gap="xs">
              <Text fw={500} size="sm">
                Categories:
              </Text>
              {article.categories.map((category) => (
                <Badge key={category.id} variant="outline">
                  {category.name}
                </Badge>
              ))}
            </Group>
          )}

          <Group gap="xl">
            <Text c="dimmed" size="sm">
              Created: {new Date(article.createdAt).toLocaleDateString()}
            </Text>
            <Text c="dimmed" size="sm">
              Updated: {new Date(article.updatedAt).toLocaleDateString()}
            </Text>
          </Group>

          {isOwner && (
            <Group mt="md">
              <Button
                onClick={() =>
                  navigate({
                    to: "/article/$articleId/edit",
                    params: { articleId },
                  })
                }
              >
                Edit
              </Button>
              <Button
                color="red"
                loading={deleteMutation.isPending}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Group>
          )}
        </Stack>
      </Card>
    </Container>
  );
}
