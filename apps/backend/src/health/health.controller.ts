import { contract } from "@my-better-t-app/contracts";
import { Controller } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { HealthService } from "./health.service";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
@AllowAnonymous()
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Implement(contract.healthCheck)
  check(){
    return implement(contract.healthCheck).handler(async () =>
      this.healthService.healthCheck()
    )
  }
}
