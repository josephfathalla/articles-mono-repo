import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useForm } from "@tanstack/react-form";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { z } from "zod";
import { authClient } from "@/utils/auth/auth-client";
import classes from "./login.module.css";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.authState?.user) {
      throw redirect({ to: "/", replace: true });
    }

    return {};
  },
});

const loginFormSchema = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z
    .string()
    .min(2, { message: "Password must be at least 2 character" }),
});

function RouteComponent() {
  const navigate = useNavigate();
  const { Field, handleSubmit, Subscribe } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginFormSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: async () => {
            notifications.show({
              color: "green",
              message: "Success",
              title: "Success",
            });
            await navigate({ to: "/" });
          },
          onError: (error) => {
            notifications.show({
              color: "red",
              message: error.error.message || error.error.statusText,
              title: "Error",
            });
          },
        }
      );
    },
  });

  return (
    <Container my={40} size={420}>
      <Title className={classes.title} ta="center">
        Welcome back!
      </Title>

      <Text className={classes.subtitle}>
        Do not have an account yet?{" "}
        <Anchor component={Link} to="/signup">
          Create account
        </Anchor>
      </Text>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
      >
        <Paper mt={30} p={22} radius="md" shadow="sm" withBorder>
          <Field name="email">
            {({ state: fieldState, handleChange, handleBlur }) => (
              <TextInput
                defaultValue={fieldState.value}
                error={
                  fieldState.meta.errors.length > 0
                    ? fieldState.meta.errors[0]?.message
                    : undefined
                }
                label="Email"
                onBlur={handleBlur}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="info@determinds.com"
                radius="md"
                required
              />
            )}
          </Field>
          <Field name="password">
            {({ state: fieldState, handleChange, handleBlur }) => (
              <PasswordInput
                defaultValue={fieldState.value}
                error={
                  fieldState.meta.errors.length > 0
                    ? fieldState.meta.errors[0]?.message
                    : undefined
                }
                label="Password"
                mt="md"
                onBlur={handleBlur}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Password"
                radius="md"
                required
              />
            )}
          </Field>
          <Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                disabled={!canSubmit}
                fullWidth
                loading={isSubmitting}
                mt="xl"
                radius="md"
                type="submit"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            )}
          </Subscribe>
        </Paper>
      </form>
    </Container>
  );
}
