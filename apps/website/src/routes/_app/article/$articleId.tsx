import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useAuthentication } from "@/utils/auth/hooks";
import { orpc, queryClient } from "@/utils/orpc";
import { SignedIn } from "@/components/auth/signed-in";

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

  const commentListQuery = useQuery(
    orpc.comment.listByArticle.queryOptions({
      input: { articleId },
    })
  );
  const comments = (commentListQuery.data ?? []) as Array<{
    id: string;
    content: string;
    userId: string;
    createdAt: Date;
    user?: { id: string; name?: string; email?: string };
  }>;
  const commentsLoading = commentListQuery.isLoading;

  const commentListQueryKey = orpc.comment.listByArticle.queryKey({
    input: { articleId },
  });

  const createCommentMutation = useMutation(
    orpc.comment.create.mutationOptions({
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Comment added",
          color: "green",
        });
        queryClient.invalidateQueries({ queryKey: commentListQueryKey });
      },
      onError: (error: Error) => {
        notifications.show({
          title: "Error",
          message: error.message || "Failed to add comment",
          color: "red",
        });
      },
    })
  );

  const updateCommentMutation = useMutation(
    orpc.comment.update.mutationOptions({
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Comment updated",
          color: "green",
        });
        queryClient.invalidateQueries({ queryKey: commentListQueryKey });
      },
      onError: (error: Error) => {
        notifications.show({
          title: "Error",
          message: error.message || "Failed to update comment",
          color: "red",
        });
      },
    })
  );

  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );

  const deleteCommentMutation = useMutation(
    orpc.comment.delete.mutationOptions({
      onSuccess: () => {
        setDeletingCommentId(null);
        notifications.show({
          title: "Success",
          message: "Comment deleted",
          color: "green",
        });
        queryClient.invalidateQueries({ queryKey: commentListQueryKey });
      },
      onError: (error: Error) => {
        setDeletingCommentId(null);
        notifications.show({
          title: "Error",
          message: error.message || "Failed to delete comment",
          color: "red",
        });
      },
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
      onError: (error: Error) => {
        notifications.show({
          title: "Error",
          message: (error as Error).message || "Failed to delete article",
          color: "red",
        });
      },
    })
  );

  const [newCommentContent, setNewCommentContent] = useState("");
  const editCommentContentRef = useRef<HTMLTextAreaElement | null>(null);

  const handleDelete = () => {
    modals.openConfirmModal({
      title: "Delete Article",
      children:
        "Are you sure you want to delete this article? This action cannot be undone.",
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        (
          deleteMutation.mutate as unknown as (input: { id: string }) => void
        )({ id: articleId });
      },
    });
  };

  const handleAddComment = () => {
    const content = newCommentContent.trim();
    if (!content) {
      return;
    }
    (
      createCommentMutation.mutate as unknown as (
        input: { articleId: string; content: string },
        options?: { onSuccess?: () => void }
      ) => void
    )(
      { articleId, content },
      {
        onSuccess: () => setNewCommentContent(""),
      }
    );
  };

  const openEditCommentModal = (id: string, currentContent: string) => {
    modals.open({
      title: "Edit comment",
      children: (
        <Stack>
          <Textarea
            ref={(el) => {
              editCommentContentRef.current = el;
            }}
            defaultValue={currentContent}
            minRows={3}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => modals.closeAll()}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const content =
                  editCommentContentRef.current?.value?.trim() ?? "";
                if (content) {
                  (
                    updateCommentMutation.mutate as unknown as (input: {
                      id: string;
                      content: string;
                    }) => void
                  )({ id, content });
                  modals.closeAll();
                }
              }}
            >
              Save
            </Button>
          </Group>
        </Stack>
      ),
    });
  };

  const openDeleteCommentConfirm = (id: string) => {
    setDeletingCommentId(id);
    modals.openConfirmModal({
      title: "Delete comment",
      children: "Are you sure you want to delete this comment?",
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        (
          deleteCommentMutation.mutate as unknown as (input: { id: string }) => void
        )({ id });
      },
      onCancel: () => setDeletingCommentId(null),
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

  type ArticleDetail = {
    title: string;
    description: string;
    userId: string;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    categories?: Array<{ id: string; name: string }>;
    user?: { name?: string; email?: string };
  };
  const a = article as ArticleDetail;

  const isOwner = isAuthenticated && userSession?.user?.id === a.userId;

  return (
    <Container py="xl" size="md">
      <Card padding="lg" radius="md" shadow="sm" withBorder>
        <Stack gap="md">
          <Group align="flex-start" justify="space-between">
            <Title order={1}>{a.title}</Title>
            <Badge color={a.isPublished ? "green" : "gray"} size="lg">
              {a.isPublished ? "Published" : "Draft"}
            </Badge>
          </Group>

          <Text size="md">{a.description}</Text>

          {a.categories && a.categories.length > 0 && (
            <Group gap="xs">
              <Text fw={500} size="sm">
                Categories:
              </Text>
              {a.categories.map((category: { id: string; name: string }) => (
                <Badge key={category.id} variant="outline">
                  {category.name}
                </Badge>
              ))}
            </Group>
          )}

          <Group gap="xl">
            <Text c="dimmed" size="sm">
              Created: {new Date(a.createdAt).toLocaleDateString()}
            </Text>
            <Text c="dimmed" size="sm">
              Updated: {new Date(a.updatedAt).toLocaleDateString()}
            </Text>
          </Group>

          {isAuthenticated && a.user && (
            <Group gap="xs">
              <Text fw={500} size="sm">
                Created by:
              </Text>
              <Text size="sm">{a.user?.name ?? a.user?.email ?? "Unknown"}</Text>
            </Group>
          )}

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

      <Card padding="lg" radius="md" shadow="sm" withBorder mt="xl">
        <Stack gap="md">
          <Title order={2}>Comments</Title>
          {commentsLoading ? (
            <LoadingOverlay visible />
          ) : (
            <>
              <SignedIn>
                <Stack gap="xs">
                  <Textarea
                    placeholder="Add a comment..."
                    minRows={3}
                    value={newCommentContent}
                    onChange={(e) =>
                      setNewCommentContent(e.currentTarget.value)
                    }
                  />
                  <Button
                    onClick={handleAddComment}
                    loading={createCommentMutation.isPending}
                    disabled={!newCommentContent.trim()}
                  >
                    Add comment
                  </Button>
                </Stack>
              </SignedIn>
              <Stack gap="md" mt="md">
                {comments.length === 0 ? (
                  <Text c="dimmed" size="sm">
                    No comments yet.
                  </Text>
                ) : (
                  comments.map((comment) => {
                    const isCommentOwner =
                      isAuthenticated &&
                      userSession?.user?.id === comment.userId;
                    const authorName =
                      comment.user?.name ??
                      comment.user?.email ??
                      "Unknown";
                    return (
                      <Card
                        key={comment.id}
                        padding="sm"
                        radius="md"
                        withBorder
                        variant="light"
                      >
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text fw={500} size="sm">
                              {authorName}
                            </Text>
                            <Text c="dimmed" size="xs">
                              {new Date(
                                comment.createdAt
                              ).toLocaleDateString()}
                            </Text>
                          </Group>
                          <Text size="sm">{comment.content}</Text>
                          {isCommentOwner && (
                            <Group gap="xs">
                              <Button
                                size="xs"
                                variant="light"
                                onClick={() =>
                                  openEditCommentModal(
                                    comment.id,
                                    comment.content
                                  )
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                size="xs"
                                variant="light"
                                color="red"
                                loading={
                                  deleteCommentMutation.isPending &&
                                  deletingCommentId === comment.id
                                }
                                onClick={() =>
                                  openDeleteCommentConfirm(comment.id)
                                }
                              >
                                Delete
                              </Button>
                            </Group>
                          )}
                        </Stack>
                      </Card>
                    );
                  })
                )}
              </Stack>
            </>
          )}
        </Stack>
      </Card>
    </Container>
  );
}
