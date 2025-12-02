import {
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Stack,
  Switch,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/my-articles/add")({
  component: RouteComponent,
});

const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  isPublished: z.boolean().default(false),
});

function RouteComponent() {
  const navigate = useNavigate();
  const mutation = useMutation(orpc.article.create.mutationOptions());

  const { Field, handleSubmit, Subscribe, state } = useForm({
    defaultValues: {
      title: "",
      description: "",
      isPublished: false,
    },
    validators: {
      onSubmit: articleFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
        notifications.show({
          title: "Success",
          message: "Article created successfully",
          color: "green",
        });
        await navigate({ to: "/my-articles" });
      } catch (error) {
        notifications.show({
          title: "Error",
          message: (error as Error).message || "Failed to create article",
          color: "red",
        });
      }
    },
  });

  return (
    <Container py="xl" size="sm">
      <Stack gap="lg">
        <Title order={2}>Create New Article</Title>

        <Box pos="relative">
          <LoadingOverlay
            overlayProps={{ radius: "sm", blur: 2 }}
            visible={mutation.isPending || state.isSubmitting}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit();
            }}
          >
            <Stack gap="md">
              <Field name="title">
                {({ state: fieldState, handleChange, handleBlur }) => (
                  <TextInput
                    error={
                      fieldState.meta.errors.length > 0
                        ? fieldState.meta.errors[0]?.message
                        : undefined
                    }
                    label="Title"
                    onBlur={handleBlur}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Enter article title"
                    value={fieldState.value}
                    withAsterisk
                  />
                )}
              </Field>

              <Field name="description">
                {({ state: fieldState, handleChange, handleBlur }) => (
                  <Textarea
                    error={
                      fieldState.meta.errors.length > 0
                        ? fieldState.meta.errors[0]?.message
                        : undefined
                    }
                    label="Description"
                    minRows={4}
                    onBlur={handleBlur}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Enter article description"
                    value={fieldState.value}
                    withAsterisk
                  />
                )}
              </Field>

              <Field name="isPublished">
                {({ state: fieldState, handleChange, handleBlur }) => (
                  <Switch
                    checked={fieldState.value}
                    error={
                      fieldState.meta.errors.length > 0
                        ? fieldState.meta.errors[0]?.message
                        : undefined
                    }
                    label="Publish Article"
                    onBlur={handleBlur}
                    onChange={(e) => handleChange(e.currentTarget.checked)}
                  />
                )}
              </Field>

              <Group justify="flex-end" mt="md">
                <Button
                  disabled={mutation.isPending || state.isSubmitting}
                  onClick={() => navigate({ to: "/my-articles" })}
                  type="button"
                  variant="subtle"
                >
                  Cancel
                </Button>
                <Subscribe
                  selector={(formState) => [
                    formState.canSubmit,
                    formState.isSubmitting,
                  ]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      disabled={!canSubmit}
                      loading={isSubmitting || mutation.isPending}
                      type="submit"
                    >
                      Create Article
                    </Button>
                  )}
                </Subscribe>
              </Group>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
}
