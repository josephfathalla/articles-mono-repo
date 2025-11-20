import { z } from "zod";
import { createFilterSchema } from "./FilterQueryBuilder";
import { createSortSchema } from "./SortQueryBuilder";

const defaultPaginationFields = ["id"] as const;

export const createQueryBuilderSchema = <
  const Fields extends readonly [string, ...string[]],
>(
  fields: Fields
) =>
  z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    select: z.string().optional().default("all"),
    sort: createSortSchema(fields).optional(),
    filter: createFilterSchema(fields).optional(),
  });

export const QueryBuilderSchema = createQueryBuilderSchema(
  defaultPaginationFields
);
export type QueryBuilder = z.infer<typeof QueryBuilderSchema>;
