import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import { join } from 'path';
import { Request } from 'express';
import { UsersService } from '../../components/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  /**
   * Checks if a request is authorized based on the provided JWT token.
   * @param {ExecutionContext} context - The execution context.
   * @returns {Promise<boolean>} - A boolean indicating whether the request is authorized.
   * @throws {UnauthorizedException} - Throws an exception if the request is unauthorized.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();
    try {
      const privateKey = fs.readFileSync(
        join(__dirname, '../../../keys/Private.key'),
      );

      const payload = await this.jwtService.verifyAsync(token, {
        secret: privateKey,
      });
      const user = await this.userService.findUserById(payload.id);
      if (!user.token) throw new UnauthorizedException();
      request.id = payload.id;
      request.role = payload.role;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  /**
   * Extracts the JWT token from the request's authorization header.
   * @param {Request} request - The HTTP request object.
   * @returns {string | undefined} - The extracted JWT token or undefined if not found.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

export interface ExtendedRequest extends Request {
  id: string;
  email: string;
  role: string;
}
