import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriverService } from '../driver/driver.service';
import { LocationService } from '../location/location.service';
import {
  CreateRideDto,
  RideDto,
  RidePriceResponseDto,
  UpdateRideStatusDto,
} from './ride.dto';
import { VehicleType } from '@prisma/client';

export interface RideLocation {
  latitude: number;
  longitude: number;
  address: string;
}

@Injectable()
export class RideService {
  constructor(
    private prisma: PrismaService,
    private driverService: DriverService,
    private locationService: LocationService,
  ) {}

  // Create a new ride
  async createRide(createRideDto: CreateRideDto): Promise<RideDto> {
    const {
      customerId,
      pickupLatitude,
      pickupLongitude,
      pickupAddress,
      dropoffLatitude,
      dropoffLongitude,
      dropoffAddress,
      vehicleType,
    } = createRideDto;

    let mockCustomerId;

    // Right now we are using mock customerId for testing. If there is no customerId, we will find the nearest available driver
    if (!customerId) {
      const firstCustomer = await this.prisma.customer.findFirst();
      mockCustomerId = firstCustomer.id;
    }

    // Just find the first driver for now instead of looking for nearby drivers
    const driver = await this.prisma.driver.findFirst({
      include: {
        user: true,
      },
    });

    if (!driver) {
      throw new Error('No drivers available');
    }

    // Create pickup location
    const pickupLoc = await this.prisma.$queryRaw`
      INSERT INTO "Location" (id, name, coordinates, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(), 
        ${pickupAddress}, 
        ST_SetSRID(ST_MakePoint(${pickupLongitude}, ${pickupLatitude}), 4326), 
        NOW(), 
        NOW()
      )
      RETURNING id, name
    `;
    const pickupLocId = (pickupLoc as any[])[0].id;

    // Create dropoff location
    const dropoffLoc = await this.prisma.$queryRaw`
      INSERT INTO "Location" (id, name, coordinates, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(), 
        ${dropoffAddress}, 
        ST_SetSRID(ST_MakePoint(${dropoffLongitude}, ${dropoffLatitude}), 4326), 
        NOW(), 
        NOW()
      )
      RETURNING id, name
    `;
    const dropoffLocId = (dropoffLoc as any[])[0].id;

    const { price } = await this.calculateRidePrice(
      pickupLatitude,
      pickupLongitude,
      dropoffLatitude,
      dropoffLongitude,
      vehicleType,
    );

    // Create the ride in the database
    const ride = await this.prisma.ride.create({
      data: {
        customerId: customerId || mockCustomerId,
        driverId: driver.id,
        vehicleType,
        status: 'PENDING',
        price,
        locations: {
          connect: [{ id: pickupLocId }, { id: dropoffLocId }],
        },
      },
      include: {
        driver: {
          include: {
            user: {
              include: {
                currentLocation: true,
              },
            },
          },
        },
        customer: {
          include: {
            user: true,
          },
        },
        locations: true,
      },
    });

    return ride as unknown as RideDto;
  }

  // Get a ride by ID
  async getRideById(rideId: string): Promise<RideDto> {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        driver: {
          include: {
            user: {
              include: {
                currentLocation: true,
              },
            },
          },
        },
        customer: {
          include: {
            user: true,
          },
        },
        locations: true,
      },
    });

    return ride as unknown as RideDto;
  }

  // Update ride status
  async updateRideStatus(
    updateRideStatusDto: UpdateRideStatusDto,
  ): Promise<RideDto> {
    const { rideId, status } = updateRideStatusDto;

    const ride = await this.prisma.ride.update({
      where: { id: rideId },
      data: { status },
      include: {
        driver: {
          include: {
            user: {
              include: {
                currentLocation: true,
              },
            },
          },
        },
        customer: {
          include: {
            user: true,
          },
        },
        locations: true,
      },
    });

    return ride as unknown as RideDto;
  }

  // Get all rides for a customer
  async getCustomerRides(customerId: string): Promise<RideDto[]> {
    const rides = await this.prisma.ride.findMany({
      where: { customerId },
      include: {
        driver: {
          include: {
            user: {
              include: {
                currentLocation: true,
              },
            },
          },
        },
        locations: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return rides as unknown as RideDto[];
  }

  // Get all rides for a driver
  async getDriverRides(driverId: string): Promise<RideDto[]> {
    const rides = await this.prisma.ride.findMany({
      where: { driverId },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        locations: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return rides as unknown as RideDto[];
  }

  // Calculate ride price based on distance and vehicle type
  async calculateRidePrice(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
    vehicleType?: VehicleType,
  ): Promise<RidePriceResponseDto> {
    // Get the distance between points
    const distance = await this.locationService.getDistance(
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
    );

    // Price calculation based on vehicle type
    let pricePerKm;
    switch (vehicleType) {
      case VehicleType.BIKE:
        pricePerKm = 0.5;
        break;
      case VehicleType.CAR:
        pricePerKm = 1.0;
        break;
      case VehicleType.LUXURY:
        pricePerKm = 2.5;
        break;
      default:
        pricePerKm = 1.0;
    }

    // Calculate price
    const price = Math.round(distance.distanceKm * pricePerKm * 100) / 100;

    return {
      distance: distance.distanceKm,
      duration: distance.durationMin,
      price,
      currency: 'USD',
    };
  }
}
