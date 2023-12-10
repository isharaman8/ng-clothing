// third party imports
import { ConfigService } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

// inner imports
import { S3GetArray } from 'src/interfaces';
import { ALLOWED_MIMETYPES } from 'src/constants/constants';

@Injectable()
export class S3Service {
  constructor(private configService: ConfigService) {}

  s3Config = this.configService.get('s3');
  AWS_S3_BUCKET = this.s3Config.bucket;
  s3 = new S3Client({
    region: this.s3Config.region,
    credentials: { accessKeyId: this.s3Config.accessKeyId, secretAccessKey: this.s3Config.secretAccessKey },
  });

  async uploadFiles(files: Array<Express.Multer.File>) {
    console.log('FILES', files);

    const responses = [];

    for (const file of files) {
      const { originalname, mimetype, buffer } = file;

      if (this.validateImageMimetype(mimetype)) {
        const uploadResponse = await this.s3Upload(buffer, this.AWS_S3_BUCKET, originalname, mimetype);

        console.log('UPLOAD RESPONSE', uploadResponse);

        if (uploadResponse) {
          responses.push(uploadResponse);
        }
      }
    }

    return responses;
  }

  async s3Upload(file: Buffer, bucket: string, name: string, mimetype: string) {
    const params: PutObjectCommandInput = {
        Body: file,
        Bucket: bucket,
        Key: String(name),
        ContentType: mimetype,
        ContentDisposition: 'inline',
      },
      abortController = new AbortController(),
      abortSignal = abortController.signal;

    console.log('PARAMS', params);

    let s3Response: any;

    try {
      s3Response = await this.s3.send(new PutObjectCommand(params), { abortSignal });

      console.log('S3 Response', s3Response);
    } catch (e) {
      console.log(e);
    }

    if (s3Response) {
      return s3Response;
    }
  }

  async getFiles(keys: Array<S3GetArray>) {
    let fileUrls = [];

    try {
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return fileUrls;
  }

  validateImageMimetype(mimetype: string) {
    if (ALLOWED_MIMETYPES.image.includes(mimetype)) {
      return true;
    }

    return false;
  }
}
