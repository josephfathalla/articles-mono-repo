import { AppShell, Burger, Group, Title, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { SignedIn } from "@/components/auth/signed-in";
import { SignedOut } from "@/components/auth/signed-out";
import classes from "./MobileNavbar.module.css";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger hiddenFrom="sm" onClick={toggle} opened={opened} size="sm" />
          <Group justify="space-between" style={{ flex: 1 }}>
            Determinds
            <Group gap={0} ml="xl" visibleFrom="sm">
              <SignedOut>
                <UnstyledButton
                  className={classes.control}
                  renderRoot={(props) => <Link to="/login" {...props} />}
                >
                  Login
                </UnstyledButton>
              </SignedOut>
              <SignedIn>
                <UnstyledButton
                  className={classes.control}
                  renderRoot={(props) => <Link to="/logout" {...props} />}
                >
                  Logout
                </UnstyledButton>
              </SignedIn>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar px={4} py="md">
        <UnstyledButton
          className={classes.control}
          renderRoot={(props) => <Link to="/login" {...props} />}
        >
          Login
        </UnstyledButton>
        <Title order={2}>awdawd</Title>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
