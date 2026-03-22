import { createZodDto } from 'nestjs-zod';
import { UserRole } from '@prisma/client';
import { CreateUserSchema, UpdateUserSchema } from './user.schema';
import { LocationDtoRef } from '../ride/ride.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserDto {
  id: string;
  email: string;
  normalizedEmail?: string | null | undefined;
  address?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  profileImg?: string | null;
  role?: UserRole | null;

  @ApiProperty({ type: () => LocationDtoRef })
  @Type(() => LocationDtoRef)
  currentLocation?: LocationDtoRef;
}

export class CreateUserInput extends createZodDto(CreateUserSchema) {}

export class UpdateUserInput extends createZodDto(UpdateUserSchema) {}
