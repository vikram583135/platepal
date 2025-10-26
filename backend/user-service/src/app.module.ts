import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // This establishes the master connection to your database for the entire service.
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres_db',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'platepal_user',
      password: process.env.DB_PASSWORD || 'your_strong_password_123!',
      database: process.env.DB_NAME || 'platepal_db',
      entities: [User],
      synchronize: true,
    }),
    // This registers your authentication module, making its routes and logic active.
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
