import { Module } from '@nestjs/common';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Batch, BatchSchema } from './batch.schema';
import { BatchRepository } from './batches.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Batch.name, schema: BatchSchema }]),
    UsersModule,
  ],
  controllers: [BatchesController],
  providers: [BatchesService, BatchRepository],
  exports: [BatchesService, BatchRepository],
})
export class BatchesModule {}
