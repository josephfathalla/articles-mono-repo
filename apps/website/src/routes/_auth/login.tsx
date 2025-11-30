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
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { zod4Resolver } from "mantine-form-zod-resolver";
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
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: zod4Resolver(loginFormSchema),
  });

  const handleSubmit = (values: typeof form.values) =>
    authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
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

  return (
    <Container my={40} size={420}>
      <Title className={classes.title} ta="center">
        Welcome back!
      </Title>

      <Text className={classes.subtitle}>
        Do not have an account yet? <Anchor>Create account</Anchor>
      </Text>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Paper mt={30} p={22} radius="md" shadow="sm" withBorder>
          <TextInput
            key={form.key("email")}
            label="Email"
            placeholder="you@mantine.dev"
            radius="md"
            required
            {...form.getInputProps("email")}
          />
          <PasswordInput
            key={form.key("password")}
            label="Password"
            mt="md"
            placeholder="Your password"
            radius="md"
            required
            {...form.getInputProps("password")}
          />
          <Button fullWidth mt="xl" radius="md" type="submit">
            {form.submitting ? "Signing in..." : "Sign in"}
          </Button>
        </Paper>
      </form>
    </Container>
  );
}
