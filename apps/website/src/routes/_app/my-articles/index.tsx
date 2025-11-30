import { Button, Flex, Group, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { orpc } from "@/utils/orpc";

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

  const columns = useMemo(
    () => [
      { accessorKey: "title", header: "Title" },
      { accessorKey: "description", header: "Description" },
      {
        accessorKey: "createdAt",
        header: "Created At",
      },
      { accessorKey: "updatedAt", header: "Updated At" },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    initialState: {
      showGlobalFilter: true,
      density: "xs",
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: articles.data?.meta.pagination.total ?? 0,
    enableRowSelection: true,
    // enableRowActions: true,
    data: articles.data?.data ?? [],
  });
  return (
    <Flex direction="column" py="xl">
      <Group justify="space-between" mb="md">
        <Title>My Articles</Title>
        <Button
          renderRoot={(props) => <Link to="/my-articles/add" {...props} />}
        >
          Create Article
        </Button>
      </Group>

      <MantineReactTable table={table} />
    </Flex>
  );
}
