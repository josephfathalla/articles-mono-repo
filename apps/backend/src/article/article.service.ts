import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { QuerybuilderService } from "../database/querybuilder.service";

@Injectable()
export class ArticleService {
  private readonly databaseService: DatabaseService;
  private readonly qb: QuerybuilderService;

  constructor(databaseService: DatabaseService, qb: QuerybuilderService) {
    this.databaseService = databaseService;
    this.qb = qb;
  }

  async listAll({
    categoryIds,
    options,
  }: {
    categoryIds?: string[];
    options?: { includeUser?: boolean };
  } = {}) {
    const { query, meta } = await this.qb.query({
      model: "Article",
      where: {
        isPublished: true,
        ...(categoryIds &&
          categoryIds.length > 0 && {
            categories: {
              some: {
                id: { in: categoryIds },
              },
            },
          }),
      },
      mergeWhere: true,
    });
    const data = await this.databaseService.prisma.article.findMany({
      ...query,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        ...(options?.includeUser && {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        }),
      },
    });
    return { data, meta };
  }

  async listMy({
    userId,
    search,
    categoryIds,
  }: {
    userId: string;
    search?: string;
    categoryIds?: string[];
  }) {
    const { query, meta } = await this.qb.query({
      model: "Article",
      where: {
        userId,
        OR: [
          { title: { contains: search ?? "", mode: "insensitive" } },
          { description: { contains: search ?? "", mode: "insensitive" } },
        ],
        ...(categoryIds &&
          categoryIds.length > 0 && {
            categories: {
              some: {
                id: { in: categoryIds },
              },
            },
          }),
      },
      mergeWhere: true,
    });
    const data = await this.databaseService.prisma.article.findMany({
      ...query,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
    return { data, meta };
  }

  async getById(id: string, options?: { includeUser?: boolean }) {
    const article = await this.databaseService.prisma.article.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        ...(options?.includeUser && {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        }),
      },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    return article;
  }

  async create(
    userId: string,
    data: {
      title: string;
      description: string;
      isPublished: boolean;
      categoryIds?: string[];
    }
  ) {
    const { categoryIds, ...articleData } = data;
    return await this.databaseService.prisma.article.create({
      data: {
        ...articleData,
        userId,
        ...(categoryIds &&
          categoryIds.length > 0 && {
            categories: {
              connect: categoryIds.map((id) => ({ id })),
            },
          }),
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async update(
    userId: string,
    id: string,
    data: {
      title?: string;
      description?: string;
      isPublished: boolean;
      categoryIds?: string[];
    }
  ) {
    const article = await this.databaseService.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    if (article.userId !== userId) {
      throw new ForbiddenException("You can only edit your own articles");
    }

    const { categoryIds, ...articleData } = data;

    return await this.databaseService.prisma.article.update({
      where: { id },
      data: {
        ...articleData,
        ...(categoryIds !== undefined && {
          categories: {
            set: [], // First disconnect all
            connect: categoryIds.map((categoryId) => ({ id: categoryId })), // Then connect new ones
          },
        }),
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    const article = await this.databaseService.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    if (article.userId !== userId) {
      throw new ForbiddenException("You can only delete your own articles");
    }

    return await this.databaseService.prisma.article.delete({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }
}
