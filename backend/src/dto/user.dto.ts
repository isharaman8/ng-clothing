// third party imports
import { IsEmail, IsNotEmpty, IsString, IsArray, IsBoolean, IsOptional, IsObject } from 'class-validator';

// inner imports
import { UploadedImage } from 'src/interfaces';

export class CreateOrUpdateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  uid: string;

  @IsBoolean()
  @IsNotEmpty()
  active: boolean;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsOptional()
  roles: string[];

  @IsObject()
  @IsOptional()
  profile_picture: UploadedImage;
}

export class LoginUserDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  username: string;
}
