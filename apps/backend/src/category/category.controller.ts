import { contract } from "@my-better-t-app/contracts";
import { Controller, UnauthorizedException } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { CategoryService } from "./category.service";

@Controller()
export class CategoryController {
  private readonly categoryService: CategoryService;
  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  @AllowAnonymous()
  @Implement(contract.category.list)
  list() {
    return implement(contract.category.list).handler(
      async () => await this.categoryService.listAll()
    );
  }

  @Implement(contract.category.getById)
  getById() {
    return implement(contract.category.getById).handler(async ({ input }) =>
      this.categoryService.getById(input.categoryId)
    );
  }

  @Implement(contract.category.create)
  create() {
    return implement(contract.category.create).handler(({ context, input }) => {
      const user = (context as any).request.user;
      if (!user) {
        throw new UnauthorizedException("You must be logged in");
      }
      return this.categoryService.create(user.id, input);
    });
  }

  @Implement(contract.category.update)
  update() {
    return implement(contract.category.update).handler(({ context, input }) => {
      const user = (context as any).request.user;
      if (!user) {
        throw new UnauthorizedException("You must be logged in");
      }
      const { id, ...data } = input;
      return this.categoryService.update(user.id, id, data);
    });
  }

  @Implement(contract.category.delete)
  delete() {
    return implement(contract.category.delete).handler(({ context, input }) => {
      const user = (context as any).request.user;
      if (!user) {
        throw new UnauthorizedException("You must be logged in");
      }
      return this.categoryService.delete(user.id, input.id);
    });
  }
}
