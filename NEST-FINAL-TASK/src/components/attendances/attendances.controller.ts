import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';
import { AuthGuard } from '../../utils/guards/auth.guard';
import { AttendanceDocument } from './attendance.schema';

@Controller('attendances')
@UseGuards(AuthGuard)
export class AttendancesController {
  constructor(private attendancesService: AttendancesService) {}

  /**
   * Create a new attendance entry.
   * @param {CreateAttendanceDto} attendanceBody - The attendance data to create.
   * @returns {Promise<AttendanceDocument>} - The created attendance entry.
   */
  @Post()
  createAttendance(
    @Body() attendanceBody: CreateAttendanceDto,
  ): Promise<AttendanceDocument> {
    return this.attendancesService.createAttendace(attendanceBody);
  }

  /**
   * Get an attendance entry by its ID.
   * @param {string} id - The ID of the attendance entry to retrieve.
   * @returns {Promise<AttendanceDocument>} - The attendance entry with the specified ID.
   */
  @Get('/:id')
  getAttendance(@Param('id') id: string): Promise<AttendanceDocument> {
    return this.attendancesService.findAttendanceById(id);
  }

  /**
   * Get all attendance entries.
   * @returns {Promise<AttendanceDocument[]>} - An array of attendance entries.
   */
  @Get()
  getAttendances(): Promise<AttendanceDocument[]> {
    return this.attendancesService.findAttendances();
  }

  /**
   * Get all attendance entries for a specific student.
   * @param {string} id - The ID of the student to retrieve attendance for.
   * @returns {Promise<AttendanceDocument[]>} - An array of attendance entries for the specified student.
   */

  @Get('/student/:id')
  getAttendanceOfStudent(
    @Param('id') id: string,
  ): Promise<AttendanceDocument[]> {
    return this.attendancesService.findAttendanceOfStudent(id);
  }

  /**
   * Update an attendance entry by its ID.
   * @param {string} id - The ID of the attendance entry to update.
   * @param {UpdateAttendanceDto} attendanceBody - The attendance data to update.
   * @returns {Promise<AttendanceDocument>} - The updated attendance entry.
   */
  @Patch('/:id')
  updateAttendance(
    @Param('id') id: string,
    @Body() attendanceBody: UpdateAttendanceDto,
  ): Promise<AttendanceDocument> {
    return this.attendancesService.updateAttendance(id, attendanceBody);
  }

  /**
   * Delete an attendance entry by its ID.
   * @param {string} id - The ID of the attendance entry to delete.
   * @returns {Promise<AttendanceDocument>} - The deleted attendance entry.
   */
  @Delete('/:id')
  deleteAttendance(@Param('id') id: string): Promise<AttendanceDocument> {
    return this.attendancesService.deleteAttendance(id);
  }
}
