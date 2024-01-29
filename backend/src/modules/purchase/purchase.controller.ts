// third party imports
import * as _ from 'lodash';
import {
  Res,
  Req,
  Get,
  Body,
  Post,
  Patch,
  Param,
  Query,
  Controller,
  InternalServerErrorException,
} from '@nestjs/common';

// inner imports
import { parseArray } from 'src/utils';
import { CreateOrUpdatePurchaseDto } from 'src/dto';
import { CRequest, CResponse } from 'src/interfaces';
import { PurchaseService } from './purchase.service';
import { ProductService } from '../product/product.service';
import { ALLOWED_PURCHASE_STATUS } from 'src/constants/constants';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';

@Controller('purchase')
export class PurchaseController {
  constructor(
    private purchaseService: PurchaseService,
    private productService: ProductService,
  ) {}

  @Post('')
  async createPurchase(
    @Body('purchase') _purchase: CreateOrUpdatePurchaseDto,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    const { user = {} } = request;
    const { oldPurchase } = response.locals;
    const payload = response.locals.purchase;

    let createdPurchase: any;

    try {
      createdPurchase = await this.purchaseService.createOrUpdatePurchase(payload, oldPurchase, user);

      // get updated image urls
      let tempPurchase = await this.purchaseService.getUpatedPurchaseImageUrls([createdPurchase]);

      createdPurchase = tempPurchase[0];

      // update sizes in products
      const productSizeBulkUpdateArray = this.purchaseService.getUpdatedProductSizes(createdPurchase.products);

      await this.productService.bulkUpdateOp(productSizeBulkUpdateArray);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return response
      .status(201)
      .send({ purchase: this.purchaseService.getParsedPurchaseResponsePayload(createdPurchase) });
  }

  @Get('')
  async getPurchases(@Query() query: any, @Req() request: CRequest, @Res() response: CResponse) {
    const parsedQuery = _getParsedQuery(query);
    const { user = {} } = request;

    if (!_.includes(parseArray(user.roles, []), 'admin')) {
      parsedQuery.userId = user.uid;
    }

    let purchases: any = [];

    try {
      purchases = await this.purchaseService.getAllPurchases(parsedQuery);

      // get updated image urls
      purchases = await this.purchaseService.getUpatedPurchaseImageUrls(purchases);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // parsing response payload
    purchases = _.map(purchases, this.purchaseService.getParsedPurchaseResponsePayload);

    return response.status(200).send({ purchases });
  }

  @Patch(':purchase_uid/verify')
  async verifyPurchase(@Param() _params: any, @Res() response: CResponse) {
    const { oldPurchase = {} } = response.locals;

    try {
      await this.purchaseService.createOrUpdatePurchase(
        { verified: true, status: ALLOWED_PURCHASE_STATUS.verified },
        oldPurchase,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return response.status(204).send();
  }

  @Get(':purchase_uid')
  async getPurchaseByUid(
    @Query() query: any,
    @Param() params: any,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    const parsedQuery = _getParsedQuery(query);
    const parsedParams = _getParsedParams(params);
    const { user = {} } = request;

    let purchases: any;

    // adding props to parsedQuery
    parsedQuery.userId = user.uid;
    parsedQuery.uid = parsedParams.purchaseId;

    try {
      purchases = await this.purchaseService.getAllPurchases(parsedQuery);

      // get updated image urls
      purchases = await this.purchaseService.getUpatedPurchaseImageUrls(purchases);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // parse response payload
    purchases = _.map(purchases, this.purchaseService.getParsedPurchaseResponsePayload);

    return response.status(200).send({ purchases });
  }
}
