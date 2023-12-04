// third party imports
import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// inner imports
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { ProductService } from '../product/product.service';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Purchase, PurchaseSchema } from 'src/schemas/purchase.schema';
import { ValidatePurchaseMiddleware } from 'src/middlewares/validate-purchase.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService, ProductService],
})
export class PurchaseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*').apply(ValidatePurchaseMiddleware).forRoutes('purchase/*');
  }
}
