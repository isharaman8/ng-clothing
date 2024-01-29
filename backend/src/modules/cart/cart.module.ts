// third party imports
import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// inner imports
import { CartService } from './cart.service';
import { S3Service } from '../s3/s3.service';
import { CartController } from './cart.controller';
import { SharedService } from '../shared/shared.service';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { ProductService } from '../product/product.service';
import { Upload, UploadSchema } from 'src/schemas/upload.schema';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { ValidateCartMiddleware } from 'src/middlewares/validate-cart.middleware';
import { SharedValidatorService } from '../shared/shared-validator.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Upload.name, schema: UploadSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService, ProductService, SharedService, SharedValidatorService, S3Service],
})
export class CartModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const allowedRoutes = [
      { path: 'cart', method: RequestMethod.GET },
      { path: 'cart/create-or-update', method: RequestMethod.POST },
    ];

    consumer
      .apply(AuthMiddleware)
      .forRoutes('cart')
      .apply(ValidateCartMiddleware)
      .forRoutes(...allowedRoutes);
  }
}
