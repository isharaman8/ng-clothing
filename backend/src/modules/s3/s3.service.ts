// third party imports
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  constructor(private configService: ConfigService) {}

  s3Config = this.configService.get('s3');
  AWS_S3_BUCKET = this.s3Config.bucket;
  s3 = new S3Client({
    credentials: { accessKeyId: this.s3Config.accessKeyId, secretAccessKey: this.s3Config.secretAccessKey },
  });

  async uploadFiles(files: Array<Express.Multer.File>) {
    console.log('FILES', files);

    const responses = [];

    for (const file of files) {
      const { originalname } = file;
      const uploadResponses = await this.s3Upload(file.buffer, this.AWS_S3_BUCKET, originalname, file.mimetype);
      console.log(uploadResponses);

      responses.push(uploadResponses);
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

    let s3Response: any;

    try {
      s3Response = await this.s3.send(new PutObjectCommand(params), { abortSignal });

      console.log('S3 Response', s3Response);
    } catch (e) {
      console.log(e);
    }

    return s3Response;
  }
}
