import { Badge, Button, Flex, Group, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useMemo } from "react";
import { useTableSearchParams } from "tanstack-table-search-params";
import { z } from "zod";
import { orpc } from "@/utils/orpc";

const fields = [
  "title",
  "description",
  "createdAt",
  "updatedAt",
  "isPublished",
] as const;
const orders = ["asc", "desc"] as const;

export const Route = createFileRoute("/_app/my-articles/")({
  component: RouteComponent,
  validateSearch: z.object({
    page: z.string().default("1"),
    limit: z.string().default("10"),
    sort: z
      .enum([...fields.flatMap((f) => orders.map((o) => `${f}.${o}` as const))])
      .default("createdAt.desc"),
  }),
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const query = Route.useSearch();

  const stateAndOnChanges = useTableSearchParams(
    {
      replace: (url) => {
        const searchParams = new URLSearchParams(url.split("?")[1]);
        navigate({
          search: Object.fromEntries(searchParams.entries()),
          replace: true,
        });
      },
      query,
      pathname: Route.path,
    },
    {
      paramNames: {
        sorting: "sort",
        pagination: {
          pageIndex: "page",
          pageSize: "limit",
        },
      },
    }
  );

  const articles = useQuery(
    orpc.article.listMy.queryOptions({
      input: {
        page: `${query?.page ?? 1}`,
        limit: `${query?.limit ?? 10}`,
        select: "all",
        sort: {
          field: (query?.sort?.split(".")[0] ??
            "createdAt") as (typeof fields)[number],

          criteria: (query?.sort?.split(".")[1] ??
            "desc") as (typeof orders)[number],
        },
        // filter: [{ path: "title", operator: "contains", value: "awd" }],
      },
    })
  );

  const columns = useMemo(
    () => [
      { accessorKey: "title", header: "Title" },
      { accessorKey: "description", header: "Description" },
      {
        accessorKey: "isPublished",
        header: "Status",
        Cell: ({ cell }) => (
          <Badge color={cell.getValue<boolean>() ? "green" : "gray"}>
            {cell.getValue<boolean>() ? "Published" : "Draft"}
          </Badge>
        ),
      },
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
    ...stateAndOnChanges,
    initialState: {
      showGlobalFilter: true,
      density: "xs",
    },
    state: {
      ...stateAndOnChanges.state,
      isLoading: articles.isLoading,
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
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
