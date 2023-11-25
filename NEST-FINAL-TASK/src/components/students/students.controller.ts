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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dtos/create-student.dto';
import { UpdateStudentDto } from './dtos/update-student.dto';
import { AuthGuard } from '../../utils/guards/auth.guard';
import { StudentDocument } from './student.schema';

@Controller('students')
@UseGuards(AuthGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  /**
   * Create a new student.
   * @param {CreateStudentDto} studentBody - The data to create a student.
   * @returns {Promise<StudentDocument>} - The created student.
   */
  @Post()
  createStudent(
    @Body() studentBody: CreateStudentDto,
  ): Promise<StudentDocument> {
    return this.studentsService.createStudent(studentBody);
  }

  /**
   * Retrieve a student by ID.
   * @param {string} id - The ID of the student to retrieve.
   * @returns {Promise<StudentDocument>} - The retrieved student.
   */
  @Get('/:id')
  getStudent(@Param('id') id: string): Promise<StudentDocument> {
    return this.studentsService.findStudentById(id);
  }

  /**
   * Retrieve a list of all students.
   * @returns {Promise<StudentDocument[]>} - A list of all students.
   */
  @Get()
  getStudents(): Promise<StudentDocument[]> {
    return this.studentsService.findAllStudents();
  }

  /**
   * Update a student by ID.
   * @param {string} id - The ID of the student to update.
   * @param {UpdateStudentDto} studentBody - The data to update the student.
   * @returns {Promise<StudentDocument>} - The updated student.
   */
  @Patch('/:id')
  updateStudent(
    @Param('id') id: string,
    @Body() studentBody: UpdateStudentDto,
  ): Promise<StudentDocument> {
    return this.studentsService.updateStudent(id, studentBody);
  }

  /**
   * Delete a student by ID.
   * @param {string} id - The ID of the student to delete.
   * @returns {Promise<StudentDocument>} - The deleted student.
   */
  @Delete('/:id')
  deleteStudent(@Param('id') id: string): Promise<StudentDocument> {
    return this.studentsService.deleteStudent(id);
  }
}
