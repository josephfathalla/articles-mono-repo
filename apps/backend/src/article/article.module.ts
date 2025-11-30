import { Module } from "@nestjs/common";
import { Querybuilder } from "nestjs-prisma-querybuilder";
import { QuerybuilderService } from "src/database/querybuilder.service";
import { ArticleController } from "./article.controller";
import { ArticleService } from "./article.service";

@Module({
  imports: [],
  controllers: [ArticleController],
  providers: [ArticleService, QuerybuilderService, Querybuilder],
})
export class ArticleModule {}
