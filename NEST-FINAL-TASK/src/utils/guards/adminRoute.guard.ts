import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export class AdminRouteGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.headers.accesskey === process.env.ADMIN_ROUTE_STRING) {
      return true;
    }
    throw new ForbiddenException('Only admins have rights to do this.');
  }
}
