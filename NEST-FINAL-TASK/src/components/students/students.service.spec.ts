/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { StudentsRepository } from './students.repository';
import { Student, StudentSchema, StudentDocument } from './student.schema';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BatchesModule } from '../batches/batches.module';
import { CreateStudentDto } from './dtos/create-student.dto';
import { CreateBatchDto } from '../batches/dtos/create-batch.dto';
import { BatchRepository } from '../batches/batches.repository';
import { BatchDocument } from '../batches/batch.schema';
import { NotFoundException } from '@nestjs/common';
import { UpdateStudentDto } from './dtos/update-student.dto';

describe('StudentsService', () => {
  let service: StudentsService;
  let studentRepo: StudentsRepository;
  let batchRepo: BatchRepository;

  const mockStudent: CreateStudentDto = {
    name: 'test',
    phoneNumber: 1234567890,
    department: 'CE',
    batch: 2019,
    currentSemester: 6,
  };

  const mockBatch: CreateBatchDto = {
    year: 2019,
    branches: [
      {
        name: 'CE',
        totalStudentsIntake: 120,
      },
      {
        name: 'ME',
        totalStudentsIntake: 120,
      },
      {
        name: 'EC',
        totalStudentsIntake: 60,
      },
    ],
  };

  let student: StudentDocument;
  let batch: BatchDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URL_TEST),
        MongooseModule.forFeature([
          { name: Student.name, schema: StudentSchema },
        ]),
        BatchesModule,
      ],
      providers: [StudentsService, StudentsRepository],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    studentRepo = module.get<StudentsRepository>(StudentsRepository);
    batchRepo = module.get<BatchRepository>(BatchRepository);

    await studentRepo.clearDB();
    await batchRepo.clearDB();

    batch = await batchRepo.createBatch(mockBatch);
    student = await studentRepo.createStudent(mockStudent);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create student', async () => {
    const mockStudent: CreateStudentDto = {
      name: 'mihir',
      phoneNumber: 1234567890,
      department: 'CE',
      batch: 2019,
      currentSemester: 6,
    };
    const student = await service.createStudent(mockStudent);
    expect(student).not.toBeNull();
  });

  it('should not create student , if batch not found', async () => {
    const mockStudent: CreateStudentDto = {
      name: 'mihir',
      phoneNumber: 1234567890,
      department: 'CE',
      batch: 2020,
      currentSemester: 6,
    };
    await expect(service.createStudent(mockStudent)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should not create student , if department not found', async () => {
    const mockStudent: CreateStudentDto = {
      name: 'mihir',
      phoneNumber: 1234567890,
      department: 'ROBOTICS',
      batch: 2020,
      currentSemester: 6,
    };
    await expect(service.createStudent(mockStudent)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update create student , if department not found', async () => {
    const studentBody: UpdateStudentDto = {
      name: 'mihir1',
      currentSemester: 5,
    };
    const updatedstudent = await service.updateStudent(
      student._id.toString(),
      studentBody,
    );
    expect(updatedstudent).not.toBeNull();

    //verifying
    expect(updatedstudent.name).toBe('mihir1');
    expect(updatedstudent.currentSemester).toBe(5);
  });

  it('should delete student', async () => {
    const deletedStudent = await service.deleteStudent(student._id.toString());
    await expect(
      service.findStudentById(deletedStudent._id.toString()),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find all students', async () => {
    const students = await service.findAllStudents();
    expect(students.length).toBeGreaterThanOrEqual(1);
  });

  it('should find student by id', async () => {
    const foundStudent = await service.findStudentById(student._id.toString());
    expect(foundStudent).not.toBeNull();
  });

  it('should not find student by invalid id', async () => {
    await expect(service.findStudentById('123456789123')).rejects.toThrow(
      NotFoundException,
    );
  });
});
