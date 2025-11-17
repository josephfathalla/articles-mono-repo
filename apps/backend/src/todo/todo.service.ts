import { Injectable } from '@nestjs/common';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {
    
  }
}
