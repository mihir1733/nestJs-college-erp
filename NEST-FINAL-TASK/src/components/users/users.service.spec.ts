import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from './users.repository';
import { User, UserSchema, UserDocument } from './user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: UserRepository;

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
      ],
      providers: [UsersService, UserRepository],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<UserRepository>(UserRepository);

    await repo.clearDB();
    user = await repo.createUser(mockUser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user', async () => {
    const mockUser: CreateUserDto = {
      email: 'mihir@gmail.com',
      password: '1234',
      role: 'admin',
    };
    const user = await service.createUser(mockUser);
    expect(user).not.toBeNull();
  });

  it('should find user by id', async () => {
    const foundUser = await service.findUserById(user._id.toString());
    expect(foundUser).not.toBeNull();
  });

  it('should not find user by invalid id', async () => {
    await expect(service.findUserById('123456789010')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should find all users', async () => {
    const users = await service.findUsers();
    expect(users.length).toBeGreaterThanOrEqual(1);
  });

  it('should find user by email', async () => {
    const foundUser = await service.findUserByEmail(user.email);
    expect(foundUser).not.toBeNull();
  });

  it('should update user', async () => {
    const userBody: UpdateUserDto = {
      email: 'mihir1@gmail.com',
    };
    const updatedUser = await service.updateUser(user._id.toString(), userBody);
    expect(updatedUser).not.toBeNull();

    //verifying
    const email = updatedUser.email;
    expect(email).toBe('mihir1@gmail.com');
  });

  it('should delete user', async () => {
    const deletedUser = await service.deleteUser(user._id.toString());
    expect(deletedUser).not.toBeNull();

    //verifying
    await expect(
      service.findUserById(deletedUser._id.toString()),
    ).rejects.toThrow(NotFoundException);
  });
});
