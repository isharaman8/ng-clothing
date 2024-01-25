// third party imports
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// inner imports
import { PurchaseProduct } from 'src/interfaces';

export class CreateOrUpdateCartDto {
  @IsString()
  @IsOptional()
  uid: string;

  @IsArray()
  @IsNotEmpty()
  products: Array<PurchaseProduct>;

  @IsString()
  @IsOptional()
  user_id: string;
}
