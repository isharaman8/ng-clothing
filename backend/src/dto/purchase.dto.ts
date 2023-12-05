// third party imports
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdatePurchaseDto {
  @IsString()
  @IsOptional()
  uid: string;

  @IsArray()
  @IsNotEmpty()
  products: Array<string>;

  @IsString()
  @IsOptional()
  user_id: string;

  @IsBoolean()
  @IsOptional()
  verified: boolean;
}
