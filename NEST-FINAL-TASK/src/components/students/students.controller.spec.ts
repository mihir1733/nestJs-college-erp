/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BatchesModule } from '../batches/batches.module';
import { Student, StudentDocument, StudentSchema } from './student.schema';
import { StudentsService } from './students.service';
import { StudentsRepository } from './students.repository';
import { UsersModule } from '../users/users.module';
import { CreateStudentDto } from './dtos/create-student.dto';
import { UpdateStudentDto } from './dtos/update-student.dto';
import { NotFoundException } from '@nestjs/common';

describe('StudentsController', () => {
  let controller: StudentsController;
  let studentRepo: StudentsRepository;

  let student: StudentDocument;

  const mockStudent: CreateStudentDto = {
    name: 'test',
    phoneNumber: 1234567890,
    department: 'CE',
    batch: 2019,
    currentSemester: 6,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URL_TEST),
        MongooseModule.forFeature([
          { name: Student.name, schema: StudentSchema },
        ]),
        BatchesModule,
        UsersModule,
      ],
      controllers: [StudentsController],
      providers: [StudentsService, StudentsRepository],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    studentRepo = module.get<StudentsRepository>(StudentsRepository);

    await studentRepo.clearDB();

    student = await studentRepo.createStudent(mockStudent);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create student', async () => {
    const mockUser: CreateStudentDto = {
      name: 'mihir',
      phoneNumber: 1234567890,
      department: 'CE',
      batch: 2019,
      currentSemester: 6,
    };
    const student = await controller.createStudent(mockStudent);
    expect(student).not.toBeNull();
  });

  it('should update student', async () => {
    const studentBody: UpdateStudentDto = {
      name: 'mihir1',
      currentSemester: 4,
    };
    const updatedStudent = await controller.updateStudent(
      student._id.toString(),
      studentBody,
    );
    expect(updatedStudent).not.toBeNull();

    //verifying
    expect(updatedStudent.name).toBe('mihir1');
    expect(updatedStudent.currentSemester).toBe(4);
  });

  it('should delete student', async () => {
    const deletedStudent = await controller.deleteStudent(
      student._id.toString(),
    );
    expect(deletedStudent).not.toBeNull();

    //verifying
    await expect(
      controller.getStudent(deletedStudent._id.toString()),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find all students', async () => {
    const students = await controller.getStudents();
    expect(students.length).toBeGreaterThanOrEqual(1);
  });

  it('should find student by id', async () => {
    const foundUser = await controller.getStudent(student._id.toString());
    expect(foundUser).not.toBeNull();
  });

  it('should not find student by invalid id', async () => {
    await expect(controller.getStudent('123456789879')).rejects.toThrow(
      NotFoundException,
    );
  });
});
