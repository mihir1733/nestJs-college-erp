import { Expose } from 'class-transformer';

export class ShowUserDto {
  @Expose()
  _id: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  token: string;
}
