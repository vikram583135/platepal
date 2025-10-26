import { Controller, Post } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seeder')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  // This creates a POST endpoint at /seeder/seed
  @Post('seed')
  seed() {
    return this.seederService.seed();
  }
}
