// inner imports
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LogsDocument = HydratedDocument<Logs>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Logs {
  @Prop({ unique: true, required: true })
  uid: string;

  @Prop({ required: true })
  verb: string;

  @Prop({ default: {} })
  meta: object;
}

export const LogSchema = SchemaFactory.createForClass(Logs);
