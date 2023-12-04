import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PurchaseProduct } from 'src/interfaces';

export class CreateOrUpdatePurchaseDto {
  @IsString()
  @IsOptional()
  uid: string;

  @IsArray()
  @IsNotEmpty()
  products: Array<PurchaseProduct>;

  @IsString()
  @IsOptional()
  user_id: string;

  @IsBoolean()
  @IsOptional()
  verified: boolean;
}
