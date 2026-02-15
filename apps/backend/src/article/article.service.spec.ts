import { Test, type TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../database/database.service";
import { QuerybuilderService } from "../database/querybuilder.service";
import { ArticleService } from "./article.service";

describe("ArticleService", () => {
  let service: ArticleService;
  const mockPrismaArticle = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockDatabaseService = {
    prisma: { article: mockPrismaArticle },
  };
  const mockQb = { query: jest.fn() };

  const defaultMeta = {
    pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockQb.query.mockResolvedValue({ query: {}, meta: defaultMeta });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: QuerybuilderService, useValue: mockQb },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("listAll", () => {
    it("calls qb.query and findMany, returns data and meta", async () => {
      const data = [{ id: "a1", title: "T", isPublished: true }];
      mockPrismaArticle.findMany.mockResolvedValue(data);

      const result = await service.listAll();

      expect(mockQb.query).toHaveBeenCalledWith({
        model: "Article",
        where: { isPublished: true },
        mergeWhere: true,
      });
      expect(mockPrismaArticle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            categories: { select: { id: true, name: true, type: true } },
          }),
        })
      );
      expect(result).toEqual({ data, meta: defaultMeta });
    });

    it("passes categoryIds and includeUser to query when provided", async () => {
      mockPrismaArticle.findMany.mockResolvedValue([]);

      await service.listAll({
        categoryIds: ["c1"],
        options: { includeUser: true },
      });

      expect(mockQb.query).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublished: true,
            categories: { some: { id: { in: ["c1"] } } },
          }),
        })
      );
      expect(mockPrismaArticle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            user: { select: { name: true, email: true } },
          }),
        })
      );
    });
  });

  describe("listMy", () => {
    it("calls qb.query with userId and findMany", async () => {
      const data: never[] = [];
      mockPrismaArticle.findMany.mockResolvedValue(data);

      await service.listMy({
        userId: "u1",
        search: "foo",
        categoryIds: ["c1"],
      });

      expect(mockQb.query).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "u1",
            OR: expect.any(Array),
            categories: { some: { id: { in: ["c1"] } } },
          }),
        })
      );
      expect(mockPrismaArticle.findMany).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("returns article when found", async () => {
      const article = {
        id: "a1",
        title: "T",
        description: "D",
        isPublished: true,
        userId: "u1",
        categories: [],
      };
      mockPrismaArticle.findUnique.mockResolvedValue(article);

      const result = await service.getById("a1");

      expect(mockPrismaArticle.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "a1" } })
      );
      expect(result).toEqual(article);
    });

    it("throws NotFoundException when article not found", async () => {
      mockPrismaArticle.findUnique.mockResolvedValue(null);

      await expect(service.getById("missing")).rejects.toThrow(
        "Article not found"
      );
    });
  });

  describe("create", () => {
    it("calls prisma.article.create with userId and data", async () => {
      const created = {
        id: "a1",
        title: "T",
        description: "D",
        isPublished: false,
        userId: "u1",
        categories: [],
      };
      mockPrismaArticle.create.mockResolvedValue(created);

      const result = await service.create("u1", {
        title: "T",
        description: "D",
        isPublished: false,
      });

      expect(mockPrismaArticle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "T",
            description: "D",
            isPublished: false,
            userId: "u1",
          }),
        })
      );
      expect(result).toEqual(created);
    });

    it("connects categories when categoryIds provided", async () => {
      mockPrismaArticle.create.mockResolvedValue({});

      await service.create("u1", {
        title: "T",
        description: "D",
        isPublished: false,
        categoryIds: ["c1", "c2"],
      });

      expect(mockPrismaArticle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            categories: {
              connect: [{ id: "c1" }, { id: "c2" }],
            },
          }),
        })
      );
    });
  });

  describe("update", () => {
    it("updates article when user owns it", async () => {
      const existing = { id: "a1", userId: "u1" };
      const updated = { ...existing, title: "New" };
      mockPrismaArticle.findUnique.mockResolvedValue(existing);
      mockPrismaArticle.update.mockResolvedValue(updated);

      const result = await service.update("u1", "a1", {
        title: "New",
        isPublished: true,
      });

      expect(mockPrismaArticle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "a1" },
          data: expect.objectContaining({ title: "New", isPublished: true }),
        })
      );
      expect(result).toEqual(updated);
    });

    it("throws NotFoundException when article not found", async () => {
      mockPrismaArticle.findUnique.mockResolvedValue(null);

      await expect(
        service.update("u1", "missing", { isPublished: true })
      ).rejects.toThrow("Article not found");
    });

    it("throws ForbiddenException when user does not own article", async () => {
      mockPrismaArticle.findUnique.mockResolvedValue({
        id: "a1",
        userId: "other-user",
      });

      await expect(
        service.update("u1", "a1", { isPublished: true })
      ).rejects.toThrow("You can only edit your own articles");
      expect(mockPrismaArticle.update).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("deletes article when user owns it", async () => {
      const existing = { id: "a1", userId: "u1" };
      mockPrismaArticle.findUnique.mockResolvedValue(existing);
      mockPrismaArticle.delete.mockResolvedValue(existing);

      await service.delete("a1", "u1");

      expect(mockPrismaArticle.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "a1" } })
      );
    });

    it("throws NotFoundException when article not found", async () => {
      mockPrismaArticle.findUnique.mockResolvedValue(null);

      await expect(service.delete("missing", "u1")).rejects.toThrow(
        "Article not found"
      );
    });

    it("throws ForbiddenException when user does not own article", async () => {
      mockPrismaArticle.findUnique.mockResolvedValue({
        id: "a1",
        userId: "other-user",
      });

      await expect(service.delete("a1", "u1")).rejects.toThrow(
        "You can only delete your own articles"
      );
      expect(mockPrismaArticle.delete).not.toHaveBeenCalled();
    });
  });
});
