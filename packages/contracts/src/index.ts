// Export contract types and schemas
// This package contains the API contracts for ORPC

import { oc } from "@orpc/contract";
import { todo } from "./todo.contract";
import { healthCheck } from "./health.contract";
export const contract = oc.router({
  todo,
  healthCheck,
});

export type Contract = typeof contract;
