/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UserDocument } from '../src/components/users/user.schema';
import { CreateUserDto } from '../src/components/users/dtos/create-user.dto';
import { StudentDocument } from '../src/components/students/student.schema';
import { CreateStudentDto } from '../src/components/students/dtos/create-student.dto';
import { UsersController } from '../src/components/users/users.controller';
import { UserRepository } from '../src/components/users/users.repository';
import { StudentsRepository } from '../src/components/students/students.repository';
import { AttendanceDocument } from '../src/components/attendances/attendance.schema';
import { CreateAttendanceDto } from '../src/components/attendances/dtos/create-attendance.dto';
import { AttendancesRepository } from '../src/components/attendances/attendances.repository';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { join } from 'path';

describe('AttendancesController (e2e)', () => {
  let app: INestApplication;
  let studentRepo: StudentsRepository;
  let userRepo: UserRepository;
  let userController: UsersController;
  let attendanceRepo: AttendancesRepository;

  let staff: UserDocument;
  const mockStaff: CreateUserDto = {
    email: 'staff@g.com',
    password: '1234',
    role: 'staff',
  };

  let student: StudentDocument;
  const mockStuent: CreateStudentDto = {
    name: 'test',
    phoneNumber: 1234567890,
    department: 'CE',
    batch: 2020,
    currentSemester: 6,
  };

  let attendance: AttendanceDocument;
  const mockAttendance: CreateAttendanceDto = {
    student: '',
    isPresent: false,
    date: new Date('2023-11-05'),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepo = moduleFixture.get<UserRepository>(UserRepository);
    studentRepo = moduleFixture.get<StudentsRepository>(StudentsRepository);
    attendanceRepo = moduleFixture.get<AttendancesRepository>(
      AttendancesRepository,
    );
    userController = moduleFixture.get<UsersController>(UsersController);
    await app.init();
    await userRepo.clearDB();
    await attendanceRepo.clearDB();
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

    student = await studentRepo.createStudent(mockStuent);
    mockAttendance.student = student._id.toString();
    attendance = await attendanceRepo.createAttendance(mockAttendance);
  });

  it('should create attendance by staff/admin', async () => {
    return request(app.getHttpServer())
      .post('/attendances')
      .set('Authorization', `Bearer ${staff.token}`)
      .send({
        student: student._id.toString(),
        isPresent: false,
        date: new Date('2023-11-05'),
      })
      .expect(201);
  });

  it('should not create attendance by staff/admin if student not found', async () => {
    return request(app.getHttpServer())
      .post('/attendances')
      .set('Authorization', `Bearer ${staff.token}`)
      .send({
        student: '123456789012',
        isPresent: false,
        date: new Date('2023-11-05'),
      })
      .expect(400);
  });

  it('should update attendance by staff/admin ', async () => {
    const update = await request(app.getHttpServer())
      .patch(`/attendances/${attendance._id.toString()}`)
      .set('Authorization', `Bearer ${staff.token}`)
      .send({
        isPresent: true,
      })
      .expect(200);

    //verifying
    expect(update.body.isPresent).toBe(true);
  });

  it('should get all attendances of particular student', async () => {
    return request(app.getHttpServer())
      .get(`/attendances/student/${student._id.toString()}`)
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
  });

  it('should get all attendances', async () => {
    return request(app.getHttpServer())
      .get('/attendances')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
  });

  it('should get attendance by id', async () => {
    return request(app.getHttpServer())
      .get(`/attendances/${attendance._id.toString()}`)
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
  });

  it('should not get attendance by invalid id', async () => {
    return request(app.getHttpServer())
      .get('/attendances/123456789012')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(404);
  });
});
