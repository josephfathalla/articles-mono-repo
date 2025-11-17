import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthModule } from '@thallesp/nestjs-better-auth';
// import { auth } from '@my-better-t-app/auth';
import { TodoModule } from './todo/todo.module';
@Module({
  imports: [
TodoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
