import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Batch, BatchDocument } from './batch.schema';
import { Aggregate, Model, Types } from 'mongoose';
import { CreateBatchDto } from './dtos/create-batch.dto';
import { randomMatch } from '../attendances/attendances.repository';

export type TotalStudentsAnalyticsResult = {
  totalStudents: number;
  year: number;
  branches: { [branch: string]: number };
};

export type BatchInfo = {
  batch: number;
  totalStudents: number;
  totalStudentsIntake: number;
  availableIntake: number;
  branches: {
    CE: {
      totalStudents: number;
      totalStudentsIntake: number;
      availableIntake: number;
    };
    ME: {
      totalStudents: number;
      totalStudentsIntake: number;
      availableIntake: number;
    };
  };
};

@Injectable()
export class BatchRepository {
  constructor(@InjectModel(Batch.name) private batchModel: Model<Batch>) {}

  /**
   * Create a new batch.
   * @param {CreateBatchDto} batchBody - The batch data to create.
   * @returns {Promise<BatchDocument>} - The created batch.
   */
  createBatch(batchBody: CreateBatchDto): Promise<BatchDocument> {
    return this.batchModel.create(batchBody);
  }

  /**
   * Find all batches.
   * @returns {Promise<BatchDocument[]>} - An array of batch documents.
   */
  findBatches(): Promise<BatchDocument[]> {
    return this.batchModel.find();
  }

  /**
   * Find a batch by its ID.
   * @param {Types.ObjectId} id - The ID of the batch to find.
   * @returns {Promise<BatchDocument>} - The batch document with the specified ID.
   */
  findBatchById(id: Types.ObjectId): Promise<BatchDocument> {
    return this.batchModel.findById(id);
  }

  /**
   * Find a batch by its year.
   * @param {number} year - The year of the batch to find.
   * @returns {Promise<BatchDocument>} - The batch document with the specified year.
   */
  findBatchByYear(year: number): Promise<BatchDocument> {
    return this.batchModel.findOne({ year });
  }

  /**
   * Find total students analytics.
   * @returns {Aggregate<TotalStudentsAnalyticsResult[]>} - The aggregate result for total students analytics.
   */
  findTotalStudentsAnalytics(): Aggregate<TotalStudentsAnalyticsResult[]> {
    return this.batchModel.aggregate([
      {
        $unwind: '$branches',
      },
      {
        $group: {
          _id: '$year',
          totalStudents: { $sum: '$branches.totalStudentsIntake' },
          branches: {
            $push: {
              k: '$branches.name',
              v: '$branches.totalStudentsIntake',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id',
          totalStudents: 1,
          branches: {
            $arrayToObject: '$branches',
          },
        },
      },
    ]);
  }

  /**
   * Find vacant seats year-wise based on the specified match criteria.
   * @param {randomMatch} match - The match criteria for finding vacant seats.
   * @returns {Aggregate<BatchInfo[]>} - The aggregate result for vacant seats year-wise.
   */
  findVacantSeatsYearWise(match: randomMatch): Aggregate<BatchInfo[]> {
    const { batch, department } = match;

    return this.batchModel.aggregate([
      {
        $project: {
          _id: 0,
          __v: 0,
        },
      },
      {
        $unwind: '$branches',
      },
      {
        $addFields: {
          'branches.availableIntake': {
            $subtract: [
              '$branches.totalStudentsIntake',
              '$branches.occupiedSeats',
            ],
          },
        },
      },
      {
        $match: {
          $and: [
            batch ? { year: batch } : {},
            department ? { 'branches.name': department } : {},
          ],
        },
      },
      {
        $group: {
          _id: '$year',
          totalStudents: {
            $sum: '$branches.occupiedSeats',
          },
          totalStudentsIntake: {
            $sum: '$branches.totalStudentsIntake',
          },
          branches: {
            $push: {
              k: '$branches.name',
              v: {
                totalStudents: '$branches.occupiedSeats',
                totalStudentsIntake: '$branches.totalStudentsIntake',
                availableIntake: {
                  $subtract: [
                    '$branches.totalStudentsIntake',
                    '$branches.occupiedSeats',
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          availableIntake: {
            $subtract: ['$totalStudentsIntake', '$totalStudents'],
          },
        },
      },
      {
        $project: {
          _id: 0,
          batch: '$_id',
          totalStudents: 1,
          totalStudentsIntake: 1,
          availableIntake: 1,
          branches: {
            $arrayToObject: '$branches',
          },
        },
      },
    ]);
  }

  clearDB() {
    return this.batchModel.deleteMany();
  }
}
