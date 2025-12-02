import { z } from "zod";

export const createPopulateSchema = () =>
  z.array(
    z.object({
      path: z.string().optional(),
      select: z.string().optional(),
    })
  );

export const PopulateSchema = createPopulateSchema();
export type Populate = z.infer<typeof PopulateSchema>;
