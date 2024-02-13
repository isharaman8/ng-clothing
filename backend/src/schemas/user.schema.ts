// third party imports
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// inner imports
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

  @Prop({ default: null })
  profile_picture: string;

  @Prop({ default: true })
  active: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// todo: optimize indices further
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ active: 1 });

// Two-field indices:
UserSchema.index({ email: 1, username: 1 });
UserSchema.index({ email: 1, active: 1 });
UserSchema.index({ email: 1, uid: 1 });
UserSchema.index({ username: 1, active: 1 });
UserSchema.index({ username: 1, uid: 1 });
UserSchema.index({ active: 1, uid: 1 });

// Three-field indices:
UserSchema.index({ email: 1, username: 1, active: 1 });
UserSchema.index({ email: 1, username: 1, uid: 1 });
UserSchema.index({ email: 1, active: 1, uid: 1 });
UserSchema.index({ username: 1, active: 1, uid: 1 });

// Four-field index:
UserSchema.index({ email: 1, username: 1, active: 1, uid: 1 });
