import { Injectable, Type } from '@nestjs/common';
import { PrismaProvider } from './prisma.provider';

const ExtendedPrismaClient = class {
  constructor(provider: PrismaProvider) {
    return provider.withExtensions();
  }
} as Type<ReturnType<PrismaProvider['withExtensions']>>;

@Injectable()
export class PrismaService extends ExtendedPrismaClient {
  constructor(provider: PrismaProvider) {
    super(provider);
  }
}
