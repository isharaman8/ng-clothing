// third pary imports
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateProductDto {
  @IsString()
  @IsOptional()
  uid: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsBoolean()
  @IsOptional()
  active: boolean;

  @IsArray()
  @IsNotEmpty()
  images: Array<string>;

  @IsString()
  @IsOptional()
  user_id: string;

  @IsString()
  @IsOptional()
  slug: string;

  @IsString()
  @IsOptional()
  category: string;

  @IsArray()
  @IsNotEmpty()
  @IsIn(['male', 'female'], { each: true, message: 'Invalid gender value' })
  gender: Array<string>;

  @IsObject()
  @IsNotEmpty()
  available_sizes: object;
}

export class CreateOrUpdateProductReviewDto {
  @IsString()
  @IsOptional()
  uid: string;

  @IsString()
  @IsOptional()
  user_id: string;

  @IsString()
  @IsOptional()
  product_id: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsArray()
  @IsOptional()
  images: Array<string>;

  @IsBoolean()
  @IsOptional()
  active: boolean;
}
