import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from './student.schema';
import { CreateStudentDto } from './dtos/create-student.dto';
import { UpdateStudentDto } from './dtos/update-student.dto';

@Injectable()
export class StudentsRepository {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
  ) {}

  /**
   * Create a new student.
   * @param {CreateStudentDto} studentBody - The data to create a student.
   * @returns {Promise<StudentDocument>} - The created student.
   */
  createStudent(studentBody: CreateStudentDto): Promise<StudentDocument> {
    return this.studentModel.create(studentBody);
  }

  /**
   * Retrieve a student by ID.
   * @param {Types.ObjectId} id - The ID of the student to retrieve.
   * @returns {Promise<StudentDocument>} - The retrieved student.
   */
  findStudent(id: Types.ObjectId): Promise<StudentDocument> {
    return this.studentModel.findById(id);
  }

  /**
   * Retrieve a list of all students.
   * @returns {Promise<StudentDocument[]>} - A list of all students.
   */
  findStudents(): Promise<StudentDocument[]> {
    return this.studentModel.find();
  }

  /**
   * Delete a student by ID.
   * @param {Types.ObjectId} id - The ID of the student to delete.
   * @returns {Promise<StudentDocument>} - The deleted student.
   */
  deleteStudent(id: Types.ObjectId): Promise<StudentDocument> {
    return this.studentModel.findByIdAndDelete(id);
  }

  /**
   * Update a student by ID.
   * @param {Types.ObjectId} id - The ID of the student to update.
   * @param {UpdateStudentDto} studentBody - The data to update the student.
   * @returns {Promise<StudentDocument>} - The updated student.
   */
  findStudentAndUpdate(
    id: Types.ObjectId,
    studentBody: UpdateStudentDto,
  ): Promise<StudentDocument> {
    return this.studentModel.findByIdAndUpdate(id, studentBody, { new: true });
  }

  clearDB() {
    return this.studentModel.deleteMany();
  }
}
