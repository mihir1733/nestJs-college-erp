import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ExtendedRequest } from '../guards/auth.guard';

@Injectable()
export class RoleGuard implements CanActivate {
  /**
   * Checks if the user has the 'admin' role to perform certain actions.
   * @param {ExecutionContext} context - The execution context.
   * @returns {boolean} - Returns true if the user has the 'admin' role; otherwise, throws a ForbiddenException.
   * @throws {ForbiddenException} - Throws a ForbiddenException if the user doesn't have the 'admin' role.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<ExtendedRequest>();
    if (request.role === 'admin') {
      return true;
    }
    throw new ForbiddenException('Only admins have rights to do this.');
  }
}
