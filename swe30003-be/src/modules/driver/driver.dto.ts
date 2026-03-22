import { createZodDto } from 'nestjs-zod';
import { DriverLocationSchema, FindNearbyDriversSchema } from './driver.schema';
import { UserDto } from '../user/user.dto';

export class DriverLocationDto extends createZodDto(DriverLocationSchema) {
  driverId!: string;
}

export class FindNearbyDriversDto extends createZodDto(
  FindNearbyDriversSchema,
) {}

export class DriverDto {
  id: string;
  userId: string;
  user: UserDto;
  createdAt?: Date;
  updatedAt?: Date;
}

export class NearbyDriverDto {
  driverId: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  locationName?: string;
  latitude: number;
  longitude: number;
  distance: number;
}

export class DriverLocationUpdateResponseDto {
  success: boolean;
  message?: string;
}
