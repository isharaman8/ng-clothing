// inner imports
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// third party imports
import { ALLOWED_PRODUCT_SIZES } from 'src/constants/constants';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Product {
  @Prop({ unique: true, required: true })
  uid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: null })
  price: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: [] })
  images: Array<string>;

  @Prop({ default: null })
  user_id: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  gender: Array<string>;

  @Prop({ default: ALLOWED_PRODUCT_SIZES, type: Object })
  available_sizes: Object;

  @Prop({ default: null })
  category: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ slug: 1 });
