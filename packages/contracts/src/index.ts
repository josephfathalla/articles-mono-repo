// Export contract types and schemas
// This package contains the API contracts for ORPC

import { oc } from "@orpc/contract";
import { article } from "./article.contract";
import { healthCheck } from "./health.contract";
import { todo } from "./todo.contract";

export const contract = oc.router({
  todo,
  healthCheck,
  article,
});

export type Contract = typeof contract;
