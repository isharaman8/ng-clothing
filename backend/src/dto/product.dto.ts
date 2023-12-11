// third pary imports
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateProductDto {
  @IsString()
  @IsOptional()
  uid: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsBoolean()
  @IsNotEmpty()
  active: boolean;

  @IsArray()
  @IsNotEmpty()
  images: Array<string>;

  @IsString()
  @IsOptional()
  user_id: string;
}
