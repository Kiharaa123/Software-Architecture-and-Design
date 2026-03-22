import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { RideService } from './ride.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CreateRideDto,
  UpdateRideStatusDto,
  RideDto,
  RidePriceResponseDto,
} from './ride.dto';
import {
  ApiGetResponse,
  ApiPostResponse,
  ApiPutResponse,
} from 'src/common/decorators/api-response.decorator';
import { VehicleType } from '@prisma/client';

@ApiTags('rides')
@Controller('rides')
export class RideController {
  constructor(private readonly rideService: RideService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ride' })
  @ApiPostResponse(RideDto, 'Ride has been created successfully')
  async createRide(@Body() createRideDto: CreateRideDto): Promise<RideDto> {
    return this.rideService.createRide(createRideDto);
  }

  @Put('status')
  @ApiOperation({ summary: 'Update ride status' })
  @ApiPutResponse(RideDto, 'Ride status updated')
  async updateRideStatus(
    @Body() updateRideStatusDto: UpdateRideStatusDto,
  ): Promise<RideDto> {
    return this.rideService.updateRideStatus(updateRideStatusDto);
  }

  @Get('price')
  @ApiOperation({ summary: 'Calculate ride price' })
  @ApiQuery({
    name: 'pickupLat',
    required: true,
    description: 'Pickup latitude',
  })
  @ApiQuery({
    name: 'pickupLng',
    required: true,
    description: 'Pickup longitude',
  })
  @ApiQuery({
    name: 'dropoffLat',
    required: true,
    description: 'Dropoff latitude',
  })
  @ApiQuery({
    name: 'dropoffLng',
    required: true,
    description: 'Dropoff longitude',
  })
  @ApiQuery({
    name: 'vehicleType',
    enum: VehicleType,
    required: false,
    description: 'Vehicle type',
  })
  @ApiGetResponse(RidePriceResponseDto, 'Returns calculated price information')
  async calculatePrice(
    @Query('pickupLat') pickupLat: number,
    @Query('pickupLng') pickupLng: number,
    @Query('dropoffLat') dropoffLat: number,
    @Query('dropoffLng') dropoffLng: number,
    @Query('vehicleType') vehicleType?: VehicleType,
  ): Promise<RidePriceResponseDto> {
    // Log input params for debugging
    console.log('Calculating price with params:', {
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      vehicleType,
    });

    // Explicitly convert string params to numbers
    return this.rideService.calculateRidePrice(
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      vehicleType,
    );
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get rides for a customer' })
  @ApiGetResponse([RideDto], 'Returns customer rides')
  async getCustomerRides(
    @Param('customerId') customerId: string,
  ): Promise<RideDto[]> {
    return this.rideService.getCustomerRides(customerId);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Get rides for a driver' })
  @ApiGetResponse([RideDto], 'Returns driver rides')
  async getDriverRides(
    @Param('driverId') driverId: string,
  ): Promise<RideDto[]> {
    return this.rideService.getDriverRides(driverId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ride by ID' })
  @ApiGetResponse(RideDto, 'Returns ride information')
  async getRideById(@Param('id') id: string): Promise<RideDto> {
    return this.rideService.getRideById(id);
  }
}
