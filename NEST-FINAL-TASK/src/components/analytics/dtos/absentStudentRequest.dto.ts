import { IsDateString, IsOptional } from 'class-validator';

export class StudentsRequestDto {
  @IsDateString()
  specificDate?: string;

  @IsOptional()
  batch?: number;

  @IsOptional()
  branch?: string;

  @IsOptional()
  semester?: number;
}
