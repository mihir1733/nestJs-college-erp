/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { BatchesController } from './batches.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Batch, BatchDocument, BatchSchema } from './batch.schema';
import { BatchesService } from './batches.service';
import { BatchRepository } from './batches.repository';
import { CreateBatchDto } from './dtos/create-batch.dto';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

describe('BatchesController', () => {
  let controller: BatchesController;
  let batchRepo: BatchRepository;

  const mockBatch: CreateBatchDto = {
    year: 2019,
    branches: [
      {
        name: 'CE',
        totalStudentsIntake: 120,
      },
      {
        name: 'ME',
        totalStudentsIntake: 120,
      },
      {
        name: 'EC',
        totalStudentsIntake: 60,
      },
    ],
  };

  let batch: BatchDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URL_TEST),
        MongooseModule.forFeature([{ name: Batch.name, schema: BatchSchema }]),
        AuthModule,
        UsersModule,
      ],
      controllers: [BatchesController],
      providers: [BatchesService, BatchRepository],
    }).compile();

    controller = module.get<BatchesController>(BatchesController);
    batchRepo = module.get<BatchRepository>(BatchRepository);

    await batchRepo.clearDB();
    batch = await batchRepo.createBatch(mockBatch);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create batch', async () => {
    const mockBatch: CreateBatchDto = {
      year: 2020,
      branches: [
        {
          name: 'CE',
          totalStudentsIntake: 120,
        },
        {
          name: 'ME',
          totalStudentsIntake: 120,
        },
        {
          name: 'EC',
          totalStudentsIntake: 60,
        },
      ],
    };
    const batch = await controller.createBatch(mockBatch);
    expect(batch).not.toBeNull();
  });

  it('should get all batches', async () => {
    const batches = await controller.getBatches();
    expect(batches.length).toBeGreaterThanOrEqual(1);
  });
});
