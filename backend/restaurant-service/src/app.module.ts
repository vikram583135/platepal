import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { SeederModule } from './seeder/seeder.module';
import { AuthModule } from './auth/auth.module';
import { MenusModule } from './menus/menus.module';

@Module({
  imports: [
    // --- Database Connections ---
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
    MongooseModule.forRoot(
      process.env.MONGO_URL || 'mongodb://platepal_mongo_user:your_mongo_password_123!@mongo_db:27017',
    ),

    // --- Feature Modules ---
    // This imports all the logic for handling restaurant and menu data.
    RestaurantsModule,
    
    // This imports our temporary seeder to populate the database.
    SeederModule,
    
    AuthModule,
    MenusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

