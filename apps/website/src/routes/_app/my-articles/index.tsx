import { Button, Flex, Group, Title } from "@mantine/core";
import type { contract } from "@my-better-t-app/contracts";
import type { InferContractRouterOutputs } from "@orpc/contract";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTableSearchParams } from "tanstack-table-search-params";
import { z } from "zod";
import { ArticlesList } from "@/components/article/ArticlesList";
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

  const categories = useQuery(
    orpc.category.list.queryOptions({
      input: {
        page: "1",
        limit: "1000",
        select: "all",
        sort: { field: "name", criteria: "asc" },
      },
    })
  );

  const categoryOptions =
    categories.data?.data.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })) ?? [];

  const selectedCategoryIds =
    (stateAndOnChanges.state?.columnFilters?.find((f) => f.id === "categories")
      ?.value as string[]) ?? [];

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
        categoryIds:
          selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        filter: stateAndOnChanges.state?.columnFilters
          ?.filter((filter) => {
            // Skip categories filter as it's handled separately
            if (filter.id === "categories") {
              return false;
            }
            // Skip empty values
            if (Array.isArray(filter.value)) {
              return filter.value.length > 0;
            }
            return filter.value != null && filter.value !== "";
          })
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
            if (type === "date") {
              const filterReturn: Array<{
                path: string;
                type: string;
                value: unknown;
                operator?: string;
                filterGroup?: string;
              }> = [];
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

  const handleRowClick = (article: MyArticlesOutput) => {
    navigate({ to: "/article/$articleId", params: { articleId: article.id } });
  };

  return (
    <Flex direction="column" py="xl">
      <Group justify="space-between" mb="md">
        <Title>My Articles</Title>
        <Button renderRoot={(props) => <Link to="/article/add" {...props} />}>
          Create Article
        </Button>
      </Group>
      <ArticlesList
        categoryOptions={categoryOptions}
        data={articles.data?.data ?? []}
        isLoading={articles.isLoading}
        onRowClick={handleRowClick}
        onTableStateChange={{
          onGlobalFilterChange: stateAndOnChanges.onGlobalFilterChange,
          onPaginationChange: stateAndOnChanges.onPaginationChange,
          onSortingChange: stateAndOnChanges.onSortingChange,
          onColumnFiltersChange: stateAndOnChanges.onColumnFiltersChange,
        }}
        rowCount={articles.data?.meta.pagination.total ?? 0}
        selectedCategoryIds={selectedCategoryIds}
        showAuthor={false}
        tableState={stateAndOnChanges.state}
      />
    </Flex>
  );
}
