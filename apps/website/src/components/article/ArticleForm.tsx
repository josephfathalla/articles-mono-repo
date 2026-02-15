import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  MultiSelect,
  Stack,
  Switch,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { orpc } from "@/utils/orpc";

type ArticleFormProps = {
  mode: "create" | "edit";
  initialValues?: {
    id?: string;
    title: string;
    description: string;
    isPublished: boolean;
    categoryIds: string[];
  };
  onSuccess?: (articleId?: string) => void;
  onCancel?: () => void;
};

const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

export default function ArticleForm({
  mode,
  initialValues,
  onSuccess,
  onCancel,
}: ArticleFormProps) {
  const createMutation = useMutation(orpc.article.create.mutationOptions());
  const updateMutation = useMutation(orpc.article.update.mutationOptions());

  const categoriesQuery = useQuery(
    orpc.category.list.queryOptions({
      input: {
        page: "1",
        limit: "1000",
        select: "all",
        sort: { field: "name", criteria: "asc" },
      },
    })
  );

  const categoryOptions =
    categoriesQuery.data?.data.map((cat) => ({
      value: cat.id,
      label: cat.name ?? "",
    })) ?? [];

  const mutation = mode === "create" ? createMutation : updateMutation;

  const { Field, handleSubmit, Subscribe, state } = useForm({
    defaultValues: initialValues ?? {
      title: "",
      description: "",
      isPublished: false,
      categoryIds: [] as string[],
    },
    validators: {
      onSubmit: articleFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        let articleId: string | undefined;
        if (mode === "create") {
          const result = await createMutation.mutateAsync({
            title: value.title,
            description: value.description,
            isPublished: value.isPublished,
            categoryIds: value.categoryIds ?? [],
          });
          articleId = result.id;
        } else {
          if (!initialValues?.id) {
            throw new Error("Article ID is required for update");
          }
          await updateMutation.mutateAsync({
            id: initialValues.id,
            title: value.title,
            description: value.description,
            isPublished: value.isPublished,
            categoryIds: value.categoryIds ?? [],
          });
          articleId = initialValues.id;
        }
        notifications.show({
          title: "Success",
          message: `Article ${mode === "create" ? "created" : "updated"} successfully`,
          color: "green",
        });
        onSuccess?.(articleId);
      } catch (error) {
        notifications.show({
          title: "Error",
          message: (error as Error).message ?? `Failed to ${mode} article`,
          color: "red",
        });
      }
    },
  });

  return (
    <Stack gap="lg">
      <Title order={2}>
        {mode === "create" ? "Create New Article" : "Edit Article"}
      </Title>

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
                      ? (fieldState.meta.errors[0] as { message?: string })
                          ?.message
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
                      ? (fieldState.meta.errors[0] as { message?: string })
                          ?.message
                      : undefined
                  }
                  label="Description"
                  onBlur={handleBlur}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Enter article description"
                  value={fieldState.value}
                  withAsterisk
                />
              )}
            </Field>

            <Field name="isPublished">
              {({ state: fieldState, handleChange }) => (
                <Switch
                  checked={fieldState.value}
                  label="Published"
                  onChange={(e) => handleChange(e.currentTarget.checked)}
                />
              )}
            </Field>

            <Field name="categoryIds">
              {({ state: fieldState, handleChange }) => (
                <MultiSelect
                  data={categoryOptions}
                  label="Categories"
                  onChange={handleChange}
                  placeholder="Select categories"
                  searchable
                  value={fieldState.value ?? []}
                />
              )}
            </Field>

            <Group justify="flex-end" mt="md">
              <Button
                disabled={mutation.isPending || state.isSubmitting}
                onClick={onCancel}
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
                    {mode === "create" ? "Create Article" : "Update Article"}
                  </Button>
                )}
              </Subscribe>
            </Group>
          </Stack>
        </form>
      </Box>
    </Stack>
  );
}
