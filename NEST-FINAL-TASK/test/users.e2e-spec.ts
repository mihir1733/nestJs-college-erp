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

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userRepo: UserRepository;
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

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URL_TEST),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepo = moduleFixture.get<UserRepository>(UserRepository);
    userController = moduleFixture.get<UsersController>(UsersController);
    await app.init();
    await userRepo.clearDB();
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
  });

  it('should create new admin', async () => {
    return request(app.getHttpServer())
      .post('/users/admin')
      .set('accesskey', process.env.ADMIN_ROUTE_STRING)
      .send({
        email: 'admin1@g.com',
        password: 'admin',
        role: 'admin',
      })
      .expect(201);
  });

  it('should create new user by admin', async () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        email: 'staff1@g.com',
        password: 'staff',
        role: 'staff',
      })
      .expect(201);
  });

  it('should not create user by staff', async () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${staff.token}`)
      .send({
        email: 'staff@g.com',
        password: 'staff',
      })
      .expect(403);
  });

  it('should update user by admin', async () => {
    const update = await request(app.getHttpServer())
      .patch(`/users/${staff._id.toString()}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        email: 'staff12@g.com',
      })
      .expect(200);
    //verifying
    expect(update.body.email).toBe('staff12@g.com');
  });

  it('should not update user by staff', async () => {
    return request(app.getHttpServer())
      .patch(`/users/${staff._id.toString()}`)
      .set('Authorization', `Bearer ${staff.token}`)
      .send({
        email: 'staff12@g.com',
      })
      .expect(403);
  });

  it('should delete user by admin', async () => {
    const deleted = await request(app.getHttpServer())
      .delete(`/users/${staff._id.toString()}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    //verifying
    const user = await userRepo.findUserById(staff._id);
    expect(user).toBeNull();
  });

  it('should not delete user by staff', async () => {
    return request(app.getHttpServer())
      .delete(`/users/${staff._id.toString()}`)
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(403);
  });

  it('should get user by id by admin', async () => {
    return request(app.getHttpServer())
      .get(`/users/${staff._id.toString()}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
  });

  it('should not get user by invalid id by admin', async () => {
    return request(app.getHttpServer())
      .get('/users/123456789012')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(404);
  });

  it('should not get user by staff', async () => {
    return request(app.getHttpServer())
      .get(`/users/${staff._id.toString()}`)
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(403);
  });

  it('should get all users by admin', async () => {
    return request(app.getHttpServer())
      .get('/users/')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
  });

  it('should not get all users by staff', async () => {
    return request(app.getHttpServer())
      .get('/users/')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(403);
  });

  it('should logIn user', async () => {
    const logIn = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: admin.email,
        password: '1234',
      })
      .expect(200);

    //verifing
    expect(logIn.body.token).not.toBeNull();
  });

  it('should not logIn user for invalid creadentials', async () => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: admin.email,
        password: '456798',
      })
      .expect(401);
  });

  it('should logout user for loggeIn user', async () => {
    const logOut = await request(app.getHttpServer())
      .post('/users/logout')
      .set('Authorization', `Bearer ${staff.token}`)
      .expect(200);

    //verifying
    const user = await userRepo.findUserById(staff._id);
    expect(user.token).toBe(undefined);
  });

  it('should not logout user if user is not loggedIn yet', async () => {
    return request(app.getHttpServer()).post('/users/logout').expect(401);
  });
});
