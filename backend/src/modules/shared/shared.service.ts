// Third party imports
import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';

// Inner imports
import { S3Service } from '../s3/s3.service';
import { _getParsedQuery } from 'src/helpers/parser';
import { S3GetUrlArray, UploadedImage } from 'src/interfaces';

@Injectable()
export class SharedService {
  constructor(private s3Service: S3Service) {}

  private async getUpdatedFileUrlsArray(dbImages: Array<any>) {
    let updatedFileUrls = [];
    let s3Array: Array<S3GetUrlArray> = [];

    // filtering images that needs to be updated
    for (const image of dbImages) {
      const imageExpiryDate = new Date(image.urlExpiryDate),
        currentDate = new Date();

      if (currentDate >= imageExpiryDate) {
        s3Array.push({ uid: image.uid, bucket: image.bucket, key: image.key });
      }
    }

    // fetching updated urls
    if (s3Array.length) {
      updatedFileUrls = await this.s3Service.getUpdatedFileUrls(s3Array);
    }

    return s3Array;
  }

  private updateDbImageArray(dbImagesArray: Array<any>, updatedFileUrlsArray: Array<any>) {
    dbImagesArray = JSON.parse(JSON.stringify(dbImagesArray));

    // updating dbimage array
    for (const url of updatedFileUrlsArray) {
      const reqdDBImageIndex = _.find(dbImagesArray, (image) => image.uid === url.uid);

      if (reqdDBImageIndex !== -1) {
        const oldImage: UploadedImage = dbImagesArray[reqdDBImageIndex],
          newImage: UploadedImage = { ...oldImage, url: url.url, urlExpiryDate: url.urlExpiryDate };

        dbImagesArray[reqdDBImageIndex] = newImage;
      }
    }

    return dbImagesArray;
  }

  async getUpdatedDbImageArray(imageUids: Array<string>) {
    const uploadQuery = _getParsedQuery({ uid: imageUids });

    let dbImages = [];
    let updatedFileUrls = [];

    // fetching uids
    dbImages = await this.s3Service.getAllUploads(uploadQuery);
    dbImages = JSON.parse(JSON.stringify(dbImages));

    // filter and get updated file urls
    updatedFileUrls = await this.getUpdatedFileUrlsArray(dbImages);

    // updating dbimage array
    dbImages = this.updateDbImageArray(dbImages, updatedFileUrls);

    return dbImages;
  }
}
