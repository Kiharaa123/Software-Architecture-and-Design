import { z } from 'zod';
import { RideStatus, VehicleType } from '@prisma/client';

export const CreateRideSchema = z.object({
  customerId: z.string().optional().describe('The ID of the customer'),
  pickupLatitude: z.number().describe('The latitude of the pickup location'),
  pickupLongitude: z.number().describe('The longitude of the pickup location'),
  pickupAddress: z.string().describe('The address of the pickup location'),
  dropoffLatitude: z.number().describe('The latitude of the dropoff location'),
  dropoffLongitude: z
    .number()
    .describe('The longitude of the dropoff location'),
  dropoffAddress: z.string().describe('The address of the dropoff location'),
  vehicleType: z
    .nativeEnum(VehicleType)
    .describe('The type of vehicle requested'),
});

export const UpdateRideStatusSchema = z.object({
  rideId: z.string().describe('The ID of the ride to update'),
  status: z.nativeEnum(RideStatus).describe('The new status of the ride'),
});

export const CalculateRidePriceSchema = z.object({
  pickupLat: z.number().describe('The latitude of the pickup location'),
  pickupLng: z.number().describe('The longitude of the pickup location'),
  dropoffLat: z.number().describe('The latitude of the dropoff location'),
  dropoffLng: z.number().describe('The longitude of the dropoff location'),
  vehicleType: z
    .nativeEnum(VehicleType)
    .optional()
    .describe('The type of vehicle requested'),
});
