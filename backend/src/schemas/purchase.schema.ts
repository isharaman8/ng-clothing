// third party imports
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// inner imports
import { PurchaseProduct } from 'src/interfaces';
import { ALLOWED_PURCHASE_STATUS } from 'src/constants/constants';

export type PurchaseDocument = HydratedDocument<Purchase>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Purchase {
  @Prop({ unique: true, required: true })
  uid: string;

  @Prop({ required: true, type: Array })
  products: Array<PurchaseProduct>;

  @Prop({ required: true })
  user_id: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: ALLOWED_PURCHASE_STATUS.pending_verification })
  status: string;

  @Prop({ required: true })
  address_id: string;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);

PurchaseSchema.index({ user_id: 1 });

PurchaseSchema.index({ user_id: 1, uid: 1 });
PurchaseSchema.index({ user_id: 1, status: 1 });
PurchaseSchema.index({ user_id: 1, verified: 1 });
PurchaseSchema.index({ 'products.uid': 1, user_id: 1 });

PurchaseSchema.index({ uid: 1, user_id: 1, status: 1 });
PurchaseSchema.index({ 'products.uid': 1, user_id: 1, verified: 1 });

PurchaseSchema.index({ uid: 1, user_id: 1, status: 1, verified: 1 });
PurchaseSchema.index({ 'products.uid': 1, user_id: 1, status: 1, verified: 1 });
