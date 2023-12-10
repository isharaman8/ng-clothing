// third pary imports
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

// inner imports
import { UploadedImage } from 'src/interfaces';

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
  images: Array<UploadedImage>;

  @IsString()
  @IsOptional()
  user_id: string;
}
