// third party imports
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateCartDto {
  @IsString()
  @IsOptional()
  uid: string;

  @IsNotEmpty()
  products: any;

  @IsString()
  @IsOptional()
  user_id: string;
}
