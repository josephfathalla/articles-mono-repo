import { contract } from "@my-better-t-app/contracts";
import { Controller } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { TodoService } from "./todo.service";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller()
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Implement(contract.todo)
  todos() {
    return {
      list: implement(contract.todo.list).handler(async () =>
        this.todoService.listTodos()
      ),
      create: implement(contract.todo.create).handler(async ({ input }) =>
        this.todoService.createTodo(input)
      ),
      toggle: implement(contract.todo.toggle).handler(async ({ input }) =>
        this.todoService.toggleTodo(input)
      ),
      delete: implement(contract.todo.delete).handler(async ({ input }) =>
        this.todoService.deleteTodo(input)
      ),
    };
  }
}
