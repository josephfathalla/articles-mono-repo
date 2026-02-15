import { Test, type TestingModule } from "@nestjs/testing";
import { ArticleController } from "./article.controller";
import { ArticleService } from "./article.service";

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
      article: {
        list: {},
        getById: {},
        listMy: {},
        create: {},
        update: {},
        delete: {},
      },
    },
  }),
  { virtual: true }
);

type HandlerFn = (args: {
  context: { request: { user?: { id: string } } };
  input: any;
}) => Promise<unknown>;

describe("ArticleController", () => {
  let controller: ArticleController;

  const mockArticleService = {
    listAll: jest.fn(),
    getById: jest.fn(),
    listMy: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService,
          useValue: mockArticleService,
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("calls articleService.listAll with input and includeUser false when no user", async () => {
      const input = { categoryIds: [] as string[] };
      const context = { request: {} };
      const handler = controller.list() as unknown as HandlerFn;
      const result = {
        data: [],
        meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } },
      };
      mockArticleService.listAll.mockResolvedValue(result);

      await expect(handler({ context, input })).resolves.toBe(result);
      expect(mockArticleService.listAll).toHaveBeenCalledWith({
        categoryIds: input.categoryIds,
        options: { includeUser: false },
      });
    });

    it("calls articleService.listAll with includeUser true when user is present", async () => {
      const input = { categoryIds: ["cat1"] };
      const context = { request: { user: { id: "user-1" } } };
      const handler = controller.list() as unknown as HandlerFn;
      const result = {
        data: [],
        meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } },
      };
      mockArticleService.listAll.mockResolvedValue(result);

      await expect(handler({ context, input })).resolves.toBe(result);
      expect(mockArticleService.listAll).toHaveBeenCalledWith({
        categoryIds: ["cat1"],
        options: { includeUser: true },
      });
    });
  });

  describe("getById", () => {
    it("calls articleService.getById with articleId and includeUser false when no user", async () => {
      const input = { articleId: "art-1" };
      const context = { request: {} };
      const handler = controller.getById() as unknown as HandlerFn;
      const article = {
        id: "art-1",
        title: "Test",
        description: "",
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "u1",
      };
      mockArticleService.getById.mockResolvedValue(article);

      await expect(handler({ context, input })).resolves.toBe(article);
      expect(mockArticleService.getById).toHaveBeenCalledWith("art-1", {
        includeUser: false,
      });
    });

    it("calls articleService.getById with includeUser true when user is present", async () => {
      const input = { articleId: "art-1" };
      const context = { request: { user: { id: "user-1" } } };
      const handler = controller.getById() as unknown as HandlerFn;
      mockArticleService.getById.mockResolvedValue({} as any);

      await handler({ context, input });
      expect(mockArticleService.getById).toHaveBeenCalledWith("art-1", {
        includeUser: true,
      });
    });
  });

  describe("listMy", () => {
    it("throws UnauthorizedException when user is missing", async () => {
      const input = { search: "", categoryIds: [] as string[] };
      const context = { request: {} };
      const handler = controller.listMy() as unknown as HandlerFn;

      await expect(
        Promise.resolve().then(() => handler({ context, input }))
      ).rejects.toThrow("You must be logged in");
      expect(mockArticleService.listMy).not.toHaveBeenCalled();
    });

    it("calls articleService.listMy with user id and input when user is present", async () => {
      const input = { search: "foo", categoryIds: ["c1"] };
      const context = { request: { user: { id: "user-1" } } };
      const handler = controller.listMy() as unknown as HandlerFn;
      const result = {
        data: [],
        meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } },
      };
      mockArticleService.listMy.mockResolvedValue(result);

      await expect(handler({ context, input })).resolves.toBe(result);
      expect(mockArticleService.listMy).toHaveBeenCalledWith({
        userId: "user-1",
        search: "foo",
        categoryIds: ["c1"],
      });
    });
  });

  describe("create", () => {
    it("throws UnauthorizedException when user is missing", async () => {
      const input = { title: "T", description: "D", isPublished: false };
      const context = { request: {} };
      const handler = controller.create() as unknown as HandlerFn;

      await expect(
        Promise.resolve().then(() => handler({ context, input }))
      ).rejects.toThrow("You must be logged in");
      expect(mockArticleService.create).not.toHaveBeenCalled();
    });

    it("calls articleService.create with user id and input when user is present", async () => {
      const input = {
        title: "T",
        description: "D",
        isPublished: true,
        categoryIds: ["c1"],
      };
      const context = { request: { user: { id: "user-1" } } };
      const handler = controller.create() as unknown as HandlerFn;
      const created = {
        id: "art-1",
        ...input,
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockArticleService.create.mockResolvedValue(created as any);

      await expect(handler({ context, input })).resolves.toBe(created);
      expect(mockArticleService.create).toHaveBeenCalledWith("user-1", input);
    });
  });

  describe("update", () => {
    it("throws UnauthorizedException when user is missing", async () => {
      const input = {
        id: "art-1",
        title: "T",
        description: "D",
        isPublished: false,
      };
      const context = { request: {} };
      const handler = controller.update() as unknown as HandlerFn;

      await expect(
        Promise.resolve().then(() => handler({ context, input }))
      ).rejects.toThrow("You must be logged in");
      expect(mockArticleService.update).not.toHaveBeenCalled();
    });

    it("calls articleService.update with user id, id, and rest of input when user is present", async () => {
      const input = {
        id: "art-1",
        title: "New",
        description: "Desc",
        isPublished: true,
      };
      const context = { request: { user: { id: "user-1" } } };
      const handler = controller.update() as unknown as HandlerFn;
      const updated = {
        ...input,
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockArticleService.update.mockResolvedValue(updated as any);

      await expect(handler({ context, input })).resolves.toBe(updated);
      expect(mockArticleService.update).toHaveBeenCalledWith(
        "user-1",
        "art-1",
        {
          title: "New",
          description: "Desc",
          isPublished: true,
        }
      );
    });
  });

  describe("delete", () => {
    it("throws UnauthorizedException when user is missing", async () => {
      const input = { id: "art-1" };
      const context = { request: {} };
      const handler = controller.delete() as unknown as HandlerFn;

      await expect(
        Promise.resolve().then(() => handler({ context, input }))
      ).rejects.toThrow("You must be logged in");
      expect(mockArticleService.delete).not.toHaveBeenCalled();
    });

    it("calls articleService.delete with id and user id when user is present", async () => {
      const input = { id: "art-1" };
      const context = { request: { user: { id: "user-1" } } };
      const handler = controller.delete() as unknown as HandlerFn;
      const deleted = {
        id: "art-1",
        title: "",
        description: "",
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user-1",
      };
      mockArticleService.delete.mockResolvedValue(deleted as any);

      await expect(handler({ context, input })).resolves.toBe(deleted);
      expect(mockArticleService.delete).toHaveBeenCalledWith("art-1", "user-1");
    });
  });
});
