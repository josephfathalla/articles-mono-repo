import "dotenv/config";
import { contract } from "@my-better-t-app/contracts";
import { NestFactory } from "@nestjs/core";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import cors from "cors";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const httpAdapter = app.getHttpAdapter();
  const express = httpAdapter.getInstance();
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
    const result = await referenceHandler.handle(req, res, {
      prefix: "/api-reference",
      context: { request: req },
    });
    if (!result.matched) next();
  });

  await app.listen(process.env.PORT ?? 4000);

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
}
bootstrap();
