// third party imports
import { FilesInterceptor } from '@nestjs/platform-express';
import { Controller, InternalServerErrorException, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';

// inner imports
import { S3Service } from './s3.service';
import { CResponse } from 'src/interfaces';

@Controller('s3')
export class S3Controller {
  constructor(private s3Service: S3Service) {}

  @Post('image-upload')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>, @Res() response: CResponse) {
    let rs: any;

    try {
      rs = await this.s3Service.uploadFiles(files);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    console.log('RS', rs);

    return response.status(200).send({ hello: 'hello' });
  }
}
