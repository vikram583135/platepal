import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OpenAIService } from '../common/openai.service';

@Module({
  imports: [HttpModule],
  controllers: [OrdersController],
  providers: [OrdersService, OpenAIService],
  exports: [OrdersService],
})
export class OrdersModule {}

