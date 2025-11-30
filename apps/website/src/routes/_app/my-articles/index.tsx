import { Button, Flex, Group, Title } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
// import { MantineReactTable } from "mantine-react-table";

export const Route = createFileRoute("/_app/my-articles/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Flex direction="column" py="xl">
      <Group justify="space-between">
        <Title>My Articles</Title>
        <Button
          renderRoot={(props) => <Link to="/my-articles/add" {...props} />}
        >
          Create Article
        </Button>
      </Group>
      {/* <MantineReactTable table={table} /> */}
    </Flex>
  );
}
