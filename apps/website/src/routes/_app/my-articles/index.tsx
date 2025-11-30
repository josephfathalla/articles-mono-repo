import { Button, Flex, Group, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";
// import { MantineReactTable } from "mantine-react-table";

export const Route = createFileRoute("/_app/my-articles/")({
  component: RouteComponent,
});

function RouteComponent() {
  const articles = useQuery(
    orpc.article.listMy.queryOptions({
      input: {
        page: "1",
        limit: "10",
        select: "all",
        sort: { field: "createdAt", criteria: "asc" },
        filter: [{ path: "title", operator: "contains", value: "awd" }],
      },
    })
  );
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
      {articles.data?.data.map((article) => (
        <div key={article.id}>
          {article.title} - {article.description} - {article.user?.name}
          {JSON.stringify(article)}
        </div>
      ))}
      {/* <MantineReactTable table={table} /> */}
    </Flex>
  );
}
