/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from './../src/app.module';
import {
  User,
  UserDocument,
  UserSchema,
} from '../src/components/users/user.schema';
import { CreateUserDto } from '../src/components/users/dtos/create-user.dto';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Batch,
  BatchDocument,
  BatchSchema,
} from '../src/components/batches/batch.schema';
import {
  Student,
  StudentDocument,
  StudentSchema,
} from '../src/components/students/student.schema';
import { UserRepository } from '../src/components/users/users.repository';
import { UsersController } from '../src/components/users/users.controller';
import { CreateStudentDto } from '../src/components/students/dtos/create-student.dto';
import { BatchRepository } from '../src/components/batches/batches.repository';
import { join } from 'path';
import * as fs from 'fs';
import { StudentsRepository } from '../src/components/students/students.repository';

describe('StudentsController (e2e)', () => {
  let app: INestApplication;
  let studentRepo: StudentsRepository;
  let userRepo: UserRepository;
  let batchRepo: BatchRepository;
  let userController: UsersController;

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

  let batch: BatchDocument;
  const mockBatch = {
    year: 2020,
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

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URL_TEST),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: Batch.name, schema: BatchSchema }]),
        MongooseModule.forFeature([
          { name: Student.name, schema: StudentSchema },
        ]),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepo = moduleFixture.get<UserRepository>(UserRepository);
    batchRepo = moduleFixture.get<BatchRepository>(BatchRepository);
    studentRepo = moduleFixture.get<StudentsRepository>(StudentsRepository);
    userController = moduleFixture.get<UsersController>(UsersController);
    await app.init();

    await studentRepo.clearDB();
    await userRepo.clearDB();
    await batchRepo.clearDB();

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
    student = await studentRepo.createStudent(mockStuent);
  });

  it('should create student by staff/admin', async () => {
    return request(app.getHttpServer())
      .post('/students/')
      .set('Authorization', `Bearer ${staff.token}`)
      .send({
        name: 'test1',
        phoneNumber: 1234567890,
        department: 'CE',
        batch: 2020,
        currentSemester: 6,
      })
      .expect(201);
  });

  it('should not create student if batch not found', async () => {
    return request(app.getHttpServer())
      .post('/students/')
      .set('Authorization', `Bearer ${staff.token}`)
      .send({
        name: 'test1',
        phoneNumber: 1234567890,
        department: 'CE',
        batch: 2021,
        currentSemester: 6,
      })
      .expect(404);
  });

  it('should not create student if branch not found', async () => {
    return request(app.getHttpServer())
      .post('/students/')
      .set('Authorization', `Bearer ${staff.token}`)
      .send({
        name: 'test1',
        phoneNumber: 1234567890,
        department: 'IT',
        batch: 2020,
        currentSemester: 6,
      })
      .expect(404);
  });

  it('should update student', async () => {
    const update = await request(app.getHttpServer())
      .patch(`/students/${student._id.toString()}`)
      .set('Authorization', `Bearer ${staff.token}`)
      .send({
        name: 'mihir',
      })
      .expect(200);

    //verifying
    expect(update.body.name).toBe('mihir');
  });

  it('should delete student', async () => {
    const deleted = await request(app.getHttpServer())
      .delete(`/students/${student._id.toString()}`)
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);

    //verifying
    const foundStudent = await studentRepo.findStudent(student._id);
    expect(foundStudent).toBeNull();
  });

  it('should get student by id', async () => {
    const getstudent = await request(app.getHttpServer())
      .get(`/students/${student._id}`)
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);

    //verifying
    expect(getstudent.body._id).toBe(student._id.toString());
  });

  it('should not get student by invalid id', async () => {
    const getstudent = await request(app.getHttpServer())
      .get('/students/123456789012')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(404);
  });

  it('should get all students', async () => {
    return request(app.getHttpServer())
      .get('/students/')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
  });
});
