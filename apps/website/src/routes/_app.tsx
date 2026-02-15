import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Group,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { SignedIn } from "@/components/auth/signed-in";
import { SignedOut } from "@/components/auth/signed-out";
import { UserMenu } from "@/components/auth/UserMenu";
import classes from "./MobileNavbar.module.css";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");

  return (
    <ActionIcon
      aria-label={
        computedColorScheme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      onClick={() =>
        setColorScheme(computedColorScheme === "dark" ? "light" : "dark")
      }
      size="lg"
      variant="subtle"
    >
      {computedColorScheme === "dark" ? (
        <IconSun size={20} />
      ) : (
        <IconMoon size={20} />
      )}
    </ActionIcon>
  );
}

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
            <Group gap="xs">
              <Link to="/">Determinds</Link>
            </Group>
            <Group gap="sm" ml="xl" visibleFrom="sm">
              <UnstyledButton
                className={classes.control}
                renderRoot={(props) => <Link to="/articles" {...props} />}
              >
                Articles
              </UnstyledButton>
              <UnstyledButton
                className={classes.control}
                renderRoot={(props) => <Link to="/categories" {...props} />}
              >
                Categories
              </UnstyledButton>
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
                  renderRoot={(props) => <Link to="/my-articles" {...props} />}
                >
                  My Articles
                </UnstyledButton>
                <UserMenu />
              </SignedIn>
              <ColorSchemeToggle />
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar px={4} py="md">
        <UnstyledButton
          className={classes.control}
          renderRoot={(props) => <Link to="/articles" {...props} />}
        >
          Articles
        </UnstyledButton>
        <UnstyledButton
          className={classes.control}
          renderRoot={(props) => <Link to="/categories" {...props} />}
        >
          Categories
        </UnstyledButton>
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
            renderRoot={(props) => <Link to="/my-articles" {...props} />}
          >
            My Articles
          </UnstyledButton>
          <Box px="md">
            <UserMenu />
          </Box>
        </SignedIn>
        <Box px="md">
          <ColorSchemeToggle />
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
