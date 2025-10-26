import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS to allow the frontend (running on a different port) to communicate with this backend.
  app.enableCors();
  
  // We change the port to 3001 to avoid conflicts with:
  // - The restaurant-service (running on 3002)
  // - The restaurant-dashboard frontend (running on 3000)
  await app.listen(3001);
}
bootstrap();