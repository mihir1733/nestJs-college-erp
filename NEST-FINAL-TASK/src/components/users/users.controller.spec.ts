import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from './user.schema';
import { UsersService } from './users.service';
import { UserRepository } from './users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { LogInUserDto } from './dtos/logIn-user.to';
import { NotFoundException } from '@nestjs/common';
import { ExtendedRequest } from '../../utils/guards/auth.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let userService: UsersService;
  let userRepo: UserRepository;

  const mockUser: CreateUserDto = {
    email: 'admin@gmail.com',
    password: '1234',
    role: 'admin',
  };

  let user: UserDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URL_TEST),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        AuthModule,
      ],
      controllers: [UsersController],
      providers: [UsersService, UserRepository],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);
    userRepo = module.get<UserRepository>(UserRepository);

    await userRepo.clearDB();
    user = await userService.createUser(mockUser);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create staff', async () => {
    const mockUser: CreateUserDto = {
      email: 'staff@gmail.com',
      password: '1234',
    };
    const user = await controller.createStaff(mockUser);
    expect(user).not.toBeNull();

    //verifying
    expect(user.role).toBe('staff');
  });

  it('should get one user', async () => {
    const foundUser = await controller.getOneUser(user._id.toString());
    expect(foundUser).not.toBeNull();
  });

  it('should get all users', async () => {
    const users = await controller.getAllUsers();
    expect(users.length).toBeGreaterThanOrEqual(1);
  });

  it('should update user', async () => {
    const userBody: UpdateUserDto = {
      email: 'staff1@gmail.com',
      password: '12345',
      role: '',
    };
    const updatedUser = await controller.updateUser(
      user._id.toString(),
      userBody,
    );
    expect(updatedUser).not.toBeNull();

    // verifying
    expect(updatedUser.email).toBe('staff1@gmail.com');
  });

  it('should delete user', async () => {
    const deletedUser = await controller.deleteUser(user._id.toString());
    expect(deletedUser).not.toBeNull();

    //verifying
    await expect(
      controller.getOneUser(deletedUser._id.toString()),
    ).rejects.toThrow(NotFoundException);
  });

  it('should logIn user', async () => {
    const userBody: LogInUserDto = {
      email: user.email,
      password: '1234',
    };
    const loggedInUser = await controller.logInUser(userBody);
    expect(loggedInUser.token).not.toBeNull();
    const req: ExtendedRequest = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    } as ExtendedRequest;
    const logOut = await controller.logOutUser(req);
    expect(logOut).toBe('LoggedOut successfully..');

    //verifying
    expect(user.token).toBe(undefined);
  });
});
