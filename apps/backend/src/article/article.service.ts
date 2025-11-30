import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { QuerybuilderService } from "src/database/querybuilder.service";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class ArticleService {
  private readonly databaseService: DatabaseService;
  private readonly qb: QuerybuilderService;

  constructor(databaseService: DatabaseService, qb: QuerybuilderService) {
    this.databaseService = databaseService;
    this.qb = qb;
  }

  async listAll() {
    const { query, meta } = await this.qb.query({ model: "Article" });
    const data = await this.databaseService.prisma.article.findMany(query);
    return { data, meta };
  }

  async listMy(userId: string) {
    const { query, meta } = await this.qb.query({
      model: "Article",
      where: { userId },
      mergeWhere: true,
    });
    const data = await this.databaseService.prisma.article.findMany(query);
    return { data, meta };
  }

  async create(userId: string, data: { title: string; description: string }) {
    return await this.databaseService.prisma.article.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    data: { title?: string; description?: string }
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

    return await this.databaseService.prisma.article.update({
      where: { id },
      data,
    });
  }
}
