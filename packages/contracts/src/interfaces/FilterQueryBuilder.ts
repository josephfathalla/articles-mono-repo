import { z } from "zod";
import { OperatorSchema } from "./OperatorQueryBuilder";

const defaultFilterFields = ["id"] as const;

export const createFilterSchema = <
  const Fields extends readonly [string, ...string[]],
>(
  fields: Fields
) =>
  z.array(
    z.object({
      path: z.enum(fields).optional().default(fields[0]),
      operator: OperatorSchema.optional().default(OperatorSchema.enum.contains),
      value: z.string().optional(),
      insensitive: z.boolean().optional().default(false),
      filterGroup: z.enum(["and", "or", "not"]).optional().default("and"),
      type: z
        .enum(["string", "number", "boolean", "date", "object"])
        .optional()
        .default("string"),
    })
  );

export const FilterSchema = createFilterSchema(defaultFilterFields);
export type Filter = z.infer<typeof FilterSchema>;
