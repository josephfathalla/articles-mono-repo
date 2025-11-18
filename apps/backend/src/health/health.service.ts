import { Injectable } from "@nestjs/common";

@Injectable()
export class HealthService {
  constructor() {}

  async healthCheck() {
    return "OK"
  }
}
