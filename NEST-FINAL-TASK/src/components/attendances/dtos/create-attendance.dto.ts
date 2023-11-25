import { IsBoolean, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsString()
  student: string;

  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsNotEmpty()
  @IsBoolean()
  isPresent: boolean;
}
