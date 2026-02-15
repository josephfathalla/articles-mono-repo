// Export contract types and schemas
// This package contains the API contracts for ORPC

import { oc } from "@orpc/contract";
import { article } from "./article.contract";
import { category } from "./category.contract";
import { comment } from "./comment.contract";
import { healthCheck } from "./health.contract";
import { todo } from "./todo.contract";

export const contract = oc.router({
  todo,
  healthCheck,
  article,
  category,
  comment,
});

export type Contract = typeof contract;
