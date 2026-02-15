import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class CommentService {
  private readonly databaseService: DatabaseService;
  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }

  async listByArticle(articleId: string) {
    return await this.databaseService.prisma.comment.findMany({
      where: { articleId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async create(userId: string, articleId: string, content: string) {
    const article = await this.databaseService.prisma.article.findUnique({
      where: { id: articleId },
    });
    if (!article) {
      throw new NotFoundException("Article not found");
    }
    return this.databaseService.prisma.comment.create({
      data: {
        content,
        articleId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(userId: string, id: string, content: string) {
    const comment = await this.databaseService.prisma.comment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException("Comment not found");
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException("You can only edit your own comments");
    }
    return this.databaseService.prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(userId: string, id: string) {
    const comment = await this.databaseService.prisma.comment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException("Comment not found");
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException("You can only delete your own comments");
    }
    return this.databaseService.prisma.comment.delete({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
