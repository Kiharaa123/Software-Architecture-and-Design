import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email().describe('The email of the user'),
  password: z.string().min(6).max(255).describe('The password of the user'),
  address: z.string().optional().describe('The address of the user'),
  firstName: z.string().optional().describe('The first name of the user'),
  lastName: z.string().optional().describe('The last name of the user'),
  phone: z.string().optional().describe('The phone of the user'),
  profileImg: z.string().optional().describe('The profile image of the user'),
  role: z.nativeEnum(UserRole).optional().describe('The role of the user'),
});

export const UpdateUserSchema = z.object({
  email: z.string().email().optional().describe('The email of the user'),
  address: z.string().optional().describe('The address of the user'),
  firstName: z.string().optional().describe('The first name of the user'),
  lastName: z.string().optional().describe('The last name of the user'),
  phone: z.string().optional().describe('The phone of the user'),
  profileImg: z.string().optional().describe('The profile image of the user'),
  refreshToken: z.string().optional().describe('The refresh token of the user'),
});
