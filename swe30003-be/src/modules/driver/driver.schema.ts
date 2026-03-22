import { z } from 'zod';

export const DriverLocationSchema = z.object({
  driverId: z.string().describe('The ID of the driver'),
  latitude: z.number().describe('The latitude coordinate'),
  longitude: z.number().describe('The longitude coordinate'),
  status: z
    .string()
    .optional()
    .describe('Optional status information about the driver'),
});

export const FindNearbyDriversSchema = z.object({
  latitude: z.number().describe('The latitude coordinate of the search center'),
  longitude: z
    .number()
    .describe('The longitude coordinate of the search center'),
  radius: z
    .number()
    .optional()
    .describe('Search radius in meters, defaults to 5000'),
});
