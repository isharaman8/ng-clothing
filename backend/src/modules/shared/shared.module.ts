// Third party imports
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Inner imports
import { S3Module } from '../s3/s3.module';
import { S3Service } from '../s3/s3.service';
import { SharedService } from './shared.service';
import { ProductService } from '../product/product.service';
import { CategoryService } from '../category/category.service';
import { SharedProductService } from './shared-product.service';
import { Upload, UploadSchema } from 'src/schemas/upload.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { SharedValidatorService } from './shared-validator.service';
import { Category, CategorySchema } from 'src/schemas/category.schema';

@Module({
  imports: [
    S3Module,
    MongooseModule.forFeature([
      { name: Upload.name, schema: UploadSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [SharedService, SharedValidatorService, S3Service, ProductService, CategoryService, SharedProductService],
})
export class SharedModule {}
