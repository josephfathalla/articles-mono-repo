import { Test, type TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../database/database.service";
import { CommentService } from "./comment.service";

describe("CommentService", () => {
  let service: CommentService;
  const mockPrismaComment = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockPrismaArticle = { findUnique: jest.fn() };
  const mockDatabaseService = {
    prisma: {
      comment: mockPrismaComment,
      article: mockPrismaArticle,
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("listByArticle", () => {
    it("calls findMany with articleId and orderBy createdAt desc", async () => {
      const comments = [
        {
          id: "c1",
          content: "Hi",
          articleId: "a1",
          userId: "u1",
          user: { id: "u1", name: "User", email: "u@x.com" },
        },
      ];
      mockPrismaComment.findMany.mockResolvedValue(comments);

      const result = await service.listByArticle("a1");

      expect(mockPrismaComment.findMany).toHaveBeenCalledWith({
        where: { articleId: "a1" },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
      expect(result).toEqual(comments);
    });
  });

  describe("create", () => {
    it("creates comment when article exists", async () => {
      mockPrismaArticle.findUnique.mockResolvedValue({ id: "a1" });
      const created = {
        id: "c1",
        content: "New",
        articleId: "a1",
        userId: "u1",
        user: { id: "u1", name: "User", email: "u@x.com" },
      };
      mockPrismaComment.create.mockResolvedValue(created);

      const result = await service.create("u1", "a1", "New");

      expect(mockPrismaArticle.findUnique).toHaveBeenCalledWith({
        where: { id: "a1" },
      });
      expect(mockPrismaComment.create).toHaveBeenCalledWith({
        data: { content: "New", articleId: "a1", userId: "u1" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
      expect(result).toEqual(created);
    });

    it("throws when article not found", async () => {
      mockPrismaArticle.findUnique.mockResolvedValue(null);

      await expect(service.create("u1", "missing", "Content")).rejects.toThrow(
        "Article not found"
      );
      expect(mockPrismaComment.create).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("updates comment when user owns it", async () => {
      const existing = { id: "c1", userId: "u1" };
      const updated = { ...existing, content: "Updated" };
      mockPrismaComment.findUnique.mockResolvedValue(existing);
      mockPrismaComment.update.mockResolvedValue(updated);

      const result = await service.update("u1", "c1", "Updated");

      expect(mockPrismaComment.update).toHaveBeenCalledWith({
        where: { id: "c1" },
        data: { content: "Updated" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
      expect(result).toEqual(updated);
    });

    it("throws when comment not found", async () => {
      mockPrismaComment.findUnique.mockResolvedValue(null);

      await expect(service.update("u1", "missing", "Content")).rejects.toThrow(
        "Comment not found"
      );
      expect(mockPrismaComment.update).not.toHaveBeenCalled();
    });

    it("throws when user does not own comment", async () => {
      mockPrismaComment.findUnique.mockResolvedValue({
        id: "c1",
        userId: "other-user",
      });

      await expect(service.update("u1", "c1", "Content")).rejects.toThrow(
        "You can only edit your own comments"
      );
      expect(mockPrismaComment.update).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("deletes comment when user owns it", async () => {
      const existing = { id: "c1", userId: "u1" };
      mockPrismaComment.findUnique.mockResolvedValue(existing);
      mockPrismaComment.delete.mockResolvedValue(existing);

      await service.delete("u1", "c1");

      expect(mockPrismaComment.delete).toHaveBeenCalledWith({
        where: { id: "c1" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it("throws when comment not found", async () => {
      mockPrismaComment.findUnique.mockResolvedValue(null);

      await expect(service.delete("u1", "missing")).rejects.toThrow(
        "Comment not found"
      );
      expect(mockPrismaComment.delete).not.toHaveBeenCalled();
    });

    it("throws when user does not own comment", async () => {
      mockPrismaComment.findUnique.mockResolvedValue({
        id: "c1",
        userId: "other-user",
      });

      await expect(service.delete("u1", "c1")).rejects.toThrow(
        "You can only delete your own comments"
      );
      expect(mockPrismaComment.delete).not.toHaveBeenCalled();
    });
  });
});
