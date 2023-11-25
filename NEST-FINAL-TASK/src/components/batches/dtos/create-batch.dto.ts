import {
  IsNumber,
  IsString,
  ValidateNested,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBatchDto {
  @IsNumber()
  year: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBranchDto)
  branches: CreateBranchDto[];
}

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsNumber()
  totalStudentsIntake: number;

  @IsOptional()
  @IsNumber()
  occupiedSeats?: number;
}
