import { Badge, Button, Flex, Group, Title } from "@mantine/core";
import type { contract } from "@my-better-t-app/contracts";
import type { InferContractRouterOutputs } from "@orpc/contract";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MantineReactTable,
  type MRT_Cell,
  type MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { useMemo } from "react";
import { useTableSearchParams } from "tanstack-table-search-params";
import { z } from "zod";
import { orpc } from "@/utils/orpc";

type Outputs = InferContractRouterOutputs<typeof contract.article.listMy>;
type MyArticlesOutput = Outputs["data"][number];
const fields = [
  "title",
  "description",
  "createdAt",
  "updatedAt",
  "isPublished",
] as const satisfies Partial<keyof MyArticlesOutput>[];

const fieldsTypesMapping = {
  title: "string",
  description: "string",
  createdAt: "date",
  updatedAt: "date",
  isPublished: "boolean",
};

const orders = ["asc", "desc"] as const;

const StatusCell = ({ cell }: { cell: MRT_Cell<MyArticlesOutput> }) => (
  <Badge color={cell.getValue() === "true" ? "green" : "gray"}>
    {cell.getValue() === "true" ? "Published" : "Draft"}
  </Badge>
);

export const Route = createFileRoute("/_app/my-articles/")({
  component: RouteComponent,
  validateSearch: z.object({
    search: z.string().optional(),
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
        globalFilter: "search",
        sorting: "sort",
        pagination: {
          pageIndex: "page",
          pageSize: "limit",
        },
      },
    }
  );

  console.log(stateAndOnChanges.state?.columnFilters);

  const articles = useQuery(
    orpc.article.listMy.queryOptions({
      input: {
        search: stateAndOnChanges.state?.globalFilter ?? "",
        page: `${(stateAndOnChanges.state?.pagination?.pageIndex || 0) + 1}`,
        limit: `${stateAndOnChanges.state?.pagination?.pageSize || 10}`,
        select: "all",
        sort: {
          field: (stateAndOnChanges?.state?.sorting?.[0]?.id ??
            "createdAt") as (typeof fields)[number],
          criteria: stateAndOnChanges?.state?.sorting?.[0]?.desc
            ? "desc"
            : "asc",
        },
        filter: stateAndOnChanges.state?.columnFilters
          ?.filter((filter) => filter.value !== "")
          .flatMap((filter) => {
            const type =
              fieldsTypesMapping[
                filter.id as keyof typeof fieldsTypesMapping
              ] ?? "string";

            if (type === "string") {
              return [
                {
                  path: filter.id,
                  type: "string",
                  operator: "contains",
                  value: filter.value,
                },
              ];
            }
            if (type === "boolean") {
              return [
                {
                  path: filter.id,
                  type: "boolean",
                  value: filter.value,
                },
              ];
            }
            if (type === "date") {
              const filterReturn = [];
              if (filter.value[0]) {
                filterReturn.push({
                  path: filter.id,
                  type: "date",
                  value: filter.value[0],
                  operator: "gte",
                  filterGroup: "and",
                });
              }
              if (filter.value[1]) {
                filterReturn.push({
                  path: filter.id,
                  type: "date",
                  value: filter.value[1],
                  operator: "lte",
                  filterGroup: "and",
                });
              }
              return filterReturn;
            }

            //Default to string
            return {
              path: filter.id,
              type: "string",
              value: filter.value,
            };
          }),
      },
    })
  );

  const columns = useMemo<MRT_ColumnDef<MyArticlesOutput>[]>(
    () => [
      { accessorKey: "title", header: "Title" },
      {
        accessorKey: "description",
        header: "Description",
        enableColumnFilter: false,
      },
      {
        accessorKey: "isPublished",
        header: "Status",
        filterVariant: "checkbox",
        accessorFn: (row) => (row.isPublished ? "true" : "false"),
        id: "isPublished",
        Cell: StatusCell,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        filterVariant: "date-range",
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        filterVariant: "date-range",
      },
    ],
    []
  );

  const table = useMantineReactTable({
    data: articles.data?.data ?? [],
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
