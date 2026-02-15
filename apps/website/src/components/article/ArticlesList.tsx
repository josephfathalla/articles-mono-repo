import { Badge, Group, MultiSelect, Text, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  MantineReactTable,
  type MRT_Cell,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from "mantine-react-table-open";
import { useMemo } from "react";

type Article = {
  id: string;
  title?: string;
  description?: string;
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
  user?: {
    name?: string;
    email?: string;
  };
  categories?: Array<{
    id: string;
    name: string;
    type: "long" | "short";
  }>;
};

type ArticlesListProps = {
  data: Article[];
  isLoading: boolean;
  rowCount: number;
  showAuthor?: boolean;
  onRowClick: (article: Article) => void;
  tableState: MRT_TableOptions<Article>["state"];
  onTableStateChange: {
    onGlobalFilterChange: MRT_TableOptions<Article>["onGlobalFilterChange"];
    onPaginationChange: MRT_TableOptions<Article>["onPaginationChange"];
    onSortingChange: MRT_TableOptions<Article>["onSortingChange"];
    onColumnFiltersChange: MRT_TableOptions<Article>["onColumnFiltersChange"];
  };
  categoryOptions: Array<{ value: string; label: string }>;
  selectedCategoryIds: string[];
};

const StatusCell = ({ cell }: { cell: MRT_Cell<Article> }) => (
  <Badge color={cell.getValue() === "true" ? "green" : "gray"}>
    {cell.getValue() === "true" ? "Published" : "Draft"}
  </Badge>
);

const CategoryCell = ({ row }: { row: MRT_Row<Article> }) => {
  const categoriesList = row.original.categories || [];
  return <Text>{categoriesList.map((c) => c.name).join(", ")}</Text>;
};

const AuthorCell = ({ row }: { row: MRT_Row<Article> }) => {
  const authorName = row.original.user?.name;
  return <Text>{authorName || "Unknown"}</Text>;
};

export function ArticlesList({
  data,
  isLoading,
  rowCount,
  showAuthor = false,
  onRowClick,
  tableState,
  onTableStateChange,
  categoryOptions,
  selectedCategoryIds,
}: ArticlesListProps) {
  const columns = useMemo<MRT_ColumnDef<Article>[]>(
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
        accessorFn: (row) => (row.isPublished ? "true" : "false"),
        id: "isPublished",
        Cell: StatusCell,
        enableColumnFilter: false,
      },
      {
        accessorKey: "categories",
        header: "Categories",
        enableSorting: false,
        Cell: CategoryCell,
      },
      ...(showAuthor
        ? [
            {
              accessorKey: "user.name" as const,
              header: "Author",
              enableSorting: false,
              enableColumnFilter: false,
              Cell: AuthorCell,
            },
          ]
        : []),
      {
        accessorKey: "createdAt",
        header: "Created At",
        filterVariant: "date-range" as const,
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        enableColumnFilter: false,
      },
    ],
    [showAuthor]
  );

  const table = useMantineReactTable({
    data,
    columns,
    ...onTableStateChange,
    initialState: {
      showGlobalFilter: true,
      density: "xs",
    },
    state: {
      ...tableState,
      isLoading,
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount,
    enableRowSelection: true,
    enableColumnActions: false,
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => onRowClick(row.original),
      style: { cursor: "pointer" },
    }),
  });

  return (
    <>
      <Group mb={10}>
        <TextInput
          label="Filter By Description"
          onChange={(e) =>
            table
              .getColumn("description")
              ?.setFilterValue(e.currentTarget.value)
          }
          placeholder="Filter description"
          value={
            (table.getColumn("description")?.getFilterValue() as string) ?? ""
          }
        />
        <MultiSelect
          clearable
          data={categoryOptions}
          label="Filter by Categories"
          onChange={(values) => {
            table.getColumn("categories")?.setFilterValue(values);
          }}
          placeholder="Select categories"
          searchable
          value={selectedCategoryIds}
        />
        <DatePickerInput
          clearable
          label="Filter By Created At"
          onChange={(value) =>
            table.getColumn("createdAt")?.setFilterValue(value)
          }
          placeholder="Filter created at"
          type="range"
          value={
            (table.getColumn("createdAt")?.getFilterValue() as [
              Date | null,
              Date | null,
            ]) ?? [null, null]
          }
        />
      </Group>
      <MantineReactTable table={table} />
    </>
  );
}
