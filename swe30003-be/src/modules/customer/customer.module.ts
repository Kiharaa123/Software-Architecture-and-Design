import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';

@Module({
  controllers: [CustomerController],
  exports: [CustomerService],
  providers: [CustomerService],
})
export class CustomerModule {}
