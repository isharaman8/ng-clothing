import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
} from 'class-validator';

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

  @IsString()
  @IsOptional()
  profile_picture: string;
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
