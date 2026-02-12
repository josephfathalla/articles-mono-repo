import { contract } from "@my-better-t-app/contracts";
import { Controller, UnauthorizedException } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ArticleService } from "./article.service";

@Controller()
export class ArticleController {
  private readonly articleService: ArticleService;
  constructor(articleService: ArticleService) {
    this.articleService = articleService;
  }

  @AllowAnonymous()
  @Implement(contract.article.list)
  list() {
    return implement(contract.article.list).handler(async ({ input }) =>
      this.articleService.listAll({ categoryIds: input.categoryIds })
    );
  }

  @AllowAnonymous()
  @Implement(contract.article.getById)
  getById() {
    return implement(contract.article.getById).handler(({ input }) =>
      this.articleService.getById(input.articleId)
    );
  }

  @Implement(contract.article.listMy)
  listMy() {
    return implement(contract.article.listMy).handler(({ context, input }) => {
      const user = (context as any).request.user;
      if (!user) {
        throw new UnauthorizedException("You must be logged in");
      }

      return this.articleService.listMy({
        userId: user.id,
        search: input.search,
        categoryIds: input.categoryIds,
      });
    });
  }

  @Implement(contract.article.create)
  create() {
    return implement(contract.article.create).handler(({ context, input }) => {
      const user = (context as any).request.user;
      if (!user) {
        throw new UnauthorizedException("You must be logged in");
      }
      return this.articleService.create(user.id, input);
    });
  }

  @Implement(contract.article.update)
  update() {
    return implement(contract.article.update).handler(({ context, input }) => {
      const user = (context as any).request.user;
      if (!user) {
        throw new UnauthorizedException("You must be logged in");
      }
      const { id, ...data } = input;
      return this.articleService.update(user.id, id, data);
    });
  }

  @Implement(contract.article.delete)
  delete() {
    return implement(contract.article.delete).handler(({ context, input }) => {
      const user = (context as any).request.user;
      if (!user) {
        throw new UnauthorizedException("You must be logged in");
      }
      return this.articleService.delete(input.id, user.id);
    });
  }
}
