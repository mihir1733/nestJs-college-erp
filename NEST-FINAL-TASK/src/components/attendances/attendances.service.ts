import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendancesRepository } from './attendances.repository';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';
import mongoose from 'mongoose';
import { StudentsService } from '../students/students.service';
import { AttendanceDocument } from './attendance.schema';

@Injectable()
export class AttendancesService {
  constructor(
    private attendanceRepo: AttendancesRepository,
    private studentsService: StudentsService,
  ) {}

  /**
   * Create a new attendance entry.
   * @param {CreateAttendanceDto} attendanceBody - The attendance data to create.
   * @returns {Promise<AttendanceDocument>} - The created attendance entry.
   */
  async createAttendace(
    attendanceBody: CreateAttendanceDto,
  ): Promise<AttendanceDocument> {
    try {
      await this.studentsService.findStudentById(attendanceBody.student);
      const attendance =
        await this.attendanceRepo.createAttendance(attendanceBody);
      await attendance.save();
      return attendance;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Update an attendance entry by its ID.
   * @param {string} id - The ID of the attendance entry to update.
   * @param {UpdateAttendanceDto} attendanceBody - The attendance data to update.
   * @returns {Promise<AttendanceDocument>} - The updated attendance entry.
   */
  async updateAttendance(
    id: string,
    attendanceBody: UpdateAttendanceDto,
  ): Promise<AttendanceDocument> {
    try {
      const attendance = await this.attendanceRepo.findAndUpdateAttendance(
        new mongoose.Types.ObjectId(id),
        attendanceBody,
      );
      if (!attendance) throw new NotFoundException('attendance not found');
      return attendance;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Delete an attendance entry by its ID.
   * @param {string} id - The ID of the attendance entry to delete.
   * @returns {Promise<AttendanceDocument>} - The deleted attendance entry.
   */
  async deleteAttendance(id: string): Promise<AttendanceDocument> {
    try {
      const attendance = await this.attendanceRepo.deleteAttendance(
        new mongoose.Types.ObjectId(id),
      );
      if (!attendance) throw new NotFoundException('attendance not found');
      return attendance;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Find an attendance entry by its ID.
   * @param {string} id - The ID of the attendance entry to retrieve.
   * @returns {Promise<AttendanceDocument>} - The attendance entry with the specified ID.
   */
  async findAttendanceById(id: string): Promise<AttendanceDocument> {
    try {
      const attendance = await this.attendanceRepo.findAttendance(
        new mongoose.Types.ObjectId(id),
      );
      if (!attendance) throw new NotFoundException('attendance not found');
      return attendance;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Find all attendance entries.
   * @returns {Promise<AttendanceDocument[]>} - An array of attendance entries.
   */
  async findAttendances(): Promise<AttendanceDocument[]> {
    try {
      const attendances = await this.attendanceRepo.findAttendances();
      if (!attendances.length)
        throw new NotFoundException('attendances not found');
      return attendances;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Find all attendance entries for a specific student.
   * @param {string} studentId - The ID of the student to retrieve attendance for.
   * @returns {Promise<AttendanceDocument[]>} - An array of attendance entries for the specified student.
   */
  async findAttendanceOfStudent(
    studentId: string,
  ): Promise<AttendanceDocument[]> {
    try {
      const attendances = await this.attendanceRepo.findAttendancesOfStudent(
        new mongoose.Types.ObjectId(studentId),
      );
      if (!attendances.length)
        throw new NotFoundException('attendances not found');
      return attendances;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }
}
