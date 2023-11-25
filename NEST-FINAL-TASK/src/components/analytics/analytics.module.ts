import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { BatchesModule } from '../batches/batches.module';
import { AttendancesModule } from '../attendances/attendances.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [BatchesModule, AttendancesModule, UsersModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
