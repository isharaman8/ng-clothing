// inner imports
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PurchaseDocument = HydratedDocument<Purchase>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Purchase {
  @Prop({ unique: true, required: true })
  uid: string;

  @Prop({ required: true })
  products: Array<any>;

  @Prop({ required: true })
  user_uid: string;

  @Prop({ default: null })
  price: number;

  @Prop({ default: false })
  verified: boolean;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
