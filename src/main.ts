import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap function - Entry point of the application
 * This is called when the application starts
 */
async function bootstrap() {
  // Create a NestJS application instance using our root AppModule
  // This initializes all controllers, services, and dependencies
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS (Cross-Origin Resource Sharing)
  // Allows the API to be accessed from different domains/origins
  app.enableCors();
  
  // Get port from environment variable or default to 3000
  // Useful for deployment on platforms like Heroku, AWS, etc.
  const port = process.env.PORT || 3000;
  
  // Start the HTTP server and listen for incoming requests
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
}

// Start the application
bootstrap();

