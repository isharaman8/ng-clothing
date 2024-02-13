// inner imports
import { HydratedDocument } from 'mongoose';

// third party imports
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Category {
  @Prop({ unique: true, required: true })
  uid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: null })
  user_id: string;

  @Prop({ required: true, unique: true })
  slug: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ active: 1 });
CategorySchema.index({ slug: 1 });
