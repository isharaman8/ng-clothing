// third party imports
import * as _ from 'lodash';
import {
  Res,
  Req,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Controller,
  InternalServerErrorException,
  Delete,
} from '@nestjs/common';

// inner imports
import { CreateOrUpdateProductDto } from 'src/dto';
import { ProductService } from './product.service';
import { CRequest, CResponse } from 'src/interfaces';
import {
  _getParsedParams,
  _getParsedProductBody,
  _getParsedProductResponsePayload,
  _getParsedQuery,
} from 'src/helpers/parser';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async getProducts(@Query() query: any, @Res() response: CResponse) {
    const parsedQuery = _getParsedQuery(query);

    let products = [];

    try {
      products = await this.productService.getAllProducts(parsedQuery);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // parse response payload
    products = _.map(products, _getParsedProductResponsePayload);

    return response.status(200).send({ products });
  }

  @Get(':product_uid')
  async getProductByUid(@Query() query: any, @Param() params: any, @Res() response: CResponse) {
    let product: any;

    const parsedQuery = _getParsedQuery(query);
    const parsedParams = _getParsedParams(params);

    parsedQuery.uid = parsedParams.productId;

    try {
      product = await this.productService.getAllProducts(parsedQuery);

      if (product.length) {
        product = product[0];
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // parse response payload
    product = _getParsedProductResponsePayload(product);

    return response.status(200).send({ products: [product] });
  }

  @Post('')
  async createProduct(
    @Body('product') product: CreateOrUpdateProductDto,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    const { oldProduct } = response.locals;
    const { user = {} } = request;
    const payload = _getParsedProductBody(product);

    // remove unwanted attributes
    delete payload.active;

    let createdProduct: any;

    try {
      createdProduct = await this.productService.createOrUpdateProduct(payload, oldProduct, user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return response.status(201).send({ product: _getParsedProductResponsePayload(createdProduct) });
  }

  @Patch(':product_uid')
  async updateProduct(
    @Body('product') product: CreateOrUpdateProductDto,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    const { oldProduct } = response.locals;
    const payload = _getParsedProductBody(product);
    const { user = {} } = request;

    let createdProduct: any;

    try {
      createdProduct = await this.productService.createOrUpdateProduct(payload, oldProduct, user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return response.status(200).send({ product: _getParsedProductResponsePayload(createdProduct) });
  }

  @Delete(':product_uid')
  async deleteProduct(@Param() params: any, @Res() response: CResponse) {
    const parsedParams = _getParsedParams(params);

    try {
      await this.productService.deleteProduct(parsedParams.productId);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return response.status(204).send();
  }
}
