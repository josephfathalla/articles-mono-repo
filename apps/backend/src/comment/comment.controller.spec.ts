import { Test, type TestingModule } from "@nestjs/testing";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";

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
      comment: {
        listByArticle: {},
        create: {},
        update: {},
        delete: {},
      },
    },
  }),
  { virtual: true }
);

type HandlerFnWithInput = (args: {
  context?: any;
  input: any;
}) => Promise<unknown>;
type HandlerFnWithContext = (args: {
  context: any;
  input: any;
}) => Promise<unknown>;

describe("CommentController", () => {
  let controller: CommentController;

  const mockCommentService = {
    listByArticle: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [{ provide: CommentService, useValue: mockCommentService }],
    }).compile();

    controller = module.get<CommentController>(CommentController);
    jest.clearAllMocks();
  });

  describe("listByArticle", () => {
    it("calls commentService.listByArticle with articleId", async () => {
      const input = { articleId: "a1" };
      const handler =
        controller.listByArticle() as unknown as HandlerFnWithInput;
      const comments = [{ id: "c1", content: "Hi", articleId: "a1" }];
      mockCommentService.listByArticle.mockResolvedValue(comments);

      const result = await handler({ input });

      expect(mockCommentService.listByArticle).toHaveBeenCalledWith("a1");
      expect(result).toEqual(comments);
    });
  });

  describe("create", () => {
    it("throws when user is missing", async () => {
      const input = { articleId: "a1", content: "Hi" };
      const context = { request: {} };
      const handler = controller.create() as unknown as HandlerFnWithContext;

      await expect(
        Promise.resolve().then(() => handler({ context, input }))
      ).rejects.toThrow("You must be logged in");
      expect(mockCommentService.create).not.toHaveBeenCalled();
    });

    it("calls commentService.create with user id and input when user is present", async () => {
      const input = { articleId: "a1", content: "Hi" };
      const context = { request: { user: { id: "user-1" } } };
      const handler = controller.create() as unknown as HandlerFnWithContext;
      const created = { id: "c1", ...input, userId: "user-1" };
      mockCommentService.create.mockResolvedValue(created);

      const result = await handler({ context, input });

      expect(mockCommentService.create).toHaveBeenCalledWith(
        "user-1",
        "a1",
        "Hi"
      );
      expect(result).toEqual(created);
    });
  });

  describe("update", () => {
    it("throws when user is missing", async () => {
      const input = { id: "c1", content: "Updated" };
      const context = { request: {} };
      const handler = controller.update() as unknown as HandlerFnWithContext;

      await expect(
        Promise.resolve().then(() => handler({ context, input }))
      ).rejects.toThrow("You must be logged in");
      expect(mockCommentService.update).not.toHaveBeenCalled();
    });

    it("calls commentService.update with user id, id, and content when user is present", async () => {
      const input = { id: "c1", content: "Updated" };
      const context = { request: { user: { id: "user-1" } } };
      const handler = controller.update() as unknown as HandlerFnWithContext;
      const updated = { id: "c1", content: "Updated" };
      mockCommentService.update.mockResolvedValue(updated);

      const result = await handler({ context, input });

      expect(mockCommentService.update).toHaveBeenCalledWith(
        "user-1",
        "c1",
        "Updated"
      );
      expect(result).toEqual(updated);
    });
  });

  describe("delete", () => {
    it("throws when user is missing", async () => {
      const input = { id: "c1" };
      const context = { request: {} };
      const handler = controller.delete() as unknown as HandlerFnWithContext;

      await expect(
        Promise.resolve().then(() => handler({ context, input }))
      ).rejects.toThrow("You must be logged in");
      expect(mockCommentService.delete).not.toHaveBeenCalled();
    });

    it("calls commentService.delete with user id and id when user is present", async () => {
      const input = { id: "c1" };
      const context = { request: { user: { id: "user-1" } } };
      const handler = controller.delete() as unknown as HandlerFnWithContext;
      const deleted = { id: "c1" };
      mockCommentService.delete.mockResolvedValue(deleted);

      const result = await handler({ context, input });

      expect(mockCommentService.delete).toHaveBeenCalledWith("user-1", "c1");
      expect(result).toEqual(deleted);
    });
  });
});
