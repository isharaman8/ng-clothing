// third party imports
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
  urlExpiryDate: Date;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  mimetype: string;
}

export const UploadSchema = SchemaFactory.createForClass(Upload);
