import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationIntelligenceController } from './notification-intelligence.controller';
import { NotificationIntelligenceService } from './notification-intelligence.service';
import { Order } from '../orders/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [NotificationIntelligenceController],
  providers: [NotificationIntelligenceService],
  exports: [NotificationIntelligenceService],
})
export class NotificationIntelligenceModule {}

