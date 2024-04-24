// third party imports
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// inner imports
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Upload, UploadSchema } from 'src/schemas/upload.schema';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { ValidateUploadMiddleware } from 'src/middlewares/validate-upload.middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }])],
  controllers: [S3Controller],
  providers: [S3Service],
})
export class S3Module implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const allowedRoutes = [
      { path: 's3/uploads', method: RequestMethod.GET },
      { path: 's3/image-upload', method: RequestMethod.POST },
      { path: 's3/video-upload', method: RequestMethod.POST },
    ];

    consumer
      .apply(AuthMiddleware)
      .forRoutes(...allowedRoutes)
      .apply(ValidateUploadMiddleware)
      .forRoutes(...allowedRoutes);
  }
}
