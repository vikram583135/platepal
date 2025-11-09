import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Put,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateMenuDto } from '../menus/dto/update-menu.dto';

// This decorator MUST be @Controller('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  findAll(@Query('ownerId') ownerId?: string) {
    return this.restaurantsService.findAll({ ownerId });
  }

  @Get(':id/menu')
  findMenu(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantsService.findMenu(id);
  }

  // This decorator MUST be @Put(':id/menu')
  @Put(':id/menu')
  @UseGuards(JwtAuthGuard)
  updateMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.restaurantsService.updateMenu(id, updateMenuDto);
  }

  // Admin endpoints
  @Get('pending-approval')
  getPendingApprovals() {
    return this.restaurantsService.getPendingApprovals();
  }

  @Post(':id/approve')
  approveRestaurant(@Param('id', ParseIntPipe) id: number, @Body() body: { notes?: string }) {
    return this.restaurantsService.approveRestaurant(id, body.notes);
  }

  @Post(':id/reject')
  rejectRestaurant(@Param('id', ParseIntPipe) id: number, @Body() body: { reason: string }) {
    return this.restaurantsService.rejectRestaurant(id, body.reason);
  }

  @Get('ai-screening')
  getAIScreenedApplications() {
    return this.restaurantsService.getAIScreenedApplications();
  }

  @Get('analytics/signup-trends')
  getSignupTrends(@Query('region') region?: string) {
    return this.restaurantsService.getSignupTrends(region);
  }

  @Post(':id/suspend')
  suspendRestaurant(@Param('id', ParseIntPipe) id: number, @Body() body: { reason: string }) {
    return this.restaurantsService.suspendRestaurant(id, body.reason);
  }
}