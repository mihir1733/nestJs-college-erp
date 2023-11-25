import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StudentsRepository } from './students.repository';
import { CreateStudentDto } from './dtos/create-student.dto';
import { BatchesService } from '../batches/batches.service';
import { UpdateStudentDto } from './dtos/update-student.dto';
import mongoose from 'mongoose';
import { StudentDocument } from './student.schema';

@Injectable()
export class StudentsService {
  constructor(
    private studentRepo: StudentsRepository,
    private batchesService: BatchesService,
  ) {}

  /**
   * Create a new student.
   * @param {CreateStudentDto} studentbody - The data to create a student.
   * @returns {Promise<StudentDocument>} - The created student.
   */
  async createStudent(studentbody: CreateStudentDto): Promise<StudentDocument> {
    try {
      const batch = await this.batchesService.findBatchByYear(
        studentbody.batch,
      );
      if (!batch) throw new NotFoundException('batch not found');
      const dept = batch.branches.find(
        (branch) => studentbody.department === branch.name,
      );
      if (!dept) throw new NotFoundException('department not found');
      const student = await this.studentRepo.createStudent(studentbody);
      await student.save();
      dept.occupiedSeats += 1;
      await batch.save();
      return student;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Update a student by ID.
   * @param {string} id - The ID of the student to update.
   * @param {UpdateStudentDto} studentBody - The data to update the student.
   * @returns {Promise<StudentDocument>} - The updated student.
   */
  async updateStudent(
    id: string,
    studentBody: UpdateStudentDto,
  ): Promise<StudentDocument> {
    try {
      const student = await this.studentRepo.findStudentAndUpdate(
        new mongoose.Types.ObjectId(id),
        studentBody,
      );
      if (!student) throw new NotFoundException('student not found');
      return student;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Delete a student by ID.
   * @param {string} id - The ID of the student to delete.
   * @returns {Promise<StudentDocument>} - The deleted student.
   */
  async deleteStudent(id: string): Promise<StudentDocument> {
    try {
      const student = await this.studentRepo.deleteStudent(
        new mongoose.Types.ObjectId(id),
      );
      if (!student) throw new NotFoundException('student not found');
      const batch = await this.batchesService.findBatchByYear(student.batch);
      const dept = batch.branches.find(
        (branch) => student.department === branch.name,
      );
      if (dept.occupiedSeats > 0) dept.occupiedSeats -= 1;
      await batch.save();
      return student;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Find a student by ID.
   * @param {string} id - The ID of the student to find.
   * @returns {Promise<StudentDocument>} - The found student.
   */
  async findStudentById(id: string): Promise<StudentDocument> {
    try {
      const student = await this.studentRepo.findStudent(
        new mongoose.Types.ObjectId(id),
      );
      if (!student) throw new NotFoundException('student not found');
      return student;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Find all students.
   * @returns {Promise<StudentDocument[]>} - A list of all students.
   */
  async findAllStudents(): Promise<StudentDocument[]> {
    try {
      const students = await this.studentRepo.findStudents();
      if (!students.length) throw new NotFoundException('students not found');
      return students;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }
}
