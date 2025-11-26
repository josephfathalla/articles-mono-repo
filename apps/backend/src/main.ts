import "dotenv/config";
import { contract } from "@my-better-t-app/contracts";
import { NestFactory } from "@nestjs/core";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import type { AnyRouter } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import cors from "cors";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    cors({
      origin: [process.env.CORS_ORIGIN, process.env.CORS_WEBSITE_ORIGIN],
      methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization", "count"],
      exposedHeaders: ["count"],
      credentials: true,
    })
  );

  const httpAdapter = app.getHttpAdapter();
  const express = httpAdapter.getInstance();

  // API Reference handler only (RPC is handled by ORPCModule)
  // Contract routers use ContractProcedure while OpenAPIHandler expects Procedure types
  // This cast is safe as OpenAPIHandler can generate docs from contract definitions
  const referenceHandler = new OpenAPIHandler(
    contract as unknown as AnyRouter,
    {
      plugins: [
        new OpenAPIReferencePlugin({
          schemaConverters: [new ZodToJsonSchemaConverter()],
          docsPath: "/",
          specGenerateOptions: ({ request }) => ({
            info: { title: "Boilerplate Backend API", version: "1.0.0" },
            servers: [{ url: `${request.url.origin}/` }], // real API base
          }),
        }),
      ],
    }
  );

  express.use(async (req, res, next) => {
    const apiResult = await referenceHandler.handle(req, res, {
      prefix: "/api-reference",
      context: { request: req },
    });
    if (apiResult.matched) {
      return;
    }

    next();
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
