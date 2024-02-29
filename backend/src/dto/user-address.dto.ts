// third party imports
import { IsBoolean, IsEnum, IsMobilePhone, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

// inner imports
import { ADDRESS_TYPE_ENUM } from 'src/constants/constants';

export class CreateOrUpdateUserAddressDto {
  @IsString()
  @IsOptional()
  uid: string;

  @IsString()
  @IsOptional()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsMobilePhone()
  @IsNotEmpty()
  contact_number: string;

  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(ADDRESS_TYPE_ENUM)
  type: string;

  @IsString()
  @IsNotEmpty()
  address_line_1: string;

  @IsString()
  @IsOptional()
  address_line_2: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state_province: string;

  @IsNumber()
  @IsNotEmpty()
  postal_code: number;

  @IsBoolean()
  @IsOptional()
  primary: boolean;

  @IsBoolean()
  @IsOptional()
  active: boolean;
}
