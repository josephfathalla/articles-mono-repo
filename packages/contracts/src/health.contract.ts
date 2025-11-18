import { oc } from "@orpc/contract";
import { z } from "zod";

export const healthCheckContract = oc
  .route({
    method: "POST",
    path: "/healthCheck", // Path is required for NestJS implementation
  })
  .output(z.string());

export const healthCheck = healthCheckContract;
