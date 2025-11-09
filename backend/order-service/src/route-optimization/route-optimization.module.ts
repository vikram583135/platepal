import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteOptimizationController } from './route-optimization.controller';
import { RouteOptimizationService } from './route-optimization.service';
import { Order } from '../orders/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [RouteOptimizationController],
  providers: [RouteOptimizationService],
  exports: [RouteOptimizationService],
})
export class RouteOptimizationModule {}

