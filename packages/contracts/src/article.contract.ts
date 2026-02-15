import { oc } from "@orpc/contract";
import { z } from "zod";
import { createQueryBuilderSchema } from "./interfaces/PaginationQueryBuilder";

export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  isPublished: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  categories: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(["long", "short"]),
      })
    )
    .optional(),
});

export const createArticleContract = oc
  .route({
    method: "POST",
    path: "/",
    tags: ["articles"],
    summary: "Create a new article",
    description: "Creates a new article. Requires authentication.",
  })
  .input(
    ArticleSchema.pick({
      title: true,
      description: true,
      isPublished: true,
    }).extend({ categoryIds: z.array(z.string()).optional() })
  )
  .output(ArticleSchema);

export const updateArticleContract = oc
  .route({
    method: "PUT",
    path: "/",
    tags: ["articles"],
    summary: "Update an article",
    description:
      "Updates an existing article. Only the creator can update their article.",
  })
  .input(
    ArticleSchema.pick({
      id: true,
      title: true,
      description: true,
      isPublished: true,
    }).extend({ categoryIds: z.array(z.string()).optional() })
  )
  .output(ArticleSchema);

export const listArticleContract = oc
  .route({
    method: "GET",
    path: "/",
    tags: ["articles"],
    summary: "List all articles",
    description: "Lists all articles from all users. Public access.",
  })
  .input(
    createQueryBuilderSchema([
      "title",
      "description",
      "createdAt",
      "isPublished",
    ]).extend({
      categoryIds: z.array(z.string()).optional(),
    })
  )
  .output(
    z.object({
      data: z.array(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          isPublished: z.boolean().optional(),
          createdAt: z.date().optional(),
          updatedAt: z.date().optional(),
          userId: z.string().optional(),
          user: z
            .object({
              name: z.string().optional(),
              email: z.string().optional(),
            })
            .optional(),
          categories: z
            .array(
              z.object({
                id: z.string(),
                name: z.string(),
                type: z.enum(["long", "short"]),
              })
            )
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

export const listMyArticlesContract = oc
  .route({
    method: "GET",
    path: "/my",
    tags: ["articles"],
    summary: "List my articles",
    description: "Lists articles created by the currently logged-in user.",
  })
  .input(
    createQueryBuilderSchema([
      "title",
      "description",
      "createdAt",
      "updatedAt",
      "isPublished",
    ]).extend({
      search: z.string().optional(),
      categoryIds: z.array(z.string()).optional(),
    })
  )
  .output(
    z.object({
      data: z.array(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          isPublished: z.boolean().optional(),
          createdAt: z.date().optional(),
          updatedAt: z.date().optional(),
          userId: z.string().optional(),
          categories: z
            .array(
              z.object({
                id: z.string(),
                name: z.string(),
                type: z.enum(["long", "short"]),
              })
            )
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

export const deleteArticleContract = oc
  .route({
    method: "DELETE",
    path: "/",
    tags: ["articles"],
    summary: "Delete an article",
    description:
      "Deletes an article. Only the creator can delete their article.",
  })
  .input(ArticleSchema.pick({ id: true }))
  .output(ArticleSchema);

const ArticleWithOptionalUserSchema = ArticleSchema.extend({
  user: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
});

export const getArticleByIdContract = oc
  .route({
    method: "GET",
    path: "/single-article/:articleId",
    tags: ["articles"],
    summary: "Get article by ID",
    description:
      "Gets an article by its ID. Only the creator can access their own articles.",
  })
  .input(z.object({ articleId: z.string() }))
  .output(ArticleWithOptionalUserSchema);

export const article = oc.prefix("/articles").router({
  create: createArticleContract,
  update: updateArticleContract,
  list: listArticleContract,
  listMy: listMyArticlesContract,
  getById: getArticleByIdContract,
  delete: deleteArticleContract,
});
