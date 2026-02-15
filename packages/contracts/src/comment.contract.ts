import { oc } from "@orpc/contract";
import { z } from "zod";

export const CommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  articleId: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CommentWithUserSchema = CommentSchema.extend({
  user: z
    .object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
});

export const listCommentsByArticleContract = oc
  .route({
    method: "GET",
    path: "/article/:articleId",
    tags: ["comments"],
    summary: "List comments by article",
    description:
      "Lists all comments for an article. Newest first. Public access.",
  })
  .input(z.object({ articleId: z.string() }))
  .output(z.array(CommentWithUserSchema));

export const createCommentContract = oc
  .route({
    method: "POST",
    path: "/",
    tags: ["comments"],
    summary: "Create a comment",
    description: "Creates a comment on an article. Requires authentication.",
  })
  .input(z.object({ articleId: z.string(), content: z.string() }))
  .output(CommentWithUserSchema);

export const updateCommentContract = oc
  .route({
    method: "PUT",
    path: "/",
    tags: ["comments"],
    summary: "Update a comment",
    description:
      "Updates a comment. Only the author can update their own comment.",
  })
  .input(z.object({ id: z.string(), content: z.string() }))
  .output(CommentWithUserSchema);

export const deleteCommentContract = oc
  .route({
    method: "DELETE",
    path: "/",
    tags: ["comments"],
    summary: "Delete a comment",
    description:
      "Deletes a comment. Only the author can delete their own comment.",
  })
  .input(z.object({ id: z.string() }))
  .output(CommentWithUserSchema);

export const comment = oc.prefix("/comments").router({
  listByArticle: listCommentsByArticleContract,
  create: createCommentContract,
  update: updateCommentContract,
  delete: deleteCommentContract,
});
