// third party imports
import * as _ from 'lodash';
import { Res, Req, Get, Body, Post, Patch, Param, Query, Controller } from '@nestjs/common';

// inner imports
import { parseArray } from 'src/utils';
import { CreateOrUpdatePurchaseDto } from 'src/dto';
import { CRequest, CResponse } from 'src/interfaces';
import { PurchaseService } from './purchase.service';
import { ALLOWED_PURCHASE_STATUS } from 'src/constants/constants';
import { UserAddressService } from '../user/user-address.service';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';
import { SharedProductService } from '../shared/shared-product.service';

@Controller('purchase')
export class PurchaseController {
  constructor(
    private purchaseService: PurchaseService,
    private userAddressService: UserAddressService,
    private sharedProductService: SharedProductService,
  ) {}

  // inner helpers
  private async getPurchasesHandler(query: any, params: any, request: CRequest, response: CResponse) {
    const parsedQuery = _getParsedQuery(query);
    const parsedParams = _getParsedParams(params);
    const { user = {} } = request;

    let purchases: any = [],
      userAddresses: any = [];

    // adding props to parsedQuery
    if (!_.includes(parseArray(user.roles, []), 'admin') || !parsedQuery.userId) {
      parsedQuery['userId'] = user.uid;
    }

    if (parsedParams.purchaseId) {
      parsedQuery['uid'] = parsedParams.purchaseId;
    }

    purchases = await this.purchaseService.getAllPurchases(parsedQuery);
    purchases = await this.purchaseService.getUpatedPurchaseImageUrls(purchases);

    // finding required purchase addresses
    const userAddressesUids = _.compact(_.map(purchases, (purchase) => purchase.address_id));
    const findAddressQuery = _getParsedQuery({ uid: userAddressesUids, user_id: request.user.uid });

    userAddresses = await this.userAddressService.getAllUserAddresses(findAddressQuery);
    userAddresses = _.map(userAddresses, this.userAddressService.getParsedUserAddressResponsePayload);

    purchases = _.map(purchases, (purchase) =>
      this.purchaseService.getParsedPurchaseResponsePayload(purchase, userAddresses),
    );

    return response.status(200).send({ purchases });
  }

  @Post('')
  async createPurchase(
    @Body('purchase') _purchase: CreateOrUpdatePurchaseDto,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    const { user = {} } = request;
    const { oldPurchase, userAddresses } = response.locals;
    const payload = response.locals.purchase;

    let createdPurchase = await this.purchaseService.createOrUpdatePurchase(payload, oldPurchase, user);

    // get updated image urls
    let tempPurchase = await this.purchaseService.getUpatedPurchaseImageUrls([createdPurchase]);
    createdPurchase = tempPurchase[0];

    // update sizes in products
    const productSizeBulkUpdateArray = this.purchaseService.getUpdatedProductSizes(createdPurchase.products);

    await this.sharedProductService.bulkUpdateOp(productSizeBulkUpdateArray);

    return response
      .status(201)
      .send({ purchase: this.purchaseService.getParsedPurchaseResponsePayload(createdPurchase, userAddresses) });
  }

  @Get('')
  async getPurchases(@Query() query: any, @Req() request: CRequest, @Res() response: CResponse) {
    await this.getPurchasesHandler(query, {}, request, response);
  }

  @Get(':purchase_uid')
  async getPurchaseByUid(
    @Query() query: any,
    @Param() params: any,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    await this.getPurchasesHandler(query, params, request, response);
  }

  @Get('/dev/get-all-purchases')
  async devGetAllPurchases(@Req() request: CRequest, @Res() response: CResponse) {
    let purchases = await this.purchaseService.devGetAllPurchases();
    let userAddresses: any = [];

    // finding required purchase addresses
    const userAddressesUids = _.compact(_.map(purchases, (purchase) => purchase.address_id));
    const findAddressQuery = _getParsedQuery({ uid: userAddressesUids, user_id: request.user.uid });

    userAddresses = await this.userAddressService.getAllUserAddresses(findAddressQuery);
    userAddresses = _.map(userAddresses, this.userAddressService.getParsedUserAddressResponsePayload);

    purchases = await this.purchaseService.getUpatedPurchaseImageUrls(purchases);
    purchases = _.map(purchases, (purchase) =>
      this.purchaseService.getParsedPurchaseResponsePayload(purchase, userAddresses),
    );

    return response.status(200).send({ purchases });
  }

  @Patch(':purchase_uid/verify')
  async verifyPurchase(@Param() _params: any, @Res() response: CResponse) {
    const { oldPurchase = {} } = response.locals;

    await this.purchaseService.createOrUpdatePurchase(
      { verified: true, status: ALLOWED_PURCHASE_STATUS.verified },
      oldPurchase,
    );

    return response.status(204).send();
  }
}
