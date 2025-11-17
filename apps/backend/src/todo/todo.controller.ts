import { Controller } from '@nestjs/common';
import { TodoService } from './todo.service';
import { implement, Implement } from '@orpc/nest';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  
}
