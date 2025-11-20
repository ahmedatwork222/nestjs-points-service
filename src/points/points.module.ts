import { Module } from '@nestjs/common';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';

/**
 * Points Feature Module
 * Encapsulates all points-related functionality
 * 
 * Controllers: Handle HTTP requests and responses
 * Providers: Services that contain business logic (injected via dependency injection)
 */
@Module({
  controllers: [PointsController], // Registers the controller to handle /points routes
  providers: [PointsService],      // Makes PointsService available for dependency injection
})
export class PointsModule {}

