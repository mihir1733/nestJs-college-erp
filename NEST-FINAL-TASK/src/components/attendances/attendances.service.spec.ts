import { Test, TestingModule } from '@nestjs/testing';
import { AttendancesService } from './attendances.service';
import {
  Attendance,
  AttendanceDocument,
  AttendanceSchema,
} from './attendance.schema';
import { AttendancesRepository } from './attendances.repository';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsModule } from '../students/students.module';
import { CreateAttendanceDto } from './dtos/create-attendance.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateAttendanceDto } from './dtos/update-attendance.dto';
import { StudentsRepository } from '../students/students.repository';
import { CreateStudentDto } from '../students/dtos/create-student.dto';
import { StudentDocument } from '../students/student.schema';

describe('AttendancesService', () => {
  let service: AttendancesService;
  let repo: AttendancesRepository;
  let studentRepo: StudentsRepository;

  const mockAttendance: CreateAttendanceDto = {
    student: '',
    isPresent: true,
    date: new Date('2023-11-02'),
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
      ],
      providers: [AttendancesService, AttendancesRepository],
    }).compile();

    service = module.get<AttendancesService>(AttendancesService);
    repo = module.get<AttendancesRepository>(AttendancesRepository);
    studentRepo = module.get<StudentsRepository>(StudentsRepository);

    await repo.clearDB();
    await studentRepo.clearDB();
    student = await studentRepo.createStudent(mockStudent);
    mockAttendance.student = student._id.toString();
    attendance = await repo.createAttendance(mockAttendance);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create attendance', async () => {
    const mockAttendance: CreateAttendanceDto = {
      student: student._id.toString(),
      isPresent: true,
      date: new Date('2023-11-02'),
    };
    const attendance = await service.createAttendace(mockAttendance);
    expect(attendance).not.toBeNull();
  });

  it('should not create attendance if student not found/invalid student id', async () => {
    const mockAttendance: CreateAttendanceDto = {
      student: '6548abb9831100cfd82be071',
      isPresent: true,
      date: new Date('2023-11-02'),
    };
    await expect(service.createAttendace(mockAttendance)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should update attendance', async () => {
    const attendanceBody: UpdateAttendanceDto = {
      isPresent: false,
    };
    const updatedStudent = await service.updateAttendance(
      attendance._id.toString(),
      attendanceBody,
    );
    expect(updatedStudent).not.toBeNull();

    //verifying
    expect(updatedStudent.isPresent).toBe(false);
  });

  it('should delete attendance', async () => {
    const deletedAttendance = await service.deleteAttendance(
      attendance._id.toString(),
    );
    await expect(
      service.findAttendanceById(deletedAttendance._id.toString()),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find attendance by id', async () => {
    const foundAttendace = await service.findAttendanceById(
      attendance._id.toString(),
    );
    expect(foundAttendace).not.toBeNull();
  });

  it('should not find attendance by invalid id', async () => {
    await expect(service.findAttendanceById('123456789987')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should find all attendances', async () => {
    const attendances = await service.findAttendances();
    expect(attendances.length).toBeGreaterThanOrEqual(1);
  });

  it('should find all attendance for particular student', async () => {
    const attendances = await service.findAttendanceOfStudent(
      student._id.toString(),
    );
    expect(attendances.length).toBeGreaterThanOrEqual(1);
  });

  it('should not find all attendance for unvalid student id', async () => {
    await expect(
      service.findAttendanceOfStudent('123456789987'),
    ).rejects.toThrow(NotFoundException);
  });
});
