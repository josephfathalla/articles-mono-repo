import { Test, type TestingModule } from "@nestjs/testing";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";

jest.mock(
  "@orpc/nest",
  () => ({
    Implement: () => () => {
      /* decorator noop */
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
      /* decorator noop */
    },
  }),
  { virtual: true }
);

jest.mock(
  "@my-better-t-app/contracts",
  () => ({
    contract: {
      category: {
        list: {},
        getById: {},
        create: {},
        update: {},
        delete: {},
      },
    },
  }),
  { virtual: true }
);

type HandlerFn = (args: {
  context?: { request: { user?: { id: string } } };
  input?: any;
}) => Promise<unknown>;

describe("CategoryController", () => {
  let controller: CategoryController;

  const mockCategoryService = {
    listAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockCategoryService }],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("calls categoryService.listAll and returns result", async () => {
      const handler = controller.list() as unknown as HandlerFn;
      const result = {
        data: [{ id: "c1", name: "Tech", type: "long" }],
        meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: 1 } },
      };
      mockCategoryService.listAll.mockResolvedValue(result);

      const out = await handler({});

      expect(mockCategoryService.listAll).toHaveBeenCalledTimes(1);
      expect(out).toEqual(result);
    });
  });

  describe("getById", () => {
    it("calls categoryService.getById with categoryId from input", async () => {
      const input = { categoryId: "cat1" };
      const handler = controller.getById() as unknown as HandlerFn;
      const category = { id: "cat1", name: "Tech", type: "long" };
      mockCategoryService.getById.mockResolvedValue(category);

      const out = await handler({ input });

      expect(mockCategoryService.getById).toHaveBeenCalledWith("cat1");
      expect(out).toEqual(category);
    });
  });

  describe("create", () => {
    it("throws when user is missing", async () => {
      const input = { name: "Tech", type: "long" };
      const context = { request: {} };
      const handler = controller.create() as unknown as HandlerFn;

      await expect(
        Promise.resolve().then(() => handler({ context, input }))
      ).rejects.toThrow("You must be logged in");
      expect(mockCategoryService.create).not.toHaveBeenCalled();
    });

    it("calls categoryService.create with user id and input when user is present", async () => {
      const input = { name: "Tech", type: "long" };
      const context = { request: { user: { id: "user-1" } } };
      const handler = controller.create() as unknown as HandlerFn;
      const created = { id: "c1", ...input, createdBy: "user-1" };
      mockCategoryService.create.mockResolvedValue(created);

      const result = await handler({ context, input });

      expect(mockCategoryService.create).toHaveBeenCalledWith("user-1", input);
      expect(result).toEqual(created);
    });
  });

  describe("update", () => {
    it("throws when user is missing", async () => {
      const input = { id: "cat1", name: "New", type: "short" };
      const context = { request: {} };
      const handler = controller.update() as unknown as HandlerFn;

      await expect(
        Promise.resolve().then(() => handler({ context, input }))
      ).rejects.toThrow("You must be logged in");
      expect(mockCategoryService.update).not.toHaveBeenCalled();
    });

    it("calls categoryService.update with user id, id, and data when user is present", async () => {
      const input = { id: "cat1", name: "New", type: "short" };
      const context = { request: { user: { id: "user-1" } } };
      const handler = controller.update() as unknown as HandlerFn;
      const updated = { id: "cat1", name: "New", type: "short" };
      mockCategoryService.update.mockResolvedValue(updated);

      const result = await handler({ context, input });

      expect(mockCategoryService.update).toHaveBeenCalledWith(
        "user-1",
        "cat1",
        { name: "New", type: "short" }
      );
      expect(result).toEqual(updated);
    });
  });

  describe("delete", () => {
    it("throws when user is missing", async () => {
      const input = { id: "cat1" };
      const context = { request: {} };
      const handler = controller.delete() as unknown as HandlerFn;

      await expect(
        Promise.resolve().then(() => handler({ context, input }))
      ).rejects.toThrow("You must be logged in");
      expect(mockCategoryService.delete).not.toHaveBeenCalled();
    });

    it("calls categoryService.delete with user id and id when user is present", async () => {
      const input = { id: "cat1" };
      const context = { request: { user: { id: "user-1" } } };
      const handler = controller.delete() as unknown as HandlerFn;
      const deleted = { id: "cat1" };
      mockCategoryService.delete.mockResolvedValue(deleted);

      const result = await handler({ context, input });

      expect(mockCategoryService.delete).toHaveBeenCalledWith("user-1", "cat1");
      expect(result).toEqual(deleted);
    });
  });
});
