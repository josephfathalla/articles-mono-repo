import { contract } from "@my-better-t-app/contracts";
import { Controller } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { TodoService } from "./todo.service";

@Controller()
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Implement(contract.todo)
  todos() {
    return {
      list: implement(contract.todo.list).handler(async () =>
        this.todoService.listTodos()
      ),
    };
  }
}
