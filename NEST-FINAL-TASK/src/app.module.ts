import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './components/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppLoggerMiddleware } from './utils/middlewares/logger.middleware';
import { AuthModule } from './components/auth/auth.module';
import { BatchesModule } from './components/batches/batches.module';
import { StudentsModule } from './components/students/students.module';
import { AttendancesModule } from './components/attendances/attendances.module';
import { AnalyticsModule } from './components/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    UsersModule,
    AuthModule,
    BatchesModule,
    StudentsModule,
    AttendancesModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  /**
   * Configures middleware for the consumer.
   * @param {MiddlewareConsumer} consumer - The middleware consumer.
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
