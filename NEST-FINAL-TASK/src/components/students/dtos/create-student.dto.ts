import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  phoneNumber: number;

  @IsNotEmpty()
  @IsString()
  department: string;

  @IsNotEmpty()
  @IsNumber()
  batch: number;

  @IsNotEmpty()
  @IsNumber()
  currentSemester: number;
}
