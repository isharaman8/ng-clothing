// third party imports
import * as _ from 'lodash';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// inner imports
import { ADDRESS_TYPE_ENUM } from 'src/constants/constants';

export type UserAddressDocument = HydratedDocument<UserAddress>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
  minimize: false,
})
export class UserAddress {
  @Prop({ unique: true, required: true })
  uid: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  user_name: string;

  @Prop({ required: true })
  contact_number: string;

  @Prop({ default: 'home', enum: _.values(ADDRESS_TYPE_ENUM) })
  type: string;

  @Prop({ required: true })
  address_line_1: string;

  @Prop({ default: null })
  address_line_2: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state_province: string;

  @Prop({ required: true })
  postal_code: number;

  @Prop({ required: true })
  country: string;

  @Prop({ default: false })
  primary: boolean;

  @Prop({ default: true })
  active: true;
}

export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);

UserAddressSchema.index({ uid: 1, user_id: 1 });
UserAddressSchema.index({ user_id: 1, active: 1 });
UserAddressSchema.index({ uid: 1, user_id: 1, active: 1 });
