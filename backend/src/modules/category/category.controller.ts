// third party imports
import * as _ from 'lodash';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';

// inner imports
import { CreateOrUpdateCategoryDto } from 'src/dto';
import { CRequest, CResponse } from 'src/interfaces';
import { CategoryService } from './category.service';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  async getAllCategories(@Query() _query: any) {
    const query = _getParsedQuery(_query);

    let category = [];

    category = await this.categoryService.getAllCategories(query);
    category = _.map(category, this.categoryService.getParsedCategoryResponsePayload);

    return { categories: category };
  }

  @Post()
  async createProduct(
    @Body('category') _product: CreateOrUpdateCategoryDto,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    const { oldCategory, category: payload } = response.locals;
    const { user = {} } = request;

    // remove unwanted attributes
    delete payload.active;

    let createdCategory: any;

    createdCategory = await this.categoryService.createOrUpdateCategories(payload, oldCategory, user);

    return response
      .status(201)
      .send({ category: this.categoryService.getParsedCategoryResponsePayload(createdCategory) });
  }

  @Patch(':category_uid')
  async updateProduct(
    @Body('category') _product: Partial<CreateOrUpdateCategoryDto>,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    const { oldCategory, category: payload } = response.locals;

    const { user = {} } = request;

    let createdProduct: any;

    createdProduct = await this.categoryService.createOrUpdateCategories(payload, oldCategory, user);

    return response
      .status(200)
      .send({ category: this.categoryService.getParsedCategoryResponsePayload(createdProduct) });
  }

  @Delete(':category_uid')
  async deleteCategory(@Param() params: any, @Res() response: CResponse) {
    const parsedParams = _getParsedParams(params);

    await this.categoryService.deleteCategory(parsedParams.categoryId);

    return response.status(204).send();
  }
}
