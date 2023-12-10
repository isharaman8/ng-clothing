// third party imports
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// inner imports
import { UploadedImage } from 'src/interfaces';
import { USER_ROLES } from 'src/constants/constants';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
  minimize: false,
})
export class User {
  @Prop({ unique: true, required: true })
  uid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ enum: Object.values(USER_ROLES), default: [], type: Array<string> })
  roles: string[];

  @Prop({ default: null, type: Object })
  profile_picture: UploadedImage;

  @Prop({ default: true })
  active: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
