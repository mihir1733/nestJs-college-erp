/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Attendance,
  AttendanceDocument,
  AttendanceSchema,
} from '../src/components/attendances/attendance.schema';
import {
  User,
  UserDocument,
  UserSchema,
} from '../src/components/users/user.schema';
import {
  Student,
  StudentDocument,
  StudentSchema,
} from '../src/components/students/student.schema';
import {
  Batch,
  BatchDocument,
  BatchSchema,
} from '../src/components/batches/batch.schema';
import { AttendancesRepository } from '../src/components/attendances/attendances.repository';
import { StudentsRepository } from '../src/components/students/students.repository';
import { BatchRepository } from '../src/components/batches/batches.repository';
import { CreateBatchDto } from '../src/components/batches/dtos/create-batch.dto';
import { UserRepository } from '../src/components/users/users.repository';
import { CreateStudentDto } from '../src/components/students/dtos/create-student.dto';
import { CreateAttendanceDto } from '../src/components/attendances/dtos/create-attendance.dto';
import { CreateUserDto } from '../src/components/users/dtos/create-user.dto';
import { join } from 'path';
import { UsersController } from '../src/components/users/users.controller';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';

describe('AnalyticsController (e2e)', () => {
  let app: INestApplication;
  let userRepo: UserRepository;
  let userController: UsersController;
  let attendanceRepo: AttendancesRepository;
  let studentRepo: StudentsRepository;
  let batchRepo: BatchRepository;

  let staff: UserDocument;
  const mockStaff: CreateUserDto = {
    email: 'staff@g.com',
    password: '1234',
    role: 'staff',
  };

  let student: StudentDocument;
  const mockStudent: CreateStudentDto = {
    name: 'test1',
    phoneNumber: 1234567890,
    department: 'CE',
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
    isPresent: false,
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
    const moduleFixture: TestingModule = await Test.createTestingModule({
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
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepo = moduleFixture.get<UserRepository>(UserRepository);
    userController = moduleFixture.get<UsersController>(UsersController);
    attendanceRepo = moduleFixture.get<AttendancesRepository>(
      AttendancesRepository,
    );
    studentRepo = moduleFixture.get<StudentsRepository>(StudentsRepository);
    batchRepo = moduleFixture.get<BatchRepository>(BatchRepository);
    await app.init();
    await userRepo.clearDB();
    await attendanceRepo.clearDB();
    await batchRepo.clearDB();
    await studentRepo.clearDB();

    staff = await userController.createStaff(mockStaff);
    const staffToken = jwt.sign(
      {
        id: staff._id.toString(),
        email: staff.email,
        role: staff.role,
      },
      fs.readFileSync(join(__dirname, '../keys/Private.key')),
      { algorithm: 'RS256' },
    );
    staff.token = staffToken;
    await staff.save();

    batch = await batchRepo.createBatch(mockBatch);
    student = await studentRepo.createStudent(mockStudent);
    mockAttendnace1.student = student._id.toString();
    mockAttendnace2.student = student._id.toString();
    attendance1 = await attendanceRepo.createAttendance(mockAttendnace1);
    attendance2 = await attendanceRepo.createAttendance(mockAttendnace2);
  });

  it('should get total number of students in a particular year', async () => {
    const data = await request(app.getHttpServer())
      .get('/analytics/students')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);

    //verifying
    expect(data.body[0].year).toBeGreaterThan(0);
  });

  it('should get list of absent students of the specific day ', async () => {
    const data = await request(app.getHttpServer())
      .get('/analytics/absent-students?specificDate=2023-11-06')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
    //verifying
    expect(data.body[0].studentInfo).not.toBeNull();
  });

  it('should get list of absent students of the specific day by batch', async () => {
    const data = await request(app.getHttpServer())
      .get('/analytics/absent-students?specificDate=2023-11-06&batch=2019')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
    //verifying
    expect(data.body[0].studentInfo.batch).toBe(2019);
  });

  it('should get list of absent students of the specific day by branch', async () => {
    const data = await request(app.getHttpServer())
      .get('/analytics/absent-students?specificDate=2023-11-06&branch=CE')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
    //verifying
    expect(data.body[0].studentInfo.department).toBe('CE');
  });

  it('should get list of absent students of the specific day by semester', async () => {
    const data = await request(app.getHttpServer())
      .get('/analytics/absent-students?specificDate=2023-11-06&semester=6')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
    //verifying
    expect(data.body[0].studentInfo.currentSemester).toBe(6);
  });

  it('should get list of students whose attendance is less than 75%', async () => {
    const data = await request(app.getHttpServer())
      .get('/analytics/attendance?specificDate=2023-11-07')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
    //verifying
    expect(data.body[0].attendancePercentage).toBeLessThan(75);
  });

  it('should get list of students whose attendance is less than 75% by batch', async () => {
    const data = await request(app.getHttpServer())
      .get('/analytics/attendance?specificDate=2023-11-07&batch=2019')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
    //verifying
    expect(data.body[0].studentInfo.batch).toBe(2019);
  });

  it('should get list of students whose attendance is less than 75% by branch', async () => {
    const data = await request(app.getHttpServer())
      .get('/analytics/attendance?specificDate=2023-11-07&branch=CE')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
    //verifying
    expect(data.body[0].studentInfo.department).toBe('CE');
  });

  it('should get list of students whose attendance is less than 75% by semester', async () => {
    const data = await request(app.getHttpServer())
      .get('/analytics/attendance?specificDate=2023-11-07&semester=6')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
    //verifying
    expect(data.body[0].studentInfo.currentSemester).toBe(6);
  });

  it('should get list of vacant seats year wise', async () => {
    const data = await request(app.getHttpServer())
      .get('/analytics/seats')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
    //verifying
    expect(data.body[0].batch).not.toBeNull();
  });

  it('should get list of vacant seats year wise by batch', async () => {
    const data = await request(app.getHttpServer())
      .get('/analytics/seats?batch=2019')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
    //verifying
    expect(data.body[0].batch).toBe(2019);
  });

  it('should get list of vacant seats year wise by branch', async () => {
    const data = await request(app.getHttpServer())
      .get('/analytics/seats?branch=CE')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
    //verifying
    expect(data.body[0].CE).not.toBeNull();
  });
});
