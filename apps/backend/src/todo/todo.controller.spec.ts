import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

jest.mock('@orpc/nest', () => ({
  Implement: () => () => undefined,
  implement: () => ({
    handler: (resolver: (...args: never[]) => unknown) => resolver,
  }),
}), { virtual: true });

jest.mock('@my-better-t-app/contracts', () => ({
  listTodoContract: {},
}), { virtual: true });

describe('TodoController', () => {
  let controller: TodoController;
  const todoServiceMock = {
    listTodos: jest.fn(),
  };

  beforeEach(async () => {
    todoServiceMock.listTodos.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: todoServiceMock,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
