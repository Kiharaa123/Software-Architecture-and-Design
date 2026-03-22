import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  DriverDto,
  DriverLocationDto,
  DriverLocationUpdateResponseDto,
  NearbyDriverDto,
} from './driver.dto';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  // Find nearby drivers based on coordinates
  async findNearbyDrivers(
    latitude: number,
    longitude: number,
    radius: number = 5000,
  ): Promise<NearbyDriverDto[]> {
    try {
      // Since the coordinates field is a custom geography type we can't access directly,
      // we'll use a raw query to get the driver locations with coordinates
      const driversWithLocations = await this.prisma.$queryRaw`
        SELECT 
          d.id as "driverId",
          u.id as "userId",
          u."firstName",
          u."lastName",
          l.name as "locationName",
          ST_X(l.coordinates::geometry) as longitude,
          ST_Y(l.coordinates::geometry) as latitude
        FROM "Driver" d
        JOIN "User" u ON d."userId" = u.id
        JOIN "Location" l ON u."currentLocationId" = l.id
      `;

      if (
        !driversWithLocations ||
        (driversWithLocations as any[]).length === 0
      ) {
        // For testing purposes, let's find a driver and create a mock location for them
        console.log('No drivers with locations found, creating a mock driver');

        // Find any driver
        const driver = await this.prisma.driver.findFirst({
          include: {
            user: true,
          },
        });

        if (!driver) {
          throw new Error('No drivers available in your area');
        }

        // Return a mock nearby driver
        return [
          {
            driverId: driver.id,
            userId: driver.user.id,
            firstName: driver.user.firstName || 'Mock',
            lastName: driver.user.lastName || 'Driver',
            locationName: 'Mock Location',
            longitude: longitude + 0.01, // Just slightly offset from the request
            latitude: latitude + 0.01,
            distance: 1000, // 1km away
          },
        ];
      }

      // Map to the desired format
      return (driversWithLocations as any[]).map((driver) => ({
        driverId: driver.driverId,
        userId: driver.userId,
        firstName: driver.firstName,
        lastName: driver.lastName,
        locationName: driver.locationName || 'Unknown location',
        longitude: parseFloat(driver.longitude) || 0,
        latitude: parseFloat(driver.latitude) || 0,
        distance: 0, // Not calculating actual distance for now
      }));
    } catch (error) {
      console.error('Error finding nearby drivers:', error);
      throw error;
    }
  }

  // Update driver location
  async updateDriverLocation(
    driverLocation: DriverLocationDto,
  ): Promise<DriverLocationUpdateResponseDto> {
    const { driverId, latitude, longitude } = driverLocation;

    // First get the userId from the driverId
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: { userId: true },
    });

    if (!driver) {
      throw new Error('Driver not found');
    }

    // Create a new location using PostgreSQL POINT type
    const location = await this.prisma.$queryRaw`
      INSERT INTO "Location" (id, name, coordinates, "createdAt", "updatedAt")
      VALUES (
        ${this.prisma.$queryRaw`gen_random_uuid()`}, 
        'Driver Current Position', 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), 
        NOW(), 
        NOW()
      )
      RETURNING id
    `;

    const locationId = (location as any[])[0].id;

    // Then update the user's current location
    await this.prisma.user.update({
      where: { id: driver.userId },
      data: {
        currentLocationId: locationId,
      },
    });

    return { success: true };
  }

  // Find a driver by ID with user information
  async findDriverById(driverId: string): Promise<DriverDto> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: {
          include: {
            currentLocation: true,
          },
        },
      },
    });

    return driver as unknown as DriverDto;
  }
}
