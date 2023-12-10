// inner imports
import { HydratedDocument } from 'mongoose';

// third party imports
import { UploadedImage } from 'src/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Product {
  @Prop({ unique: true, required: true })
  uid: string;

  @Prop({ default: null })
  name: string;

  @Prop({ default: null })
  price: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: [], type: Array })
  images: Array<UploadedImage>;

  @Prop({ default: null })
  user_id: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
