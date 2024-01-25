// inner imports
import { HydratedDocument } from 'mongoose';

// third party imports
import { PurchaseProduct } from 'src/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Cart {
  @Prop({ unique: true, required: true })
  uid: string;

  @Prop({ required: true, unique: true })
  user_id: string;

  @Prop({ required: true, type: Array })
  products: Array<PurchaseProduct>;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Indexes
CartSchema.index({ uid: 1, user_id: 1 }, { unique: true });

// TODO
/**
 * fix PurchaseProduct -> add qty as well, change in controllers accordingly
 * return total_price in purchase and cart request
 * * add cart controller and services
 */
