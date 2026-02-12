import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { orpc } from "@/utils/orpc";

type CategoryFormProps = {
  mode: "create" | "edit";
  initialValues?: {
    id?: string;
    name: string;
    type: "long" | "short";
  };
  onSuccess?: () => void;
  onCancel?: () => void;
};

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["long", "short"]),
});

export default function CategoryForm({
  mode,
  initialValues,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const createMutation = useMutation(orpc.category.create.mutationOptions());
  const updateMutation = useMutation(orpc.category.update.mutationOptions());

  const mutation = mode === "create" ? createMutation : updateMutation;

  const { Field, handleSubmit, Subscribe, state } = useForm({
    defaultValues: initialValues || {
      name: "",
      type: "long" as "long" | "short",
    },
    validators: {
      onSubmit: categoryFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (mode === "create") {
          await createMutation.mutateAsync({
            name: value.name,
            type: value.type,
          });
        } else {
          if (!initialValues?.id) {
            throw new Error("Category ID is required for update");
          }
          await updateMutation.mutateAsync({
            id: initialValues.id,
            name: value.name,
            type: value.type,
          });
        }
        notifications.show({
          title: "Success",
          message: `Category ${mode === "create" ? "created" : "updated"} successfully`,
          color: "green",
        });
        onSuccess?.();
      } catch (error) {
        notifications.show({
          title: "Error",
          message: (error as Error).message || `Failed to ${mode} category`,
          color: "red",
        });
      }
    },
  });

  return (
    <Stack gap="lg">
      <Title order={2}>
        {mode === "create" ? "Create New Category" : "Edit Category"}
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
            <Field name="name">
              {({ state: fieldState, handleChange, handleBlur }) => (
                <TextInput
                  error={
                    fieldState.meta.errors.length > 0
                      ? (fieldState.meta.errors[0] as { message?: string })
                          ?.message
                      : undefined
                  }
                  label="Name"
                  onBlur={handleBlur}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Enter category name"
                  value={fieldState.value}
                  withAsterisk
                />
              )}
            </Field>

            <Field name="type">
              {({ state: fieldState, handleChange, handleBlur }) => (
                <Select
                  data={[
                    { value: "long", label: "Long" },
                    { value: "short", label: "Short" },
                  ]}
                  error={
                    fieldState.meta.errors.length > 0
                      ? (fieldState.meta.errors[0] as { message?: string })
                          ?.message
                      : undefined
                  }
                  label="Type"
                  onBlur={handleBlur}
                  onChange={(value) => {
                    if (value === "long" || value === "short") {
                      handleChange(value);
                    }
                  }}
                  placeholder="Select category type"
                  value={fieldState.value}
                  withAsterisk
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
                    {mode === "create" ? "Create Category" : "Update Category"}
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
