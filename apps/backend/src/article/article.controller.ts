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
    return implement(contract.article.list).handler(async () =>
      this.articleService.listAll()
    );
  }

  @Implement(contract.article.listMy)
  listMy() {
    return implement(contract.article.listMy).handler(({ context }) => {
      const user = (context as any).request.user;
      if (!user) {
        throw new UnauthorizedException("You must be logged in");
      }
      return this.articleService.listMy(user.id);
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
}
