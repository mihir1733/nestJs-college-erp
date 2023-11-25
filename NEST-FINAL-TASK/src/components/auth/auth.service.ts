import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Log in a user with the provided email and password.
   *
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<{ token: string }>} - A token for the authenticated user.
   * @throws {NotFoundException} - Throws a NotFoundException if the user is not found.
   * @throws {UnauthorizedException} - Throws an UnauthorizedException if the credentials are invalid.
   * @throws {BadRequestException} - Throws a BadRequestException if there's an error during the login process.
   */
  async logIn(email: string, password: string): Promise<{ token: string }> {
    try {
      const user = await this.userService.findUserByEmail(email);
      if (!user) throw new NotFoundException('user not found');

      const match = await compare(password, user.password);
      if (!match) throw new UnauthorizedException('Invalid Credentials');

      const payload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      const token = await this.jwtService.signAsync(payload);

      user.token = token;
      await user.save();

      return { token };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof UnauthorizedException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Log out a user by clearing their authentication token.
   *
   * @param {string} id - The user's ID.
   * @returns {Promise<string>} - A message indicating successful logout.
   * @throws {NotFoundException} - Throws a NotFoundException if the user is not found.
   * @throws {BadRequestException} - Throws a BadRequestException if there's an error during the logout process.
   */
  async logOut(id: string): Promise<string> {
    try {
      const user = await this.userService.findUserById(id);
      if (!user) throw new NotFoundException('user not found');
      user.token = undefined;
      await user.save();
      return 'LoggedOut successfully..';
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }
}
