import { createZodDto } from 'nestjs-zod';
import {
  CreateLocationSchema,
  LocationQuerySchema,
  DirectionsQuerySchema,
} from './location.schema';
import { ApiProperty } from '@nestjs/swagger';

// Define coordinates type inline to avoid circular dependency
export class CoordinatesDto {
  latitude: number;
  longitude: number;
}

export class LocationDto {
  id: string;
  name: string;

  @ApiProperty({ type: () => CoordinatesDto })
  coordinates?: CoordinatesDto;

  createdAt?: Date;
  updatedAt?: Date;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export class CreateLocationDto extends createZodDto(CreateLocationSchema) {}

export class LocationQueryDto extends createZodDto(LocationQuerySchema) {}

export class DirectionsQueryDto extends createZodDto(DirectionsQuerySchema) {}

export class DistanceResponseDto {
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMin: number;
  geometry?: any;
}

export class StepManeuverDto {
  instruction: string;
  bearing_before: number;
  bearing_after: number;

  @ApiProperty({ type: 'array', items: { type: 'number' } })
  position: [number, number];

  type: string;
}

export class RouteStepDto {
  distance: number;
  duration: number;
  geometry: any;
  maneuver: StepManeuverDto;
  intersections?: Array<any>;
  name?: string;
}

export class RouteAlternativeDto {
  distance: number;
  duration: number;
  geometry: any;
  legs: Array<any>;
}

export class DirectionsResponseDto {
  distance: number;
  duration: number;
  geometry: any;
  steps: RouteStepDto[];
  alternatives?: RouteAlternativeDto[];
}
