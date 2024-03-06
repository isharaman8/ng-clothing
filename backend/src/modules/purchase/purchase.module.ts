// third party imports
import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// inner imports
import { S3Service } from '../s3/s3.service';
import { PurchaseService } from './purchase.service';
import { SharedService } from '../shared/shared.service';
import { PurchaseController } from './purchase.controller';
import { ProductService } from '../product/product.service';
import { CategoryService } from '../category/category.service';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { Upload, UploadSchema } from 'src/schemas/upload.schema';
import { UserAddressService } from '../user/user-address.service';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Purchase, PurchaseSchema } from 'src/schemas/purchase.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { SharedProductService } from '../shared/shared-product.service';
import { SharedValidatorService } from '../shared/shared-validator.service';
import { UserAddress, UserAddressSchema } from 'src/schemas/user-address.schema';
import { ValidatePurchaseMiddleware } from 'src/middlewares/validate-purchase.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Upload.name, schema: UploadSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Category.name, schema: CategorySchema },
      { name: UserAddress.name, schema: UserAddressSchema },
    ]),
  ],
  controllers: [PurchaseController],
  providers: [
    S3Service,
    SharedService,
    ProductService,
    PurchaseService,
    CategoryService,
    UserAddressService,
    SharedProductService,
    SharedValidatorService,
  ],
})
export class PurchaseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const allowedRoutes = [
      { path: 'purchase', method: RequestMethod.GET },
      { path: 'purchase/', method: RequestMethod.POST },
      { path: 'purchase/:purchase_uid', method: RequestMethod.GET },
      { path: 'purchase/:purchase_uid/verify', method: RequestMethod.PATCH },
    ];

    consumer
      .apply(AuthMiddleware)
      .forRoutes('purchase')
      .apply(ValidatePurchaseMiddleware)
      .forRoutes(...allowedRoutes);
  }
}
