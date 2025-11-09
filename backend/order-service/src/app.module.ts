import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
// 1. Import the new OrdersModule
import { OrdersModule } from './orders/orders.module';
import { RouteOptimizationModule } from './route-optimization/route-optimization.module';
import { EarningsPredictionModule } from './earnings-prediction/earnings-prediction.module';
import { NotificationIntelligenceModule } from './notification-intelligence/notification-intelligence.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres_db',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'platepal_user',
      password: process.env.DB_PASSWORD || 'your_strong_password_123!',
      database: process.env.DB_NAME || 'platepal_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    // 2. Add OrdersModule to the application's imports
    OrdersModule,
    RouteOptimizationModule,
    EarningsPredictionModule,
    NotificationIntelligenceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

