import { Injectable } from "@nestjs/common";
import { QuerybuilderService } from "src/database/querybuilder.service";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class TodoService {
  private readonly databaseService: DatabaseService;
  private readonly qb: QuerybuilderService;

  constructor(databaseService: DatabaseService, qb: QuerybuilderService) {
    this.databaseService = databaseService;
    this.qb = qb;
  }

  async listTodos() {
    const { query, meta } = await this.qb.query({ model: "Todo" });
    const data = await this.databaseService.prisma.todo.findMany(query);
    return { data, meta };
  }

  async createTodo({ text }: { text: string }) {
    return await this.databaseService.prisma.todo.create({
      data: { text },
    });
  }
  async toggleTodo({ id, completed }: { id: number; completed: boolean }) {
    return await this.databaseService.prisma.todo.update({
      where: { id },
      data: { completed },
    });
  }
  async deleteTodo({ id }: { id: number }) {
    return await this.databaseService.prisma.todo.delete({
      where: { id },
    });
  }
}
