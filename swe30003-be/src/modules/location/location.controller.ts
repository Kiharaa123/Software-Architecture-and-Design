import { Controller, Get, Query } from '@nestjs/common';
import { LocationService } from './location.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  DirectionsQueryDto,
  DirectionsResponseDto,
  DistanceResponseDto,
} from './location.dto';
import { ApiGetResponse } from 'src/common/decorators/api-response.decorator';

@ApiTags('location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('distance')
  @ApiOperation({ summary: 'Get distance between two points' })
  @ApiQuery({
    name: 'originLat',
    required: true,
    description: 'Origin latitude',
  })
  @ApiQuery({
    name: 'originLng',
    required: true,
    description: 'Origin longitude',
  })
  @ApiQuery({
    name: 'destinationLat',
    required: true,
    description: 'Destination latitude',
  })
  @ApiQuery({
    name: 'destinationLng',
    required: true,
    description: 'Destination longitude',
  })
  @ApiQuery({
    name: 'profile',
    required: false,
    description: 'Routing profile (driving, walking, cycling)',
  })
  @ApiGetResponse(
    DistanceResponseDto,
    'Returns distance and duration information',
  )
  async getDistance(
    @Query() query: DirectionsQueryDto,
  ): Promise<DistanceResponseDto> {
    return this.locationService.getDistance(
      query.originLat,
      query.originLng,
      query.destinationLat,
      query.destinationLng,
      query.profile,
    );
  }

  @Get('directions')
  @ApiOperation({ summary: 'Get directions between two points' })
  @ApiQuery({
    name: 'originLat',
    required: true,
    description: 'Origin latitude',
  })
  @ApiQuery({
    name: 'originLng',
    required: true,
    description: 'Origin longitude',
  })
  @ApiQuery({
    name: 'destinationLat',
    required: true,
    description: 'Destination latitude',
  })
  @ApiQuery({
    name: 'destinationLng',
    required: true,
    description: 'Destination longitude',
  })
  @ApiQuery({
    name: 'profile',
    required: false,
    description: 'Routing profile (driving, walking, cycling)',
  })
  @ApiGetResponse(
    DirectionsResponseDto,
    'Returns detailed directions information',
  )
  async getDirections(
    @Query() query: DirectionsQueryDto,
  ): Promise<DirectionsResponseDto> {
    const {
      originLat,
      originLng,
      destinationLat,
      destinationLng,
      profile,
      ...options
    } = query;

    return this.locationService.getDirections(
      originLat,
      originLng,
      destinationLat,
      destinationLng,
      profile,
      options,
    );
  }
}
