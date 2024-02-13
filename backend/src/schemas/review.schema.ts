// inner imports
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// third party imports
import { ALLOWED_RATING } from 'src/constants/constants';

export type CartDocument = HydratedDocument<Review>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Review {
  @Prop({ unique: true, required: true })
  uid: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  product_id: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: 1, enum: ALLOWED_RATING })
  rating: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: [] })
  images: Array<string>;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ product_id: 1 });
ReviewSchema.index({ active: 1 });
