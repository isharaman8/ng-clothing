// third party imports
import { ConfigService } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

// inner imports
import { S3GetUrlArray } from 'src/interfaces';
import { ALLOWED_MIMETYPES } from 'src/constants/constants';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
    const responses = [];

    try {
      // pushing promises to promiseArray
      for (const file of files) {
        const { originalname, mimetype, buffer, size } = file;

        if (this.validateImageMimetype(mimetype)) {
          const response = await this.s3Upload(buffer, this.AWS_S3_BUCKET, originalname, mimetype, size);

          if (response) {
            responses.push(response);
          }
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return responses;
  }

  async s3Upload(file: Buffer, bucket: string, name: string, mimetype: string, size: number) {
    const params: PutObjectCommandInput = {
        Body: file,
        Bucket: bucket,
        Key: String(name),
        ContentType: mimetype,
        ContentDisposition: 'inline',
      },
      abortController = new AbortController(),
      abortSignal = abortController.signal;

    let response: any;

    try {
      await this.s3.send(new PutObjectCommand(params), { abortSignal });

      // creating response
      const fileUrl = await this.getFileUrl(bucket, String(name));

      if (fileUrl) {
        response = {
          key: String(name),
          bucket,
          url: fileUrl,
          urlExpiryDate: new Date(new Date().getTime() + 604800000).toISOString(),
          size,
        };

        return response;
      }
    } catch (e) {
      console.log(e);
    }

    return null;
  }

  async getFileUrl(bucket: string, key: string) {
    const getComand = new GetObjectCommand({ Bucket: bucket, Key: key });

    return getSignedUrl(this.s3, getComand, { expiresIn: 604800 });
  }

  async getUpdatedFileUrls(s3Array: Array<S3GetUrlArray>) {
    const responses = [];

    try {
      for (const obj of s3Array) {
        const { bucket, key, uid } = obj;
        const newFileUrl = await this.getFileUrl(bucket, key);

        responses.push({
          uid,
          key,
          bucket,
          url: newFileUrl,
          urlExpiryDate: new Date(new Date().getTime() + 604800000).toISOString(),
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return responses;
  }

  // validators
  validateImageMimetype(mimetype: string) {
    if (ALLOWED_MIMETYPES.image.includes(mimetype)) {
      return true;
    }

    return false;
  }
}
