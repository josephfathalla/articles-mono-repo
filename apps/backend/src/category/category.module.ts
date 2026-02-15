import { Module } from "@nestjs/common";
import { Querybuilder } from "nestjs-prisma-querybuilder";
import { QuerybuilderService } from "src/database/querybuilder.service";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";

@Module({
  imports: [],
  controllers: [CategoryController],
  providers: [CategoryService, QuerybuilderService, Querybuilder],
})
export class CategoryModule {}
