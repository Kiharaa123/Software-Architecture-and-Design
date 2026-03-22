import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaProvider } from './prisma.provider';

@Global()
@Module({
  providers: [PrismaService, PrismaProvider],
  exports: [PrismaService, PrismaProvider],
})
export class PrismaModule {}
