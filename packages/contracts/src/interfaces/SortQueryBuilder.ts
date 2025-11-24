import { z } from "zod";

const defaultSortFields = ["id"] as const;

export const createSortSchema = <
  const Fields extends readonly [string, ...string[]],
>(
  fields: Fields
) =>
  z.object({
    field: z.enum(fields).optional().default(fields[0]),
    criteria: z.enum(["asc", "desc"]).optional().default("asc"),
  });

export const SortSchema = createSortSchema(defaultSortFields);
export type Sort = z.infer<typeof SortSchema>;
