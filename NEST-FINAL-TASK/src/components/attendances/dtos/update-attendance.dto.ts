import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class UpdateAttendanceDto {
  @IsNotEmpty()
  @IsDateString()
  @IsOptional()
  date?: Date;

  @IsNotEmpty()
  @IsBoolean()
  @IsOptional()
  isPresent?: boolean;
}
