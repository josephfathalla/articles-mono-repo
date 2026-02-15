import { Avatar, Menu, Text, UnstyledButton } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { authClient } from "@/utils/auth/auth-client";
import { useAuthenticatedUser } from "@/utils/auth/hooks";
import { queryClient } from "@/utils/orpc";

export function UserMenu() {
  const userSession = useAuthenticatedUser();
  const user = userSession?.user;

  if (!user) {
    return null;
  }

  const displayName = user.name ?? user.email ?? "User";
  const initials = user.name
    ? user.name
        .split(" ")
        .map((p: string) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.email?.[0]?.toUpperCase() ?? "U");

  return (
    <Menu position="bottom-end" shadow="md" width={220}>
      <Menu.Target>
        <UnstyledButton>
          <Avatar
            alt={displayName}
            color="cyan"
            radius="xl"
            size="sm"
            src={user.image ?? undefined}
          >
            {initials}
          </Avatar>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <Text fw={600} lineClamp={1} size="sm">
            {displayName}
          </Text>
          {user.email && (
            <Text c="dimmed" lineClamp={1} mt={2} size="xs">
              {user.email}
            </Text>
          )}
        </Menu.Label>
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconLogout size={14} />}
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  queryClient.invalidateQueries();
                },
              },
            });
          }}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
