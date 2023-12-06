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
import { CreateOrUpdatePurchaseDto } from 'src/dto';
import { CRequest, CResponse } from 'src/interfaces';
import { PurchaseService } from './purchase.service';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';

@Controller('purchase')
export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

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

    if (!parsedQuery.userId) {
      parsedQuery.userId = user.uid;
    }

    let purchases: any = [];

    try {
      purchases = await this.purchaseService.getAllPurchases(parsedQuery);
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

    let updatedPurchase: any;

    try {
      updatedPurchase = await this.purchaseService.createOrUpdatePurchase({ verified: true }, oldPurchase);
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

    let purchase: any;

    // adding props to parsedQuery
    parsedQuery.userId = user.uid;
    parsedQuery.uid = parsedParams.purchaseId;

    try {
      purchase = await this.purchaseService.getAllPurchases(parsedQuery);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // parse response payload
    purchase = _.map(purchase, this.purchaseService.getParsedPurchaseResponsePayload);

    return response.status(200).send({ purchase });
  }
}
