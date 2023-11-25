/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AttendancesController } from './attendances.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsModule } from '../students/students.module';
import {
  Attendance,
  AttendanceDocument,
  AttendanceSchema,
} from './attendance.schema';
import { AttendancesService } from './attendances.service';
import { AttendancesRepository } from './attendances.repository';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { UsersModule } from '../users/users.module';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';
import { CreateStudentDto } from '../students/dtos/create-student.dto';
import { StudentsRepository } from '../students/students.repository';
import { StudentDocument } from '../students/student.schema';

describe('AttendancesController', () => {
  let controller: AttendancesController;
  let attendanceService: AttendancesService;
  let attendanceRepo: AttendancesRepository;
  let studentRepo: StudentsRepository;

  const mockAttendance: CreateAttendanceDto = {
    student: '',
    isPresent: true,
    date: new Date('2023-11-03'),
  };

  const mockStudent: CreateStudentDto = {
    name: 'test1',
    phoneNumber: 1234567890,
    department: 'CE',
    batch: 2019,
    currentSemester: 6,
  };

  let attendance: AttendanceDocument;
  let student: StudentDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URL_TEST),
        MongooseModule.forFeature([
          { name: Attendance.name, schema: AttendanceSchema },
        ]),
        StudentsModule,
        UsersModule,
      ],
      controllers: [AttendancesController],
      providers: [AttendancesService, AttendancesRepository],
    }).compile();

    controller = module.get<AttendancesController>(AttendancesController);
    attendanceService = module.get<AttendancesService>(AttendancesService);
    attendanceRepo = module.get<AttendancesRepository>(AttendancesRepository);
    studentRepo = module.get<StudentsRepository>(StudentsRepository);

    await attendanceRepo.clearDB();
    await studentRepo.clearDB();
    student = await studentRepo.createStudent(mockStudent);
    mockAttendance.student = student._id.toString();
    attendance = await attendanceRepo.createAttendance(mockAttendance);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create attendance', async () => {
    const mockAttendance: CreateAttendanceDto = {
      student: student._id.toString(),
      isPresent: false,
      date: new Date('2023-11-03'),
    };
    const attendance = await controller.createAttendance(mockAttendance);
    expect(attendance).not.toBeNull();
  });

  it('should not create attendance if student not found/invalid student id', async () => {
    const mockAttendance: CreateAttendanceDto = {
      student: '6548abb9831100cfd82be071',
      isPresent: true,
      date: new Date('2023-11-02'),
    };
    await expect(controller.createAttendance(mockAttendance)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should update attendance', async () => {
    const attendanceBody: UpdateAttendanceDto = {
      isPresent: false,
    };
    const updatedStudent = await controller.updateAttendance(
      attendance._id.toString(),
      attendanceBody,
    );
    expect(updatedStudent).not.toBeNull();

    //verifying
    expect(updatedStudent.isPresent).toBe(false);
  });

  it('should delete attendance', async () => {
    const deletedAttendance = await controller.deleteAttendance(
      attendance._id.toString(),
    );
    await expect(
      controller.getAttendance(deletedAttendance._id.toString()),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find attendance by id', async () => {
    const foundAttendace = await controller.getAttendance(
      attendance._id.toString(),
    );
    expect(foundAttendace).not.toBeNull();
  });

  it('should not find attendance by invalid id', async () => {
    await expect(controller.getAttendance('123456789987')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should find all attendances', async () => {
    const attendances = await controller.getAttendances();
    expect(attendances.length).toBeGreaterThanOrEqual(1);
  });

  it('should find all attendance for particular student', async () => {
    const attendances = await controller.getAttendanceOfStudent(
      student._id.toString(),
    );
    expect(attendances.length).toBeGreaterThanOrEqual(1);
  });

  it('should not find all attendance for unvalid student id', async () => {
    await expect(
      controller.getAttendanceOfStudent('123456789987'),
    ).rejects.toThrow(NotFoundException);
  });
});
