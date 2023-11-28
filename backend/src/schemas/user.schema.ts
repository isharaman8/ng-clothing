// third party imports
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class User {
  @Prop({ unique: true, required: true })
  uid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  age: number;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: null })
  username: string;

  @Prop({ default: [] })
  roles: string[];

  @Prop({ default: null })
  profile_picture: string;

  @Prop({ default: true })
  active: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
