import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { RouteOptimizationService } from './route-optimization.service';
import { PartnerLocation } from './order-batcher';

// DTOs
export class OptimizeRouteDto {
  batchId: string;
  lat: number;
  lng: number;
}

@Controller('route-optimization')
export class RouteOptimizationController {
  constructor(
    private readonly routeOptimizationService: RouteOptimizationService,
  ) {}

  @Get('available-batches')
  async getAvailableBatches(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('maxBatchSize') maxBatchSize?: string,
  ) {
    const partnerLocation: PartnerLocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    const batches = await this.routeOptimizationService.getAvailableBatches(
      partnerLocation,
      maxBatchSize ? parseInt(maxBatchSize, 10) : 3,
    );

    return {
      success: true,
      batches,
      count: batches.length,
    };
  }

  @Post('optimize-route')
  async optimizeRoute(@Body() dto: OptimizeRouteDto) {
    const partnerLocation: PartnerLocation = {
      lat: dto.lat,
      lng: dto.lng,
    };

    const route = await this.routeOptimizationService.optimizeRoute(
      dto.batchId,
      partnerLocation,
    );

    return {
      success: true,
      route,
    };
  }

  @Get('available-batches/:lat/:lng')
  async getAvailableBatchesByParams(
    @Param('lat') lat: string,
    @Param('lng') lng: string,
  ) {
    const partnerLocation: PartnerLocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    const batches = await this.routeOptimizationService.getAvailableBatches(
      partnerLocation,
    );

    return {
      success: true,
      batches,
      count: batches.length,
    };
  }
}

