import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BatchRepository } from './batches.repository';
import { CreateBatchDto } from './dtos/create-batch.dto';
import mongoose from 'mongoose';
import { BatchDocument } from './batch.schema';

@Injectable()
export class BatchesService {
  constructor(private batchRepo: BatchRepository) {}

  /**
   * Create a new batch.
   * @param {CreateBatchDto} batchBody - The batch data to create.
   * @returns {Promise<BatchDocument>} - The created batch.
   */
  async createBatch(batchBody: CreateBatchDto): Promise<BatchDocument> {
    try {
      const batch = await this.batchRepo.createBatch(batchBody);
      await batch.save();
      return batch;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Find all batches.
   * @returns {Promise<BatchDocument[]>} - An array of batch documents.
   */
  async findBatches(): Promise<BatchDocument[]> {
    try {
      const batches = await this.batchRepo.findBatches();
      if (!batches.length) throw new NotFoundException('batches not found');
      return batches;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Find a batch by its ID.
   * @param {string} id - The ID of the batch to find.
   * @returns {Promise<BatchDocument>} - The batch document with the specified ID.
   */
  async findBatchById(id: string): Promise<BatchDocument> {
    try {
      const batch = await this.batchRepo.findBatchById(
        new mongoose.Types.ObjectId(id),
      );
      if (!batch) throw new NotFoundException('batch not found');
      return batch;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Find a batch by its year.
   * @param {number} year - The year of the batch to find.
   * @returns {Promise<BatchDocument>} - The batch document with the specified year.
   */
  async findBatchByYear(year: number): Promise<BatchDocument> {
    try {
      const batch = await this.batchRepo.findBatchByYear(year);
      if (!batch) throw new NotFoundException('batch not found');
      return batch;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message);
    }
  }
}
