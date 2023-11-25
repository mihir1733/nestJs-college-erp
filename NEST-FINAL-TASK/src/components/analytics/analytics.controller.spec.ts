/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/user.schema';
import {
  Attendance,
  AttendanceDocument,
  AttendanceSchema,
} from '../attendances/attendance.schema';
import { Batch, BatchDocument, BatchSchema } from '../batches/batch.schema';
import {
  Student,
  StudentDocument,
  StudentSchema,
} from '../students/student.schema';
import { UsersModule } from '../users/users.module';
import { AttendancesModule } from '../attendances/attendances.module';
import { BatchesModule } from '../batches/batches.module';
import { AnalyticsService } from './analytics.service';
import { BatchRepository } from '../batches/batches.repository';
import { StudentsRepository } from '../students/students.repository';
import { AttendancesRepository } from '../attendances/attendances.repository';
import { CreateStudentDto } from '../students/dtos/create-student.dto';
import { CreateAttendanceDto } from '../attendances/dtos/create-attendance.dto';
import { CreateBatchDto } from '../batches/dtos/create-batch.dto';
import { StudentsRequestDto } from './dtos/absentStudentRequest.dto';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let batchRepo: BatchRepository;
  let studentRepo: StudentsRepository;
  let attendanceRepo: AttendancesRepository;

  let student1: StudentDocument;
  const mockStudent1: CreateStudentDto = {
    name: 'test1',
    phoneNumber: 1234567890,
    department: 'CE',
    batch: 2019,
    currentSemester: 6,
  };

  let student2: StudentDocument;
  const mockStudent2: CreateStudentDto = {
    name: 'test2',
    phoneNumber: 1234567890,
    department: 'ME',
    batch: 2019,
    currentSemester: 6,
  };

  let student3: StudentDocument;
  const mockStudent3: CreateStudentDto = {
    name: 'test3',
    phoneNumber: 1234567890,
    department: 'EC',
    batch: 2019,
    currentSemester: 6,
  };

  let attendance1: AttendanceDocument;
  const mockAttendnace1: CreateAttendanceDto = {
    student: '',
    isPresent: true,
    date: new Date('2023-11-05'),
  };

  let attendance2: AttendanceDocument;
  const mockAttendnace2: CreateAttendanceDto = {
    student: '',
    isPresent: true,
    date: new Date('2023-11-06'),
  };

  let attendance3: AttendanceDocument;
  const mockAttendnace3: CreateAttendanceDto = {
    student: '',
    isPresent: false,
    date: new Date('2023-11-05'),
  };

  let attendance4: AttendanceDocument;
  const mockAttendnace4: CreateAttendanceDto = {
    student: '',
    isPresent: false,
    date: new Date('2023-11-06'),
  };

  let attendance5: AttendanceDocument;
  const mockAttendnace5: CreateAttendanceDto = {
    student: '',
    isPresent: true,
    date: new Date('2023-11-05'),
  };

  let attendance6: AttendanceDocument;
  const mockAttendnace6: CreateAttendanceDto = {
    student: '',
    isPresent: true,
    date: new Date('2023-11-06'),
  };

  let batch: BatchDocument;
  const mockBatch: CreateBatchDto = {
    year: 2019,
    branches: [
      {
        name: 'CE',
        totalStudentsIntake: 80,
      },
      {
        name: 'ME',
        totalStudentsIntake: 80,
      },
      {
        name: 'EC',
        totalStudentsIntake: 80,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URL_TEST),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([
          { name: Attendance.name, schema: AttendanceSchema },
        ]),
        MongooseModule.forFeature([{ name: Batch.name, schema: BatchSchema }]),
        MongooseModule.forFeature([
          { name: Student.name, schema: StudentSchema },
        ]),
        UsersModule,
        BatchesModule,
        AttendancesModule,
      ],
      controllers: [AnalyticsController],
      providers: [AnalyticsService],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    batchRepo = module.get<BatchRepository>(BatchRepository);
    studentRepo = module.get<StudentsRepository>(StudentsRepository);
    attendanceRepo = module.get<AttendancesRepository>(AttendancesRepository);

    await attendanceRepo.clearDB();
    await studentRepo.clearDB();
    await batchRepo.clearDB();

    batch = await batchRepo.createBatch(mockBatch);

    student1 = await studentRepo.createStudent(mockStudent1);
    mockAttendnace1.student = student1._id.toString();
    mockAttendnace2.student = student1._id.toString();
    student2 = await studentRepo.createStudent(mockStudent2);
    mockAttendnace3.student = student2._id.toString();
    mockAttendnace4.student = student2._id.toString();
    student3 = await studentRepo.createStudent(mockStudent3);
    mockAttendnace5.student = student3._id.toString();
    mockAttendnace6.student = student3._id.toString();

    attendance1 = await attendanceRepo.createAttendance(mockAttendnace1);
    attendance2 = await attendanceRepo.createAttendance(mockAttendnace2);
    attendance3 = await attendanceRepo.createAttendance(mockAttendnace3);
    attendance4 = await attendanceRepo.createAttendance(mockAttendnace4);
    attendance5 = await attendanceRepo.createAttendance(mockAttendnace5);
    attendance6 = await attendanceRepo.createAttendance(mockAttendnace6);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get total number of students in a particular year', async () => {
    const result = await controller.getTotalStudentsAnalytics();
    expect(result[0].year).toBeGreaterThan(0);
  });

  it('should get list of absent students of the specific day ', async () => {
    const options: StudentsRequestDto = {
      specificDate: '2023-11-05',
    };
    const result = await controller.getAbsentStudentsList(options);
    expect(result[0].studentInfo).not.toBeNull();
  });

  it('should get list of absent students of the specific day by batch ', async () => {
    const options: StudentsRequestDto = {
      specificDate: '2023-11-05',
      batch: 2019,
    };
    const result = await controller.getAbsentStudentsList(options);
    expect(result[0].studentInfo.batch).toBe(2019);
  });

  it('should get list of absent students of the specific day by branch', async () => {
    const options: StudentsRequestDto = {
      specificDate: '2023-11-05',
      branch: 'ME',
    };
    const result = await controller.getAbsentStudentsList(options);
    expect(result[0].studentInfo.department).toBe('ME');
  });

  it('should get list of absent students of the specific day by semester', async () => {
    const options: StudentsRequestDto = {
      specificDate: '2023-11-05',
      semester: 6,
    };
    const result = await controller.getAbsentStudentsList(options);
    expect(result[0].studentInfo.currentSemester).toBe(6);
  });

  it('should get list of absent students of the specific day by (batch,semester,branch)', async () => {
    const options: StudentsRequestDto = {
      specificDate: '2023-11-05',
      batch: 2019,
      branch: 'ME',
      semester: 6,
    };
    const result = await controller.getAbsentStudentsList(options);
    expect(result[0].studentInfo.batch).toBe(2019);
    expect(result[0].studentInfo.department).toBe('ME');
    expect(result[0].studentInfo.currentSemester).toBe(6);
  });

  it('should give list of students whose attendance is less than 75%', async () => {
    const options: StudentsRequestDto = {
      specificDate: '2023-11-05',
    };
    const result = await controller.getLessAttendanceStudents(options);
    expect(result[0].attendancePercentage).toBeLessThanOrEqual(75);
  });

  it('should give list of students whose attendance is less than 75% by batch', async () => {
    const options: StudentsRequestDto = {
      specificDate: '2023-11-05',
      batch: 2019,
    };
    const result = await controller.getLessAttendanceStudents(options);
    expect(result[0].studentInfo.batch).toBe(2019);
  });

  it('should give list of students whose attendance is less than 75% by branch', async () => {
    const options: StudentsRequestDto = {
      specificDate: '2023-11-05',
      branch: 'ME',
    };
    const result = await controller.getLessAttendanceStudents(options);
    expect(result[0].studentInfo.department).toBe('ME');
  });

  it('should give list of students whose attendance is less than 75% by semester', async () => {
    const options: StudentsRequestDto = {
      specificDate: '2023-11-05',
      semester: 6,
    };
    const result = await controller.getLessAttendanceStudents(options);
    expect(result[0].studentInfo.currentSemester).toBe(6);
  });

  it('should give list of students whose attendance is less than 75% by (batch,branch,semester)', async () => {
    const options: StudentsRequestDto = {
      specificDate: '2023-11-05',
      batch: 2019,
      branch: 'ME',
      semester: 6,
    };
    const result = await controller.getLessAttendanceStudents(options);
    expect(result[0].studentInfo.batch).toBe(2019);
    expect(result[0].studentInfo.department).toBe('ME');
    expect(result[0].studentInfo.currentSemester).toBe(6);
  });

  it('should give list of vacant seats year wise', async () => {
    const options: StudentsRequestDto = {};
    const result = await controller.getVacantSeatsYearWise(options);
    expect(result[0].batch).toBeGreaterThan(0);
  });

  it('should give list of vacant seats year wise by batch', async () => {
    const options: StudentsRequestDto = {
      batch: 2019,
    };
    const result = await controller.getVacantSeatsYearWise(options);
    expect(result[0].batch).toBe(2019);
  });

  it('should give list of vacant seats year wise by branch', async () => {
    const options: StudentsRequestDto = {
      branch: 'ME',
    };
    const result = await controller.getVacantSeatsYearWise(options);
    expect(result[0].branches.ME).not.toBeNull();
  });

  it('should give list of vacant seats year wise by (branch,batch)', async () => {
    const options: StudentsRequestDto = {
      branch: 'ME',
      batch: 2019,
    };
    const result = await controller.getVacantSeatsYearWise(options);
    expect(result[0].batch).toBe(2019);
    expect(result[0].branches.ME).not.toBeNull();
  });
});
