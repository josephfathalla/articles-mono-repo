import { z } from "zod";

export const OperatorSchema = z.enum([
  "contains",
  "endsWith",
  "startsWith",
  "equals",
  "gt",
  "gte",
  "in",
  "lt",
  "lte",
  "not",
  "notIn",
  "hasEvery",
  "hasSome",
  "has",
  "isEmpty",
]);
export type Operator = z.infer<typeof OperatorSchema>;
