import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Enable global validation for DTOs
  app.useGlobalPipes(new ValidationPipe());

  // Set global prefix for all routes
  app.setGlobalPrefix('ai');

  // Start server on port 3004
  await app.listen(3004);
  console.log('AI Service is running on: http://localhost:3004');
}
bootstrap();

