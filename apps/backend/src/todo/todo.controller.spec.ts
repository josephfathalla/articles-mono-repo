import { Test } from "@nestjs/testing";
import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";

jest.mock(
  "@orpc/nest",
  () => ({
    Implement: () => () => {
      return;
    },
    implement: () => ({
      handler: (resolver: (...args: never[]) => unknown) => resolver,
    }),
  }),
  { virtual: true }
);

jest.mock(
  "@thallesp/nestjs-better-auth",
  () => ({
    AllowAnonymous: () => () => {
      return;
    },
  }),
  { virtual: true }
);

jest.mock(
  "@my-better-t-app/contracts",
  () => ({
    contract: {
      todo: {
        list: {},
        create: {},
        toggle: {},
        delete: {},
      },
    },
  }),
  { virtual: true }
);

type TodoServiceMock = Record<
  "listTodos" | "createTodo" | "toggleTodo" | "deleteTodo",
  jest.Mock
>;

describe("TodoController", () => {
  let controller: TodoController;
  let todoService: TodoServiceMock;

  beforeEach(async () => {
    todoService = {
      listTodos: jest.fn(),
      createTodo: jest.fn(),
      toggleTodo: jest.fn(),
      deleteTodo: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: todoService,
        },
      ],
    }).compile();

    controller = module.get(TodoController);
  });

  describe("todos", () => {
    it("should expose all todo handlers", () => {
      const handlers = controller.todos();

      expect(typeof handlers.list).toBe("function");
      expect(typeof handlers.create).toBe("function");
      expect(typeof handlers.toggle).toBe("function");
      expect(typeof handlers.delete).toBe("function");
    });

    it("list handler should return todos from the service", async () => {
      const handlers = controller.todos();
      const todos = [
        { id: 1, text: "Test todo", completed: false },
        { id: 2, text: "Another", completed: true },
      ];
      todoService.listTodos.mockResolvedValue(todos);

      await expect(handlers.list()).resolves.toEqual(todos);
      expect(todoService.listTodos).toHaveBeenCalledTimes(1);
    });

    it("create handler should call service with provided input", async () => {
      const handlers = controller.todos();
      const input = { text: "Create me" };
      const createdTodo = { id: 1, ...input, completed: false };
      todoService.createTodo.mockResolvedValue(createdTodo);

      await expect(handlers.create({ input })).resolves.toEqual(createdTodo);
      expect(todoService.createTodo).toHaveBeenCalledWith(input);
    });

    it("toggle handler should forward input to the service", async () => {
      const handlers = controller.todos();
      const input = { id: 42, completed: true };
      const updatedTodo = { id: 42, text: "Toggle me", completed: true };
      todoService.toggleTodo.mockResolvedValue(updatedTodo);

      await expect(handlers.toggle({ input })).resolves.toEqual(updatedTodo);
      expect(todoService.toggleTodo).toHaveBeenCalledWith(input);
    });

    it("delete handler should invoke the service with the todo id", async () => {
      const handlers = controller.todos();
      const input = { id: 99 };
      const deletedTodo = { id: 99, text: "Remove me", completed: false };
      todoService.deleteTodo.mockResolvedValue(deletedTodo);

      await expect(handlers.delete({ input })).resolves.toEqual(deletedTodo);
      expect(todoService.deleteTodo).toHaveBeenCalledWith(input);
    });
  });
});
