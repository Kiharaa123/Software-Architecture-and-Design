import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// Mapbox Directions API response types
interface Route {
  distance: number;
  duration: number;
  geometry: any;
  legs: {
    steps: any[];
  }[];
}

@Injectable()
export class LocationService {
  private mapboxApiKey: string;
  private mapboxBaseUrl = 'https://api.mapbox.com';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.mapboxApiKey = this.configService.get<string>('MAPBOX_API_KEY') || '';
  }

  // Geocode an address to get coordinates
  async geocodeAddress(address: string) {
    const url = `${this.mapboxBaseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(
      address,
    )}.json?access_token=${this.mapboxApiKey}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const features = response.data.features;

    if (features && features.length > 0) {
      const [longitude, latitude] = features[0].center;
      return {
        latitude,
        longitude,
        address: features[0].place_name,
      };
    }

    throw new Error('Location not found');
  }

  // Reverse geocode coordinates to get address
  async reverseGeocode(latitude: number, longitude: number) {
    const url = `${this.mapboxBaseUrl}/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${this.mapboxApiKey}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const features = response.data.features;

    if (features && features.length > 0) {
      return {
        address: features[0].place_name,
        features: features,
      };
    }

    throw new Error('Address not found for these coordinates');
  }

  // Get distance and duration between two points
  async getDistance(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
    profile: string = 'driving',
  ) {
    console.log('originLat', originLat);
    console.log('originLng', originLng);
    console.log('destinationLat', destinationLat);
    console.log('destinationLng', destinationLng);

    // Validate inputs
    if (
      isNaN(originLat) ||
      isNaN(originLng) ||
      isNaN(destinationLat) ||
      isNaN(destinationLng)
    ) {
      console.error('Invalid coordinates provided', {
        originLat,
        originLng,
        destinationLat,
        destinationLng,
      });
      // Return a default response instead of throwing
      return {
        distanceMeters: 1000, // Default 1km
        distanceKm: 1,
        durationSeconds: 300, // Default 5 minutes
        durationMin: 5,
        geometry: null,
      };
    }

    try {
      const url = `${this.mapboxBaseUrl}/directions/v5/mapbox/${profile}/${originLng},${originLat};${destinationLng},${destinationLat}?access_token=${this.mapboxApiKey}`;
      console.log('url', url);

      const response = await firstValueFrom(this.httpService.get(url));
      console.log('API response status:', response.status);

      if (
        !response.data ||
        !response.data.routes ||
        response.data.routes.length === 0
      ) {
        console.error('No routes found in API response');
        // Return a default response based on straight-line distance
        const straightLineDistance = this.calculateStraightLineDistance(
          originLat,
          originLng,
          destinationLat,
          destinationLng,
        );
        return {
          distanceMeters: straightLineDistance * 1000,
          distanceKm: straightLineDistance,
          durationSeconds: straightLineDistance * 180, // Rough estimate: 3 min per km
          durationMin: straightLineDistance * 3,
          geometry: null,
        };
      }

      const route = response.data.routes[0] as Route;
      return {
        distanceMeters: route.distance,
        distanceKm: route.distance / 1000,
        durationSeconds: route.duration,
        durationMin: route.duration / 60,
        geometry: route.geometry,
      };
    } catch (error) {
      console.error('Error calculating distance:', error);
      // Fallback to a straight-line distance calculation
      const straightLineDistance = this.calculateStraightLineDistance(
        originLat,
        originLng,
        destinationLat,
        destinationLng,
      );
      return {
        distanceMeters: straightLineDistance * 1000,
        distanceKm: straightLineDistance,
        durationSeconds: straightLineDistance * 180, // Rough estimate: 3 min per km
        durationMin: straightLineDistance * 3,
        geometry: null,
      };
    }
  }

  // Calculate straight-line distance between two points using Haversine formula
  private calculateStraightLineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Get directions between two points
  async getDirections(
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number,
    profile: string = 'driving',
    options: {
      alternatives?: boolean;
      steps?: boolean;
      annotations?: string[];
      geometries?: 'geojson' | 'polyline';
      language?: string;
    } = {},
  ) {
    const defaultOptions = {
      alternatives: false,
      steps: true,
      annotations: ['duration', 'distance', 'speed'],
      geometries: 'geojson',
      language: 'en',
      ...options,
    };

    let url = `${this.mapboxBaseUrl}/directions/v5/mapbox/${profile}/${originLng},${originLat};${destinationLng},${destinationLat}?`;

    // Add query parameters
    const params = new URLSearchParams({
      access_token: this.mapboxApiKey,
      steps: defaultOptions.steps.toString(),
      geometries: defaultOptions.geometries as string,
      overview: 'full',
      alternatives: defaultOptions.alternatives.toString(),
      language: defaultOptions.language,
    });

    if (defaultOptions.annotations?.length) {
      params.append('annotations', defaultOptions.annotations.join(','));
    }

    url += params.toString();

    const response = await firstValueFrom(this.httpService.get(url));
    const routes = response.data.routes;

    if (routes && routes.length > 0) {
      const primaryRoute = routes[0] as Route;

      return {
        distance: primaryRoute.distance,
        duration: primaryRoute.duration,
        geometry: primaryRoute.geometry,
        steps: primaryRoute.legs[0]?.steps || [],
        alternatives: routes.length > 1 ? routes.slice(1) : [],
      };
    }

    throw new Error('Directions not found');
  }

  // Create a new location in the database
  async createLocation(name: string, latitude: number, longitude: number) {
    return this.prisma.location.create({
      data: {
        name,
        coordinates: {
          latitude,
          longitude,
        },
      },
    });
  }

  // Get location by ID
  async getLocationById(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    // Extract coordinates from the PostGIS point
    const coordinates = await this.prisma.$queryRaw`
      SELECT 
        ST_X(coordinates::geometry) as longitude,
        ST_Y(coordinates::geometry) as latitude
      FROM "Location"
      WHERE id = ${id}
    `;

    return {
      ...location,
      latitude: coordinates[0].latitude,
      longitude: coordinates[0].longitude,
    };
  }
}
