/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  UserSchema,
} from '../src/components/users/user.schema';
import { UserRepository } from '../src/components/users/users.repository';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';
import * as fs from 'fs';
import { CreateUserDto } from '../src/components/users/dtos/create-user.dto';
import { UsersController } from '../src/components/users/users.controller';
import {
  Batch,
  BatchDocument,
  BatchSchema,
} from '../src/components/batches/batch.schema';
import { BatchRepository } from '../src/components/batches/batches.repository';

describe('BatchesController (e2e)', () => {
  let app: INestApplication;
  let userRepo: UserRepository;
  let batchRepo: BatchRepository;
  let userController: UsersController;

  let admin: UserDocument;
  const mockAdmin: CreateUserDto = {
    email: 'admin@g.com',
    password: '1234',
    role: 'admin',
  };

  let staff: UserDocument;
  const mockStaff: CreateUserDto = {
    email: 'staff@g.com',
    password: '1234',
    role: 'staff',
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
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepo = moduleFixture.get<UserRepository>(UserRepository);
    batchRepo = moduleFixture.get<BatchRepository>(BatchRepository);
    userController = moduleFixture.get<UsersController>(UsersController);
    await app.init();
    await userRepo.clearDB();
    await batchRepo.clearDB();
    admin = await userController.createAdmin(mockAdmin);
    const adminToken = jwt.sign(
      {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
      fs.readFileSync(join(__dirname, '../keys/Private.key')),
      { algorithm: 'RS256' },
    );
    admin.token = adminToken;
    await admin.save();

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
  });

  it('should create new batch by admin', async () => {
    return request(app.getHttpServer())
      .post('/batches')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
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
      })
      .expect(201);
  });

  it('should not create new batch by staff', async () => {
    return request(app.getHttpServer())
      .post('/batches')
      .set('Authorization', `Bearer ${staff.token}`)
      .send({
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
      })
      .expect(403);
  });

  it('should not get all batches without loggedIn', async () => {
    return request(app.getHttpServer()).get('/batches').expect(401);
  });

  it('should get all batches by staff/admin', async () => {
    return request(app.getHttpServer())
      .get('/batches')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);
  });
});
