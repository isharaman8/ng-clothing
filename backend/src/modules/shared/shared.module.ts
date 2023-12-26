// Third party imports
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Inner imports
import { S3Module } from '../s3/s3.module';
import { S3Service } from '../s3/s3.service';
import { SharedService } from './shared.service';
import { Upload, UploadSchema } from 'src/schemas/upload.schema';

@Module({
  imports: [S3Module, MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }])],
  providers: [SharedService, S3Service],
})
export class SharedModule {}
