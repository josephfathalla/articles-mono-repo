import { $Enums } from "@my-better-t-app/db";
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { QuerybuilderService } from "../database/querybuilder.service";

@Injectable()
export class CategoryService {
  private readonly databaseService: DatabaseService;
  private readonly qb: QuerybuilderService;

  constructor(databaseService: DatabaseService, qb: QuerybuilderService) {
    this.databaseService = databaseService;
    this.qb = qb;
  }

  async listAll() {
    const { query, meta } = await this.qb.query({
      model: "Category",
    });
    const data = await this.databaseService.prisma.category.findMany({
      ...query,
      include: {
        createdByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return { data, meta };
  }

  async getById(id: string) {
    const category = await this.databaseService.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  async create(
    userId: string,
    data: { name: string; type: $Enums.CategoryType }
  ) {
    return await this.databaseService.prisma.category.create({
      data: {
        ...data,
        createdBy: userId,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    data: { name?: string; type?: $Enums.CategoryType }
  ) {
    const category = await this.databaseService.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    if (category.createdBy !== userId) {
      throw new ForbiddenException("You can only edit your own categories");
    }

    return await this.databaseService.prisma.category.update({
      where: { id },
      data,
    });
  }
  async delete(userId: string, id: string) {
    const category = await this.databaseService.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    if (category.createdBy !== userId) {
      throw new ForbiddenException("You can only delete your own categories");
    }

    return await this.databaseService.prisma.category.delete({
      where: { id },
    });
  }
}
