import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { DriverService } from './driver.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  DriverDto,
  DriverLocationDto,
  FindNearbyDriversDto,
  NearbyDriverDto,
  DriverLocationUpdateResponseDto,
} from './driver.dto';
import {
  ApiGetResponse,
  ApiPutResponse,
} from 'src/common/decorators/api-response.decorator';

@ApiTags('drivers')
@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby drivers' })
  @ApiQuery({
    name: 'latitude',
    required: true,
    description: 'Current latitude',
  })
  @ApiQuery({
    name: 'longitude',
    required: true,
    description: 'Current longitude',
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    description: 'Search radius in meters',
  })
  @ApiGetResponse([NearbyDriverDto], 'Returns a list of nearby drivers')
  async findNearbyDrivers(
    @Query() query: FindNearbyDriversDto,
  ): Promise<NearbyDriverDto[]> {
    return this.driverService.findNearbyDrivers(
      query.latitude,
      query.longitude,
      query.radius,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get driver by ID' })
  @ApiGetResponse(DriverDto, 'Returns driver information')
  async findOne(@Param('id') id: string): Promise<DriverDto> {
    return this.driverService.findDriverById(id);
  }

  @Put('location')
  @ApiOperation({ summary: 'Update driver location' })
  @ApiPutResponse(DriverLocationUpdateResponseDto, 'Driver location updated')
  async updateLocation(
    @Body() driverLocation: DriverLocationDto,
  ): Promise<DriverLocationUpdateResponseDto> {
    return this.driverService.updateDriverLocation(driverLocation);
  }
}
