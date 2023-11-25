import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dtos/create-batch.dto';
import { AuthGuard } from '../../utils/guards/auth.guard';
import { RoleGuard } from '../../utils/guards/role.guard';
import { BatchDocument } from './batch.schema';

@Controller('batches')
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  /**
   * Create a new batch.
   * @param {CreateBatchDto} batchBody - The batch data to create.
   * @returns {Promise<BatchDocument>} - The created batch.
   */
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  createBatch(@Body() batchBody: CreateBatchDto): Promise<BatchDocument> {
    return this.batchesService.createBatch(batchBody);
  }

  /**
   * Get all batches.
   * @returns {Promise<BatchDocument[]>} - An array of batch documents.
   */
  @Get()
  @UseGuards(AuthGuard)
  getBatches(): Promise<BatchDocument[]> {
    return this.batchesService.findBatches();
  }
}
