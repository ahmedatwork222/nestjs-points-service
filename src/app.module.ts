import { Module } from '@nestjs/common';
import { PointsModule } from './points/points.module';

/**
 * Root Application Module
 * This is the entry point module that NestJS uses to organize the application
 * It imports all feature modules (in this case, PointsModule)
 */
@Module({
  imports: [PointsModule], // Import the PointsModule which contains our business logic
})
export class AppModule {}

