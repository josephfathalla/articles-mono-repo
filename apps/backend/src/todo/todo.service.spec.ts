import { Test, type TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../database/database.service";
import { TodoService } from "./todo.service";

describe("TodoService", () => {
  let service: TodoService;
  const databaseServiceMock = {
    prisma: {
      todo: {
        findMany: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    databaseServiceMock.prisma.todo.findMany.mockReset();

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
});
