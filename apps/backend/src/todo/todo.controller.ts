import { Controller } from '@nestjs/common';
import { TodoService } from './todo.service';
import { implement, Implement } from '@orpc/nest';
import { contract } from '@my-better-t-app/contracts';

@Controller()
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Implement(contract.todo)
  todos(){
    return {
      list: implement(contract.todo.list).handler(async () => {
        return this.todoService.listTodos();
      })
    }
  }
}
