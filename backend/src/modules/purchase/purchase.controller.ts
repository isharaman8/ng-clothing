// third party imports
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
import * as _ from 'lodash';

// inner imports
import { CreateOrUpdatePurchaseDto } from 'src/dto';
import {
  _getParsedParams,
  _getParsedPurchaseBody,
  _getParsedPurchaseResponsePayload,
  _getParsedQuery,
} from 'src/helpers/parser';
import { CRequest, CResponse } from 'src/interfaces';
import { PurchaseService } from './purchase.service';

@Controller('purchase')
export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

  @Post(':purchase_uid')
  async createPurchase(
    @Body('purchase') purchase: CreateOrUpdatePurchaseDto,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    const { user = {} } = request;
    const { oldPurchase } = response.locals;
    const payload = _getParsedPurchaseBody(purchase);

    let createdPurchase: any;

    try {
      createdPurchase = await this.purchaseService.createOrUpdatePurchase(payload, oldPurchase, user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return response.status(201).send({ purchase: _getParsedPurchaseResponsePayload(createdPurchase) });
  }

  @Patch(':purchase_uid/verify')
  async verifyPurchase(@Param() params: any, @Res() response: CResponse) {
    const { oldPurchase = {} } = response.locals;

    let updatedPurchase: any;

    try {
      updatedPurchase = await this.purchaseService.createOrUpdatePurchase({ verified: true }, oldPurchase);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
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
    purchases = _.map(purchases, _getParsedPurchaseResponsePayload);

    return response.status(200).send({ purchases });
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

      if (purchase.length) {
        purchase = purchase[0];
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // parse response payload
    purchase = _getParsedPurchaseResponsePayload(purchase);

    return response.status(200).send({ products: [purchase] });
  }
}
