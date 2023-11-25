import { Module } from '@nestjs/common';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './attendance.schema';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';
import { AttendancesRepository } from './attendances.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
    StudentsModule,
    UsersModule,
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService, AttendancesRepository],
  exports: [AttendancesRepository],
})
export class AttendancesModule {}
