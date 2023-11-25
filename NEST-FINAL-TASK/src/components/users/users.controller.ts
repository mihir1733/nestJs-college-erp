import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { serialize } from '../../utils/interceptors/serialize.interceptor';
import { ShowUserDto } from './dtos/show-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { LogInUserDto } from './dtos/logIn-user.to';
import { AuthService } from '../auth/auth.service';
import { AuthGuard, ExtendedRequest } from '../../utils/guards/auth.guard';
import { RoleGuard } from '../../utils/guards/role.guard';
import { UserDocument } from './user.schema';
import { AdminRouteGuard } from '../../utils/guards/adminRoute.guard';

@Controller('users')
@serialize(ShowUserDto)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  /**
   * Create a new admin user.
   * @param {CreateUserDto} userBody - The data to create an admin user.
   * @returns {Promise<UserDocument>} - The created admin user.
   */
  @Post('/admin')
  @UseGuards(AdminRouteGuard)
  createAdmin(@Body() userBody: CreateUserDto): Promise<UserDocument> {
    userBody.role = 'admin';
    return this.userService.createUser(userBody);
  }

  /**
   * Create a new staff user.
   * @param {CreateUserDto} userBody - The data to create a staff user.
   * @returns {Promise<UserDocument>} - The created staff user.
   */
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  createStaff(@Body() userBody: CreateUserDto): Promise<UserDocument> {
    userBody.role = 'staff';
    return this.userService.createUser(userBody);
  }

  /**
   * Get a list of all users.
   * @returns {Promise<UserDocument[]>} - A list of all users.
   */
  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  getAllUsers(): Promise<UserDocument[]> {
    return this.userService.findUsers();
  }

  /**
   * Get a specific user by ID.
   * @param {string} id - The ID of the user to retrieve.
   * @returns {Promise<UserDocument>} - The retrieved user.
   */
  @Get('/:id')
  @UseGuards(AuthGuard, RoleGuard)
  getOneUser(@Param('id') id: string): Promise<UserDocument> {
    return this.userService.findUserById(id);
  }

  /**
   * Update a user by their ID.
   * @param {string} id - The ID of the user to update.
   * @param {UpdateUserDto} userBody - The updated user data.
   * @returns {Promise<UserDocument>} The updated user.
   */
  @Patch('/:id')
  @UseGuards(AuthGuard, RoleGuard)
  updateUser(
    @Param('id') id: string,
    @Body() userBody: UpdateUserDto,
  ): Promise<UserDocument> {
    return this.userService.updateUser(id, userBody);
  }

  /**
   * Delete a user by their ID.
   * @param {string} id - The ID of the user to delete.
   * @returns {Promise<UserDocument>} The deleted user.
   */

  @Delete('/:id')
  @UseGuards(AuthGuard, RoleGuard)
  deleteUser(@Param('id') id: string): Promise<UserDocument> {
    return this.userService.deleteUser(id);
  }

  /**
   * Log in a user using their email and password.
   * @param {LogInUserDto} userBody - The user's login credentials (email and password).
   * @returns {Promise<{ token: string }>} An object containing the access token.
   */

  @Post('/login')
  @HttpCode(200)
  logInUser(@Body() userBody: LogInUserDto): Promise<{ token: string }> {
    return this.authService.logIn(userBody.email, userBody.password);
  }

  /**
   * Log out the currently authenticated user.
   * @param {ExtendedRequest} req - The request object, which includes the user's information.
   * @returns {Promise<string>} A confirmation message.
   */
  @Post('/logout')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  logOutUser(@Request() req: ExtendedRequest): Promise<string> {
    return this.authService.logOut(req.id);
  }
}
