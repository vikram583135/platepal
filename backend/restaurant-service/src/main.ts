import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// It's a best practice to enable validation pipes from the start.
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS (Cross-Origin Resource Sharing) to allow your frontend
  // (running on localhost:3000) to communicate with this service.
  app.enableCors();

  // Enable global validation for any DTOs we will create in the future.
  app.useGlobalPipes(new ValidationPipe());

  // This is the crucial line that sets the port for this specific microservice.
  // We use 3002 to ensure it doesn't conflict with any other running service.
  await app.listen(3002);
}
bootstrap();

