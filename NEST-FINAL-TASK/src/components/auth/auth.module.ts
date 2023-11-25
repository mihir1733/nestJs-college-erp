import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { join } from 'path';

const privateKey = fs.readFileSync(
  join(__dirname, '../../../keys/Private.key'),
);

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: privateKey,
      signOptions: { algorithm: 'RS256' },
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
