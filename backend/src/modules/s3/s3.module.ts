// third party imports
import { Module } from '@nestjs/common';

// inner imports
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller';

@Module({
  controllers: [S3Controller],
  providers: [S3Service],
})
export class S3Module {}
