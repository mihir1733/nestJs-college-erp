import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StudentDocument = HydratedDocument<Student>;

@Schema()
export class Student {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phoneNumber: number;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  batch: number;

  @Prop({ required: true })
  currentSemester: number;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
