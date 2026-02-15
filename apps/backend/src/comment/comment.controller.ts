import { contract } from "@my-better-t-app/contracts";
import { Controller, UnauthorizedException } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { CommentService } from "./comment.service";

@Controller()
export class CommentController {
  private readonly commentService: CommentService;
  constructor(commentService: CommentService) {
    this.commentService = commentService;
  }

  @AllowAnonymous()
  @Implement(contract.comment.listByArticle)
  listByArticle() {
    return implement(contract.comment.listByArticle).handler(({ input }) =>
      this.commentService.listByArticle(input.articleId)
    );
  }

  @Implement(contract.comment.create)
  create() {
    return implement(contract.comment.create).handler(
      ({ context, input }) => {
        const user = (context as { request?: { user?: { id: string } } })
          .request?.user;
        if (!user) {
          throw new UnauthorizedException("You must be logged in");
        }
        return this.commentService.create(
          user.id,
          input.articleId,
          input.content
        );
      }
    );
  }

  @Implement(contract.comment.update)
  update() {
    return implement(contract.comment.update).handler(
      ({ context, input }) => {
        const user = (context as { request?: { user?: { id: string } } })
          .request?.user;
        if (!user) {
          throw new UnauthorizedException("You must be logged in");
        }
        return this.commentService.update(user.id, input.id, input.content);
      }
    );
  }

  @Implement(contract.comment.delete)
  delete() {
    return implement(contract.comment.delete).handler(
      ({ context, input }) => {
        const user = (context as { request?: { user?: { id: string } } })
          .request?.user;
        if (!user) {
          throw new UnauthorizedException("You must be logged in");
        }
        return this.commentService.delete(user.id, input.id);
      }
    );
  }
}
