import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';

interface classConstructor {
  // eslint-disable-next-line @typescript-eslint/ban-types
  new (...args: any[]): {};
}

/**
 * A decorator to serialize response data using the specified Data Transfer Object (DTO) class.
 * @param {classConstructor} dto - The DTO class used for serialization.
 * @returns {MethodDecorator & ClassDecorator} - A method and class decorator to apply the serialization interceptor.
 */
export function serialize(
  dto: classConstructor,
): MethodDecorator & ClassDecorator {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  /**
   * Intercepts the response and serializes the data using the provided DTO class.
   * @param {ExecutionContext} context - The execution context.
   * @param {CallHandler<any>} next - The next call handler.
   * @returns {Observable<any> | Promise<Observable<any>>} - An observable with the serialized data.
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        });
      }),
    );
  }
}
