import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// 1. We import the ValidationPipe to enable automatic DTO validation.
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Create the main application instance, using our AppModule as the root.
  const app = await NestFactory.create(AppModule);

  // 2. Enable CORS (Cross-Origin Resource Sharing).
  // This is essential for allowing your frontend application (running on localhost:3000)
  // to make requests to this backend service (running on localhost:3003).
  app.enableCors();

  // 3. Enable the global validation pipe.
  // This tells NestJS to automatically use our DTOs (like CreateOrderDto)
  // to validate the body of every incoming request.
  app.useGlobalPipes(new ValidationPipe());

  // 4. Start the server and make it listen for requests on port 3003.
  // This unique port prevents conflicts with our other running services.
  await app.listen(3003);
}
// Run the bootstrap function to start the application.
bootstrap();

