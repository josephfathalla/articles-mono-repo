import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  Group,
  Menu,
  Select,
  Text,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import type { contract } from "@my-better-t-app/contracts";
import type { InferContractRouterOutputs } from "@orpc/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MantineReactTable,
  type MRT_Cell,
  type MRT_ColumnDef,
  type MRT_Row,
  useMantineReactTable,
} from "mantine-react-table-open";
import { useMemo } from "react";
import { useTableSearchParams } from "tanstack-table-search-params";
import { z } from "zod";
import { SignedIn } from "@/components/auth/signed-in";
import { useAuthentication } from "@/utils/auth/hooks";
import { orpc } from "@/utils/orpc";

type Outputs = InferContractRouterOutputs<typeof contract.category.list>;
type CategoriesOutput = Outputs["data"][number];
const fields = [
  "name",
  "type",
  "createdAt",
  "updatedAt",
] as const satisfies Partial<keyof CategoriesOutput>[];

const fieldsTypesMapping = {
  name: "string",
  type: "enum",
  createdAt: "date",
};

const orders = ["asc", "desc"] as const;

export const Route = createFileRoute("/_app/categories/")({
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
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthentication();

  const statusCell = ({ cell }: { cell: MRT_Cell<CategoriesOutput> }) => {
    const value = cell.getValue() || "";
    return <Badge color={value === "Long" ? "red" : "green"}>{value}</Badge>;
  };

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

  const categories = useQuery(
    orpc.category.list.queryOptions({
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
            if (type === "enum") {
              return [
                {
                  path: filter.id,
                  type: "string",
                  operator: "equals", // Use equals for exact match
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

  const handleEdit = (row: MRT_Row<CategoriesOutput>) => {
    navigate({ to: `/categories/${row.id}` });
  };

  const deleteMutation = useMutation(
    orpc.category.delete.mutationOptions({
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Category deleted successfully",
          color: "green",
        });
        queryClient.invalidateQueries({
          queryKey: orpc.category.list.queryKey(),
        });
      },
      onError: (error) => {
        notifications.show({
          title: "Error",
          message: (error as Error).message || "Failed to delete category",
          color: "red",
        });
      },
    })
  );

  const handleDelete = (row: CategoriesOutput) => {
    modals.openConfirmModal({
      title: "Delete Category",
      children: `Are you sure you want to delete "${row.name}"? This action cannot be undone.`,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteMutation.mutate({ id: row.id });
      },
    });
  };

  const actionCell = ({ row }: { row: MRT_Cell<CategoriesOutput> }) => (
    <Menu>
      <Menu.Target>
        <ActionIcon variant="subtle">⋮</ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={() => handleEdit(row.original)}>Edit</Menu.Item>
        <Menu.Item color="red" onClick={() => handleDelete(row.original)}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  const createdByCell = ({ row }: { row: MRT_Cell<CategoriesOutput> }) => (
    <Text>{row.original.createdByUser?.name}</Text>
  );

  const columns = useMemo<MRT_ColumnDef<CategoriesOutput>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "type",
        header: "Status",
        filterVariant: "select",
        accessorFn: (row) => (row.type === "long" ? "Long" : "Short"),
        id: "type",
        Cell: statusCell,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        filterVariant: "date-range",
      },
      {
        accessorKey: "updatedAt",
        enableColumnActions: false,
        header: "Updated At",
      },
      {
        accessorKey: "CreatedUser",
        header: "Created By",
        enableColumnActions: false,
        Cell: createdByCell,
      },
      ...(isAuthenticated
        ? [
            {
              id: "actions",
              header: "Actions",
              enableSorting: false,
              enableColumnFilter: false,
              Cell: actionCell,
            },
          ]
        : []),
    ],
    []
  );

  const table = useMantineReactTable({
    data: categories.data?.data ?? [],
    columns,
    ...stateAndOnChanges,
    initialState: {
      showGlobalFilter: true,
      density: "xs",
    },
    state: {
      ...stateAndOnChanges.state,
      isLoading: categories.isLoading,
    },
    // paginationDisplayMode: "",
    manualFiltering: false,
    manualPagination: false,
    manualSorting: false,
    rowCount: categories.data?.meta.pagination.total ?? 0,
    enableRowSelection: true,
  });

  return (
    <Flex direction="column" py="xl">
      <Group justify="space-between" mb="md">
        <Title>Categories</Title>
        <SignedIn>
          <Button
            renderRoot={(props) => <Link to="/categories/add" {...props} />}
          >
            Create Category
          </Button>
        </SignedIn>
      </Group>
      <Group mb={10}>
        <Select
          clearable
          data={[
            { value: "long", label: "Long" },
            { value: "short", label: "Short" },
          ]}
          onChange={(value) =>
            table.getColumn("type").setFilterValue(value || "")
          }
          placeholder="Filter by type"
          value={(table.getColumn("type").getFilterValue() as string) || null}
        />
        <DatePickerInput
          clearable
          onChange={(value) =>
            table.getColumn("createdAt").setFilterValue(value)
          }
          placeholder="Filter created at"
          type="range"
          value={
            (table.getColumn("createdAt").getFilterValue() as [
              Date | null,
              Date | null,
            ]) ?? [null, null]
          }
        />
      </Group>

      <MantineReactTable table={table} />
    </Flex>
  );
}
