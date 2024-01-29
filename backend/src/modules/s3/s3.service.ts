// third party imports
import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

// inner imports
import { S3GetUrlArray } from 'src/interfaces';
import { Upload } from 'src/schemas/upload.schema';
import { ALLOWED_MIMETYPES, MAX_PRESIGNED_URL_DURATION } from 'src/constants/constants';

@Injectable()
export class S3Service {
  constructor(
    private configService: ConfigService,
    @InjectModel(Upload.name) private uploadSchema: Model<Upload>,
  ) {}

  s3Config = this.configService.get('s3');
  AWS_S3_BUCKET = this.s3Config.bucket;
  s3 = new S3Client({
    region: this.s3Config.region,
    credentials: { accessKeyId: this.s3Config.accessKeyId, secretAccessKey: this.s3Config.secretAccessKey },
  });

  async uploadFiles(files: Array<Express.Multer.File>, user: any = {}) {
    const responses = [];
    const bulkWriteArray = [];

    try {
      for (const file of files) {
        const { originalname, mimetype, buffer, size } = file;

        if (this.validateImageMimetype(mimetype)) {
          const response = await this.s3Upload(buffer, this.AWS_S3_BUCKET, originalname, mimetype);

          if (response && user.uid) {
            const newResponse = { ...response, size, mimetype, user_id: user.uid, uid: nanoid() };

            responses.push(newResponse);
            bulkWriteArray.push({ insertOne: { document: newResponse } });
          }
        }
      }

      if (bulkWriteArray.length) {
        await this.uploadSchema.bulkWrite(bulkWriteArray);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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
          urlExpiryDate: new Date(new Date().getTime() + MAX_PRESIGNED_URL_DURATION).toISOString(),
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
    const bulkWriteArray = [];

    try {
      for (const obj of s3Array) {
        const { bucket, key, service_uid, uid } = obj;
        const newFileUrl = await this.getFileUrl(bucket, key);
        const newFileResponse = {
          uid,
          key,
          bucket,
          service_uid,
          url: newFileUrl,
          urlExpiryDate: new Date(new Date().getTime() + MAX_PRESIGNED_URL_DURATION).toISOString(),
        };

        responses.push(newFileResponse);
        bulkWriteArray.push({
          updateOne: {
            filter: { uid },
            update: {
              $set: { url: newFileResponse.url, urlExpiryDate: new Date(newFileResponse.urlExpiryDate) },
            },
          },
        });
      }

      if (bulkWriteArray.length) {
        await this.uploadSchema.bulkWrite(bulkWriteArray);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return responses;
  }

  async getAllUploads(uids: Array<string> = [], user: any = {}) {
    const baseQuery = {};

    let images = [];

    if (user.uid) {
      baseQuery['user_id'] = user.uid;
    }

    if (uids.length) {
      baseQuery['uid'] = { $in: uids };
    }

    console.log('ALL UPLOADS BASE QUERY', JSON.stringify(baseQuery));

    try {
      images = await this.uploadSchema.find(baseQuery);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return images;
  }

  getParsedUploadsResponse(upload: any = {}) {
    upload = JSON.parse(JSON.stringify(upload));

    delete upload._id;
    delete upload.__v;
    delete upload.created_at;
    delete upload.updated_at;

    return upload;
  }

  // validators
  validateImageMimetype(mimetype: string) {
    if (_.includes(ALLOWED_MIMETYPES.image, mimetype)) {
      return true;
    }

    return false;
  }
}
