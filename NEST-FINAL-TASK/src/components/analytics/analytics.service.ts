import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BatchInfo,
  BatchRepository,
  TotalStudentsAnalyticsResult,
} from '../batches/batches.repository';
import {
  AbsentStudentsAnalyticsResult,
  AttendanceAnalyticsResult,
  AttendancesRepository,
  randomMatch,
} from '../attendances/attendances.repository';
import { StudentsRequestDto } from './dtos/absentStudentRequest.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    private batchRepo: BatchRepository,
    private attendanceRepo: AttendancesRepository,
  ) {}

  /**
   * Calculate total students analytics including total students per year and per branch.
   * @returns {Promise<TotalStudentsAnalyticsResult[]>} - Total students analytics.
   */
  async totalStudentsAnalytics(): Promise<TotalStudentsAnalyticsResult[]> {
    try {
      const studentsAnalytics =
        await this.batchRepo.findTotalStudentsAnalytics();
      return studentsAnalytics;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Calculate absent students analytics based on the given criteria.
   * @param {StudentsRequestDto} request - The criteria for absent students analytics.
   * @returns {Promise<AbsentStudentsAnalyticsResult[]>} - Absent students analytics.
   */
  async absentStudentsAnalytics(
    request: StudentsRequestDto,
  ): Promise<AbsentStudentsAnalyticsResult[]> {
    try {
      const { specificDate, batch, branch, semester } = request;
      const match: randomMatch = {};
      if (batch) match.batch = Number(batch);
      if (branch) match.department = branch;
      if (semester) match.currentSemester = Number(semester);
      const absentStudents =
        await this.attendanceRepo.findAbsentStudentsAnalytics(
          specificDate,
          match,
        );
      return absentStudents;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Calculate students with less attendance(less than 75%) based on the given criteria.
   * @param {StudentsRequestDto} request - The criteria for students with less attendance.
   * @returns {Promise<AttendanceAnalyticsResult[]>} - Students with less attendance analytics.
   */
  async lessAttendanceStudents(
    request: StudentsRequestDto,
  ): Promise<AttendanceAnalyticsResult[]> {
    try {
      const { specificDate, batch, branch, semester } = request;
      const match: randomMatch = {};
      if (batch) match.batch = Number(batch);
      if (branch) match.department = branch;
      if (semester) match.currentSemester = Number(semester);
      const students = await this.attendanceRepo.findLessAttendanceStudents(
        specificDate,
        match,
      );
      return students;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Calculate vacant seats year-wise based on the given criteria.
   * @param {Partial<StudentsRequestDto>} request - The criteria for vacant seats year-wise.
   * @returns {Promise<BatchInfo[]>} - Vacant seats year-wise analytics.
   */
  async vacantSeatsYearWise(
    request: Partial<StudentsRequestDto>,
  ): Promise<BatchInfo[]> {
    try {
      const { batch, branch } = request;
      const match: randomMatch = {};
      if (batch) match.batch = Number(batch);
      if (branch) match.department = branch;
      const seatsData = await this.batchRepo.findVacantSeatsYearWise(match);
      return seatsData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
