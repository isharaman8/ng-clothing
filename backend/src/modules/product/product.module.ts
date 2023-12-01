// third party imports
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

// inner imports
import { ProductService } from './product.service';
import { AuthGuard } from '../../guards/auth.guard';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from 'src/schemas/product.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
  controllers: [ProductController],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }, ProductService],
})
export class ProductModule {}
