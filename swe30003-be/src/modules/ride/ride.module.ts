import { Module } from '@nestjs/common';
import { RideService } from './ride.service';
import { RideController } from './ride.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DriverModule } from '../driver/driver.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [PrismaModule, DriverModule, LocationModule],
  controllers: [RideController],
  providers: [RideService],
  exports: [RideService],
})
export class RideModule {}
