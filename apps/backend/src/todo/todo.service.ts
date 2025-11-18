import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class TodoService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listTodos() {
    return await this.databaseService.prisma.todo.findMany();
  }
}
