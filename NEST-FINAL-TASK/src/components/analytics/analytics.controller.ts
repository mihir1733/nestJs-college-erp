import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  BatchInfo,
  TotalStudentsAnalyticsResult,
} from '../batches/batches.repository';
import { StudentsRequestDto } from './dtos/absentStudentRequest.dto';
import {
  AbsentStudentsAnalyticsResult,
  AttendanceAnalyticsResult,
} from '../attendances/attendances.repository';
import { AuthGuard } from '../../utils/guards/auth.guard';

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Retrieve total students analytics including total students per year and per branch.
   * @returns {Promise<TotalStudentsAnalyticsResult[]>} - Total students analytics.
   */
  @Get('/students')
  getTotalStudentsAnalytics(): Promise<TotalStudentsAnalyticsResult[]> {
    return this.analyticsService.totalStudentsAnalytics();
  }

  /**
   * Retrieve absent students analytics based on the given criteria.
   * @param {StudentsRequestDto} request - The criteria for absent students analytics.
   * @returns {Promise<AbsentStudentsAnalyticsResult[]>} - Absent students analytics.
   */
  @Get('/absent-students')
  getAbsentStudentsList(
    @Query() request: StudentsRequestDto,
  ): Promise<AbsentStudentsAnalyticsResult[]> {
    return this.analyticsService.absentStudentsAnalytics(request);
  }

  /**
   * Retrieve students with less attendance(less than 75%) based on the given criteria.
   * @param {StudentsRequestDto} request - The criteria for students with less attendance.
   * @returns {Promise<AttendanceAnalyticsResult[]>} - Students with less attendance analytics.
   */
  @Get('/attendance')
  getLessAttendanceStudents(
    @Query() request: StudentsRequestDto,
  ): Promise<AttendanceAnalyticsResult[]> {
    return this.analyticsService.lessAttendanceStudents(request);
  }

  /**
   * Retrieve vacant seats year-wise based on the given criteria.
   * @param {Partial<StudentsRequestDto>} request - The criteria for vacant seats year-wise.
   * @returns {Promise<BatchInfo[]>} - Vacant seats year-wise analytics.
   */
  @Get('/seats')
  getVacantSeatsYearWise(
    @Query() request: Partial<StudentsRequestDto>,
  ): Promise<BatchInfo[]> {
    return this.analyticsService.vacantSeatsYearWise(request);
  }
}
