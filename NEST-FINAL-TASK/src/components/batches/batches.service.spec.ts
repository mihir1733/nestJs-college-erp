import { Test, TestingModule } from '@nestjs/testing';
import { BatchesService } from './batches.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Batch, BatchDocument, BatchSchema } from './batch.schema';
import { BatchRepository } from './batches.repository';
import { CreateBatchDto } from './dtos/create-batch.dto';

describe('BatchesService', () => {
  let service: BatchesService;
  let repo: BatchRepository;

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
      ],
      providers: [BatchesService, BatchRepository],
    }).compile();

    service = module.get<BatchesService>(BatchesService);
    repo = module.get<BatchRepository>(BatchRepository);

    await repo.clearDB();
    batch = await repo.createBatch(mockBatch);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
    const batch = await service.createBatch(mockBatch);
    expect(batch).not.toBeNull();
  });

  it('should find all batches', async () => {
    const batches = await service.findBatches();
    expect(batches.length).toBeGreaterThanOrEqual(1);
  });

  it('should find batch by year', async () => {
    const foundBatch = await service.findBatchByYear(batch.year);
    expect(foundBatch.year).toBe(2019);
  });

  it('should find batch by id', async () => {
    const foundBatch = await service.findBatchById(batch._id.toString());
    expect(foundBatch).not.toBeNull();
  });
});
