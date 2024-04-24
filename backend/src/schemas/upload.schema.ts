// third party imports
import * as _ from 'lodash';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// inner imports
import { ALLOWED_UPLOAD_TYPES } from 'src/constants/constants';

export type UploadDocument = HydratedDocument<Upload>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
  minimize: false,
})
export class Upload {
  @Prop({ unique: true, required: true })
  uid: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  bucket: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  url_expiry_date: Date;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true, enum: _.values(ALLOWED_UPLOAD_TYPES) })
  type: string;
}

export const UploadSchema = SchemaFactory.createForClass(Upload);

UploadSchema.index({ user_id: 1 });
UploadSchema.index({ mimetype: 1 });
UploadSchema.index({ mimetype: 1, user_id: 1 });
