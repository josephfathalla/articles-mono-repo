import { contract } from "@my-better-t-app/contracts";
import { Controller } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { HealthService } from "./health.service";
@AllowAnonymous()
@Controller()
export class HealthController {
  private readonly healthService: HealthService;
  constructor(healthService: HealthService) {
    this.healthService = healthService;
  }

  @Implement(contract.healthCheck)
  check() {
    return implement(contract.healthCheck).handler(async () =>
      this.healthService.healthCheck()
    );
  }
}
