// third party imports
import * as _ from 'lodash';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Req, Res, Post, Controller, UploadedFiles, UseInterceptors, Get, Query } from '@nestjs/common';

// inner imports
import { S3Service } from './s3.service';
import { _getParsedQuery } from 'src/helpers/parser';
import { CRequest, CResponse, QueryParams, S3GetUrlArray } from 'src/interfaces';

@Controller('s3')
export class S3Controller {
  constructor(private s3Service: S3Service) {}

  @Post('image-upload')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadImageFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    let rs = [];

    if (!_.isEmpty(files)) {
      rs.push(...(await this.s3Service.uploadFiles(files, request.user, 'image')));
    }

    return response.status(200).send({ images: rs });
  }

  @Post('video-upload')
  @UseInterceptors(FilesInterceptor('videos'))
  async uploadVideoFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    let rs = [];

    if (!_.isEmpty(files)) {
      rs.push(...(await this.s3Service.uploadFiles(files, request.user, 'video')));
    }

    return response.status(200).send({ videos: rs });
  }

  @Get('uploads')
  async getAllUserUploads(@Query() query: QueryParams, @Req() request: CRequest, @Res() response: CResponse) {
    const uploadQuery = _getParsedQuery(query);

    uploadQuery['userId'] = request.user?.uid;

    let uploads = [];

    uploads = await this.s3Service.getAllUploads(uploadQuery);

    // update uploads
    const filterExpiredUrlImages = _.filter(uploads, (upload) => new Date(upload.url_expiry_date) <= new Date());
    const s3UrlArray: Array<S3GetUrlArray> = _.map(filterExpiredUrlImages, (upload) => ({
      key: upload.key,
      bucket: upload.bucket,
      uid: upload.uid,
    }));
    const updatedUrls = await this.s3Service.getUpdatedFileUrls(s3UrlArray);

    // update response
    for (const image of uploads) {
      const reqdUploads = _.find(updatedUrls, (url) => url.uid === image.uid);

      if (reqdUploads) {
        image.url = reqdUploads.url;
        image.url_expiry_date = reqdUploads.url_expiry_date;
      }
    }

    // parse response
    uploads = _.map(uploads, this.s3Service.getParsedUploadsResponse);

    response.status(200).send({ uploads });
  }
}
