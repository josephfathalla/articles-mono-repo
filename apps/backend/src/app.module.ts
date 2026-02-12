import { auth } from "@my-better-t-app/auth";
import { Module } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { ORPCModule, onError } from "@orpc/nest";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { Querybuilder } from "nestjs-prisma-querybuilder";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ArticleModule } from "./article/article.module";
import { CategoryModule } from "./category/category.module";
import { DatabaseModule } from "./database/database.module";
import { QuerybuilderService } from "./database/querybuilder.service";
import { HealthModule } from "./health/health.module";
import { TodoModule } from "./todo/todo.module";

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    ORPCModule.forRootAsync({
      // or .forRoot
      useFactory: (request: Request) => ({
        interceptors: [
          onError((error) => {
            console.error(error);
          }),
        ],
        context: { request }, // oRPC context, accessible from middlewares, etc.
        eventIteratorKeepAliveInterval: 5000, // 5 seconds
      }),
      inject: [REQUEST],
    }),

    DatabaseModule,
    TodoModule,
    ArticleModule,
    CategoryModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService, Querybuilder, QuerybuilderService],
})
export class AppModule {}
