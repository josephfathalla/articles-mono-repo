import { Module } from "@nestjs/common";
import { Querybuilder } from "nestjs-prisma-querybuilder";
import { QuerybuilderService } from "src/database/querybuilder.service";
import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";

@Module({
  imports: [],
  controllers: [TodoController],
  providers: [TodoService, QuerybuilderService, Querybuilder],
})
export class TodoModule {}
