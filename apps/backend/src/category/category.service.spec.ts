import { Test, type TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../database/database.service";
import { QuerybuilderService } from "../database/querybuilder.service";
import { CategoryService } from "./category.service";

describe("CategoryService", () => {
  let service: CategoryService;
  const mockPrismaCategory = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockDatabaseService = {
    prisma: { category: mockPrismaCategory },
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
        CategoryService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: QuerybuilderService, useValue: mockQb },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("listAll", () => {
    it("calls qb.query and findMany, returns data and meta", async () => {
      const data = [
        {
          id: "cat1",
          name: "Tech",
          type: "long",
          createdBy: "u1",
          createdByUser: { name: "User", email: "u@x.com" },
        },
      ];
      mockPrismaCategory.findMany.mockResolvedValue(data);

      const result = await service.listAll();

      expect(mockQb.query).toHaveBeenCalledWith({ model: "Category" });
      expect(mockPrismaCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            createdByUser: { select: { name: true, email: true } },
          },
        })
      );
      expect(result).toEqual({ data, meta: defaultMeta });
    });
  });

  describe("getById", () => {
    it("returns category when found", async () => {
      const category = {
        id: "cat1",
        name: "Tech",
        type: "long",
        createdBy: "u1",
      };
      mockPrismaCategory.findUnique.mockResolvedValue(category);

      const result = await service.getById("cat1");

      expect(mockPrismaCategory.findUnique).toHaveBeenCalledWith({
        where: { id: "cat1" },
      });
      expect(result).toEqual(category);
    });

    it("throws when category not found", async () => {
      mockPrismaCategory.findUnique.mockResolvedValue(null);

      await expect(service.getById("missing")).rejects.toThrow(
        "Category not found"
      );
    });
  });

  describe("create", () => {
    it("calls prisma.category.create with userId and data", async () => {
      const created = {
        id: "cat1",
        name: "Tech",
        type: "long",
        createdBy: "u1",
      };
      mockPrismaCategory.create.mockResolvedValue(created);

      const result = await service.create("u1", {
        name: "Tech",
        type: "long",
      });

      expect(mockPrismaCategory.create).toHaveBeenCalledWith({
        data: { name: "Tech", type: "long", createdBy: "u1" },
      });
      expect(result).toEqual(created);
    });
  });

  describe("update", () => {
    it("updates category when user owns it", async () => {
      const existing = { id: "cat1", createdBy: "u1" };
      const updated = { ...existing, name: "Updated" };
      mockPrismaCategory.findUnique.mockResolvedValue(existing);
      mockPrismaCategory.update.mockResolvedValue(updated);

      const result = await service.update("u1", "cat1", { name: "Updated" });

      expect(mockPrismaCategory.update).toHaveBeenCalledWith({
        where: { id: "cat1" },
        data: { name: "Updated" },
      });
      expect(result).toEqual(updated);
    });

    it("throws when category not found", async () => {
      mockPrismaCategory.findUnique.mockResolvedValue(null);

      await expect(
        service.update("u1", "missing", { name: "X" })
      ).rejects.toThrow("Category not found");
      expect(mockPrismaCategory.update).not.toHaveBeenCalled();
    });

    it("throws when user does not own category", async () => {
      mockPrismaCategory.findUnique.mockResolvedValue({
        id: "cat1",
        createdBy: "other-user",
      });

      await expect(service.update("u1", "cat1", { name: "X" })).rejects.toThrow(
        "You can only edit your own categories"
      );
      expect(mockPrismaCategory.update).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("deletes category when user owns it", async () => {
      const existing = { id: "cat1", createdBy: "u1" };
      mockPrismaCategory.findUnique.mockResolvedValue(existing);
      mockPrismaCategory.delete.mockResolvedValue(existing);

      await service.delete("u1", "cat1");

      expect(mockPrismaCategory.delete).toHaveBeenCalledWith({
        where: { id: "cat1" },
      });
    });

    it("throws when category not found", async () => {
      mockPrismaCategory.findUnique.mockResolvedValue(null);

      await expect(service.delete("u1", "missing")).rejects.toThrow(
        "Category not found"
      );
      expect(mockPrismaCategory.delete).not.toHaveBeenCalled();
    });

    it("throws when user does not own category", async () => {
      mockPrismaCategory.findUnique.mockResolvedValue({
        id: "cat1",
        createdBy: "other-user",
      });

      await expect(service.delete("u1", "cat1")).rejects.toThrow(
        "You can only delete your own categories"
      );
      expect(mockPrismaCategory.delete).not.toHaveBeenCalled();
    });
  });
});
