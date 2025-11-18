import "dotenv/config";
import { contract } from "@my-better-t-app/contracts";
import { NestFactory } from "@nestjs/core";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import cors from "cors";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "",
      methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  const httpAdapter = app.getHttpAdapter();
  const express = httpAdapter.getInstance();
  
  // API Reference handler only (RPC is handled by ORPCModule)
  const referenceHandler = new OpenAPIHandler(contract as any, {
    plugins: [
      new OpenAPIReferencePlugin({
        schemaConverters: [new ZodToJsonSchemaConverter()],
        docsPath: "/",
        specGenerateOptions: ({ request }) => ({
          info: { title: "My Better T API", version: "1.0.0" },
          servers: [{ url: `${request.url.origin}/` }], // real API base
        }),
      }),
    ],
  });

  express.use(async (req, res, next) => {
    const apiResult = await referenceHandler.handle(req, res, {
      prefix: "/api-reference",
      context: { request: req },
    });
    if (apiResult.matched) return;

    next();
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
