/* c8 ignore start */
import type prismaClient from "@my-better-t-app/db";
import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";

type PrismaClient = typeof prismaClient;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private prismaClient: PrismaClient | null = null;

  private async loadClient() {
    if (!this.prismaClient) {
      const module = await import("@my-better-t-app/db");
      this.prismaClient = module.default;
    }
    return this.prismaClient;
  }

  get prisma(): PrismaClient {
    if (!this.prismaClient) {
      throw new Error("Prisma client is not initialized yet");
    }
    return this.prismaClient;
  }
  async onModuleInit() {
    const client = await this.loadClient();
    await client.$connect();
  }

  async onModuleDestroy() {
    if (this.prismaClient) {
      await this.prismaClient.$disconnect();
    }
  }
}
