import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import type prismaClient from "@my-better-t-app/db";
type PrismaClient = typeof prismaClient;
@Injectable()
export class TodoService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listTodos() {
    return await this.databaseService.prisma.todo.findMany();
  }

  async createTodo({text}: {text: string}) {
    return await this.databaseService.prisma.todo.create({
      data: { text} ,
    });
  }
  async toggleTodo({id, completed}: {id: number, completed: boolean}) {
    return await this.databaseService.prisma.todo.update({
      where: { id },
      data: { completed },
    });
  }
  async deleteTodo({id}: {id: number}) {
    return await this.databaseService.prisma.todo.delete({
      where: { id },
    });
  }
}
