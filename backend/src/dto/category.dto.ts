// third pary imports
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateCategoryDto {
  @IsString()
  @IsOptional()
  uid: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  @IsOptional()
  active: boolean;

  @IsString()
  @IsOptional()
  user_id: string;

  @IsString()
  @IsOptional()
  slug: string;
}
