import { oc } from "@orpc/contract";
import { z } from "zod";
import { createQueryBuilderSchema } from "./interfaces/PaginationQueryBuilder";

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["long", "short"]),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});

export const createCategoryContract = oc
  .route({
    method: "POST",
    path: "/",
    tags: ["categories"],
    summary: "Create a new category",
    description: "Creates a new category. Requires authentication.",
  })
  .input(CategorySchema.pick({ name: true, type: true }))
  .output(CategorySchema);

export const updateCategoryContract = oc
  .route({
    method: "PUT",
    path: "/",
    tags: ["categories"],
    summary: "Update a category",
    description:
      "Updates an existing category. Only the creator can update their category.",
  })
  .input(
    CategorySchema.pick({
      id: true,
      name: true,
      type: true,
    })
  )
  .output(CategorySchema);

export const listCategoryContract = oc
  .route({
    method: "GET",
    path: "/",
    tags: ["categories"],
    summary: "List all categories",
    description: "Lists all categories from all users. Public access.",
  })
  .input(createQueryBuilderSchema(["name", "type", "createdAt"]))
  .output(
    z.object({
      data: z.array(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          type: z.enum(["long", "short"]),
          createdAt: z.date().optional(),
          updatedAt: z.date().optional(),
          createdBy: z.string().optional(),
          createdByUser: z
            .object({
              name: z.string().optional(),
              email: z.string().optional(),
            })
            .optional(),
        })
      ),
      meta: z.object({
        pagination: z.object({
          page: z.number().int().min(1),
          pageSize: z.number().int().min(1),
          pageCount: z.number().int().min(0),
          total: z.number().int().min(0),
        }),
      }),
    })
  );

export const deleteCategoryContract = oc
  .route({
    method: "DELETE",
    path: "/",
    tags: ["categories"],
    summary: "Delete a category",
    description:
      "Deletes a category item by its ID. Returns the deleted category item.",
  })
  .input(CategorySchema.pick({ id: true }))
  .output(CategorySchema);

export const getCategoryByIdContract = oc
  .route({
    method: "GET",
    path: "/:categoryId",
    tags: ["categories"],
    summary: "Get category by ID",
  })
  .input(z.object({ categoryId: z.string() }))
  .output(CategorySchema);

export const category = oc.prefix("/categories").router({
  create: createCategoryContract,
  update: updateCategoryContract,
  list: listCategoryContract,
  delete: deleteCategoryContract,
  getById: getCategoryByIdContract,
});
