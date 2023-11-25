import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  password?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  role?: string;
}
