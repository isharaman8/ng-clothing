// Third party imports
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Inner imports
import { S3Module } from '../s3/s3.module';
import { S3Service } from '../s3/s3.service';
import { SharedService } from './shared.service';
import { ProductService } from '../product/product.service';
import { Upload, UploadSchema } from 'src/schemas/upload.schema';
import { SharedValidatorService } from './shared-validator.service';
import { Product, ProductSchema } from 'src/schemas/product.schema';

@Module({
  imports: [
    S3Module,
    MongooseModule.forFeature([
      { name: Upload.name, schema: UploadSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [SharedService, SharedValidatorService, S3Service, ProductService],
})
export class SharedModule {}
