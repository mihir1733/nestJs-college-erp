import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Student } from '../students/student.schema';
import { HydratedDocument } from 'mongoose';

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema()
export class Attendance {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Student' })
  student: Student;

  @Prop()
  date: Date;

  @Prop()
  isPresent: boolean;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
