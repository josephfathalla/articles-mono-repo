import { Test, type TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../database/database.service";
import { TodoService } from "./todo.service";

describe("TodoService", () => {
  let service: TodoService;
  const databaseServiceMock = {
    prisma: {
      todo: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    databaseServiceMock.prisma.todo.findMany.mockReset();
    databaseServiceMock.prisma.todo.create.mockReset();
    databaseServiceMock.prisma.todo.update.mockReset();
    databaseServiceMock.prisma.todo.delete.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: DatabaseService,
          useValue: databaseServiceMock,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should list todos using the database service", async () => {
    const todos = [{ id: 1, text: "Test", completed: false }];
    databaseServiceMock.prisma.todo.findMany.mockResolvedValueOnce(todos);
    await expect(service.listTodos()).resolves.toEqual(todos);
    expect(databaseServiceMock.prisma.todo.findMany).toHaveBeenCalledTimes(1);
  });

  it("should create todos using the database service", async () => {
    const newTodo = { id: 2, text: "Create", completed: false };
    databaseServiceMock.prisma.todo.create.mockResolvedValueOnce(newTodo);

    await expect(service.createTodo({ text: "Create" })).resolves.toEqual(
      newTodo
    );
    expect(databaseServiceMock.prisma.todo.create).toHaveBeenCalledWith({
      data: { text: "Create" },
    });
  });

  it("should toggle todos using the database service", async () => {
    const toggledTodo = { id: 3, text: "Toggle", completed: true };
    databaseServiceMock.prisma.todo.update.mockResolvedValueOnce(toggledTodo);

    await expect(
      service.toggleTodo({ id: 3, completed: true })
    ).resolves.toEqual(toggledTodo);
    expect(databaseServiceMock.prisma.todo.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { completed: true },
    });
  });

  it("should delete todos using the database service", async () => {
    const deletedTodo = { id: 4, text: "Delete", completed: false };
    databaseServiceMock.prisma.todo.delete.mockResolvedValueOnce(deletedTodo);

    await expect(service.deleteTodo({ id: 4 })).resolves.toEqual(deletedTodo);
    expect(databaseServiceMock.prisma.todo.delete).toHaveBeenCalledWith({
      where: { id: 4 },
    });
  });
});
