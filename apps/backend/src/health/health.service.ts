import { Injectable } from "@nestjs/common";

@Injectable()
export class HealthService {
  healthCheck() {
    return "OK";
  }
}
