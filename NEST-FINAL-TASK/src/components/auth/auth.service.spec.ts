import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from '../users/user.schema';
import { UserRepository } from '../users/users.repository';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UsersService } from '../users/users.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UsersService;
  let userRepo: UserRepository;

  const mockUser: CreateUserDto = {
    email: 'admin1@gmail.com',
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
        UsersModule,
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get<UserRepository>(UserRepository);
    userService = module.get<UsersService>(UsersService);

    await userRepo.clearDB();
    user = await userService.createUser(mockUser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should logIn user', async () => {
    const loggedInUser = await service.logIn(user.email, '1234');
    expect(loggedInUser.token).not.toBeNull();
  });

  it('should not logIn user', async () => {
    await expect(service.logIn(user.email, '126634')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('shoul logOut user', async () => {
    const loggedOut = await service.logOut(user._id.toString());
    expect(loggedOut).toBe('LoggedOut successfully..');
  });

  it('should not logOut user', async () => {
    await expect(service.logOut('123456789012')).rejects.toThrow(
      NotFoundException,
    );
  });
});
