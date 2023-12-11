// third party imports
import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// inner imports
import { S3Service } from '../s3/s3.service';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Upload, UploadSchema } from 'src/schemas/upload.schema';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { ValidateProductMiddleware } from 'src/middlewares/validate-product.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Upload.name, schema: UploadSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, S3Service],
})
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const allowedRoutes = [
      { path: 'product', method: RequestMethod.POST },
      { path: 'product/:product_uid', method: RequestMethod.PATCH },
      { path: 'product/:product_uid', method: RequestMethod.DELETE },
    ];

    consumer
      .apply(AuthMiddleware)
      .forRoutes(...allowedRoutes)
      .apply(ValidateProductMiddleware)
      .forRoutes(...allowedRoutes);
  }
}
