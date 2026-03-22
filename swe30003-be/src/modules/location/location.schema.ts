import { z } from 'zod';

export const CreateLocationSchema = z.object({
  name: z.string().describe('The name or address of the location'),
  latitude: z.number().describe('The latitude coordinate'),
  longitude: z.number().describe('The longitude coordinate'),
});

export const LocationQuerySchema = z.object({
  latitude: z
    .number()
    .describe('The latitude coordinate for the search center'),
  longitude: z
    .number()
    .describe('The longitude coordinate for the search center'),
  radius: z
    .number()
    .optional()
    .describe('Search radius in meters, defaults to 5000'),
});

export const DirectionsQuerySchema = z.object({
  originLat: z.number().describe('The origin latitude'),
  originLng: z.number().describe('The origin longitude'),
  destinationLat: z.number().describe('The destination latitude'),
  destinationLng: z.number().describe('The destination longitude'),
  profile: z
    .string()
    .optional()
    .describe('The routing profile (driving, walking, cycling)'),
  alternatives: z
    .boolean()
    .optional()
    .describe('Return alternative routes if available'),
  steps: z.boolean().optional().describe('Include route steps in the response'),
  geometries: z
    .enum(['geojson', 'polyline'])
    .optional()
    .describe('Format of the returned geometry'),
  language: z
    .string()
    .optional()
    .describe('Language for instructions (e.g., en, es, fr)'),
});

export const GeocodeQuerySchema = z.object({
  address: z.string().describe('The address to geocode'),
});

export const ReverseGeocodeQuerySchema = z.object({
  latitude: z.number().describe('The latitude coordinate'),
  longitude: z.number().describe('The longitude coordinate'),
});
