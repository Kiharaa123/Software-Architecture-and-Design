import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserInput, UpdateUserInput, UserDto } from './user.dto';
import { normalizeEmail } from 'validator';
import { hash } from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../auth/auth.const';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser<T extends boolean>({
    id,
    email,
    includeCredentials,
  }: {
    id?: string;
    email?: string;
    includeCredentials?: T;
  }): Promise<
    T extends true
      ? UserDto & { password: string; refreshToken: string | null }
      : UserDto
  > {
    const logger = new Logger(`${this.constructor.name}:${this.getUser.name}`);

    if (!id && !email) {
      logger.error('No id or email provided');
      throw new BadRequestException();
    }

    const user = await this.prisma.user.findUnique({
      where: id ? { id } : { normalizedEmail: normalizeEmail(email) || email! },
      omit: {
        password: !includeCredentials,
        refreshToken: !includeCredentials,
      },
    });

    return user;
  }

  async createUser(input: CreateUserInput): Promise<UserDto> {
    const { email, password, role } = input;

    const user = await this.prisma.user.create({
      data: {
        ...input,
        role,
        email,
        password: await hash(password, BCRYPT_SALT_ROUNDS),
        normalizedEmail: normalizeEmail(email) || email,
      },
    });

    return user;
  }

  async updateUser({
    id,
    updates,
  }: {
    id: string;
    updates: UpdateUserInput;
  }): Promise<UserDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updates,
      omit: {
        password: true,
      },
    });

    return user;
  }

  async getCurrentCoordinates(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId },
      select: {
        currentLocation: true,
      },
    });
  }
}
