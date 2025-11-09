import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EarningsPredictionController } from './earnings-prediction.controller';
import { EarningsPredictionService } from './earnings-prediction.service';
import { Order } from '../orders/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [EarningsPredictionController],
  providers: [EarningsPredictionService],
  exports: [EarningsPredictionService],
})
export class EarningsPredictionModule {}

