// third party imports
import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// inner imports
import { S3Service } from '../s3/s3.service';
import { UserService } from '../user/user.service';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { SharedService } from '../shared/shared.service';
import { ReviewService } from './product-review.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { CategoryService } from '../category/category.service';
import { PurchaseService } from '../purchase/purchase.service';
import { Upload, UploadSchema } from 'src/schemas/upload.schema';
import { Review, ReviewSchema } from 'src/schemas/review.schema';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { Purchase, PurchaseSchema } from 'src/schemas/purchase.schema';
import { SharedProductService } from '../shared/shared-product.service';
import { ValidateProductMiddleware } from 'src/middlewares/validate-product.middleware';
import { ValidateProductReviewMiddleware } from 'src/middlewares/validate-product-review.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Upload.name, schema: UploadSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [
    S3Service,
    UserService,
    SharedService,
    ReviewService,
    ProductService,
    PurchaseService,
    CategoryService,
    SharedProductService,
  ],
})
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const allowedRoutes = [
      { path: 'product', method: RequestMethod.POST },
      { path: 'product', method: RequestMethod.PATCH },
      { path: 'product/:product_uid', method: RequestMethod.PATCH },
      { path: 'product/:product_uid', method: RequestMethod.DELETE },
    ];

    const allowedReviewRoutes = [
      { path: 'product/:product_uid/review', method: RequestMethod.POST },
      { path: 'product/:product_uid/review/:review_uid', method: RequestMethod.PATCH },
      { path: 'product/:product_uid/review/:review_uid', method: RequestMethod.DELETE },
    ];

    consumer
      .apply(AuthMiddleware)
      .forRoutes(...allowedRoutes, ...allowedReviewRoutes)
      .apply(ValidateProductMiddleware)
      .forRoutes(...allowedRoutes)
      .apply(ValidateProductReviewMiddleware)
      .forRoutes(...allowedReviewRoutes);
  }
}
