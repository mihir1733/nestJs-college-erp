import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  default(): string {
    return 'App is running....';
  }
}
