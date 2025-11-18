import { Module } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { ORPCModule, onError } from "@orpc/nest";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
// import { AuthModule } from '@thallesp/nestjs-better-auth';
// import { auth } from '@my-better-t-app/auth';
import { TodoModule } from "./todo/todo.module";
import { HealthModule } from "./health/health.module";
@Module({
  imports: [
    ORPCModule.forRootAsync({
      // or .forRoot
      useFactory: (request: Request) => ({
        interceptors: [
          onError((error) => {
            console.error(error);
          }),
        ],
        context: { request }, // oRPC context, accessible from middlewares, etc.
        eventIteratorKeepAliveInterval: 5000, // 5 seconds
      }),
      inject: [REQUEST],
    }),
    TodoModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
