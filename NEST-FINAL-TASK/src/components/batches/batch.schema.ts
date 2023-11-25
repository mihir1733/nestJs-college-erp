import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BatchDocument = HydratedDocument<Batch>;

@Schema()
export class Batch {
  @Prop({
    type: Number,
    required: true,
  })
  year: number;

  @Prop([
    {
      name: {
        type: String,
        required: true,
      },
      totalStudentsIntake: {
        type: Number,
        required: true,
      },
      occupiedSeats: {
        type: Number,
        default: 0,
      },
    },
  ])
  branches: Array<{
    name: string;
    totalStudentsIntake: number;
    occupiedSeats: number;
  }>;
}

export const BatchSchema = SchemaFactory.createForClass(Batch);
