import { Controller } from '@nestjs/common';
import { TodoService } from './todo.service';
import { implement, Implement } from '@orpc/nest';
import { listTodoContract } from '@my-better-t-app/contracts';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Implement(listTodoContract)
  listTodos() {
    return implement(listTodoContract).handler(async () => {
      return [{id:1, text: 'Todo 1', completed: false}]
    });
  }
}
