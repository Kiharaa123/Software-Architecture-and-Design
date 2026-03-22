import { createZodDto } from 'nestjs-zod';
import { RideStatus, VehicleType } from '@prisma/client';
import {
  CreateRideSchema,
  UpdateRideStatusSchema,
  CalculateRidePriceSchema,
} from './ride.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DriverDto } from '../driver/driver.dto';
import { CustomerDto } from '../customer/customer.dto';

// Forward reference to avoid circular dependency
export class LocationDtoRef {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

// This is kept for other parts of the app that might use it
export class RideLocationDto {
  latitude: number;
  longitude: number;
  address: string;
}

export class CreateRideDto extends createZodDto(CreateRideSchema) {}

export class UpdateRideStatusDto extends createZodDto(UpdateRideStatusSchema) {}

export class CalculateRidePriceDto extends createZodDto(
  CalculateRidePriceSchema,
) {}

export class RideDto {
  id: string;
  customerId: string;
  customer: CustomerDto;
  driverId: string;
  driver: DriverDto;
  status: RideStatus;
  vehicleType: VehicleType;

  @ApiProperty({ type: () => [LocationDtoRef] })
  @Type(() => LocationDtoRef)
  locations: LocationDtoRef[];

  createdAt: Date;
  updatedAt: Date;
}

export class RidePriceResponseDto {
  distance: number;
  duration: number;
  price: number;
  currency: string;
}
