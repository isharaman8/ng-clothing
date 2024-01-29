// third party imports
import * as _ from 'lodash';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  Req,
  Res,
  Post,
  Controller,
  UploadedFiles,
  UseInterceptors,
  InternalServerErrorException,
  Get,
} from '@nestjs/common';

// inner imports
import { S3Service } from './s3.service';
import { CRequest, CResponse, S3GetUrlArray } from 'src/interfaces';

@Controller('s3')
export class S3Controller {
  constructor(private s3Service: S3Service) {}

  @Post('image-upload')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    let rs = [];

    try {
      if (!_.isEmpty(files)) {
        rs.push(...(await this.s3Service.uploadFiles(files, request.user)));
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return response.status(200).send({ images: rs });
  }

  @Get('image')
  async getAllImages(@Req() request: CRequest, @Res() response: CResponse) {
    let images = [];

    try {
      images = await this.s3Service.getAllUploads([], request.user);

      // update images
      const filterExpiredUrlImages = _.filter(images, (image) => new Date(image.urlExpiryDate) <= new Date());
      const s3UrlArray: Array<S3GetUrlArray> = _.map(filterExpiredUrlImages, (image) => ({
        key: image.key,
        bucket: image.bucket,
        uid: image.uid,
      }));
      const updatedUrls = await this.s3Service.getUpdatedFileUrls(s3UrlArray);

      // update response
      for (const image of images) {
        const reqdImage = _.find(updatedUrls, (url) => url.uid === image.uid);

        if (reqdImage) {
          image.url = reqdImage.url;
          image.urlExpiryDate = reqdImage.urlExpiryDate;
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // parse response
    images = _.map(images, this.s3Service.getParsedUploadsResponse);

    response.status(200).send({ images });
  }
}
