// third party imports
import * as _ from 'lodash';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';

// inner imports
import { CreateOrUpdateCategoryDto } from 'src/dto';
import { CRequest, CResponse } from 'src/interfaces';
import { CategoryService } from './category.service';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  // internal helpers
  private async createOrUpdateCategory(
    request: CRequest,
    response: CResponse,
    statusCode: number,
    type: 'create' | 'update',
  ) {
    const { oldCategory, category: payload } = response.locals;
    const { user = {} } = request;

    // remove unwanted attributes in create request
    if (type === 'create') {
      delete payload.active;
    }

    let createdCategory: any;

    createdCategory = await this.categoryService.createOrUpdateCategories(payload, oldCategory, user);

    return response
      .status(statusCode)
      .send({ category: this.categoryService.getParsedCategoryResponsePayload(createdCategory) });
  }

  @Get()
  async getAllCategories(@Query() _query: any) {
    const query = _getParsedQuery(_query);

    let category = [];

    category = await this.categoryService.getAllCategories(query);
    category = _.map(category, this.categoryService.getParsedCategoryResponsePayload);

    return { categories: category };
  }

  @Post()
  async createCategory(
    @Body('category') _product: CreateOrUpdateCategoryDto,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    await this.createOrUpdateCategory(request, response, 201, 'create');
  }

  @Patch(':category_uid')
  async updateCategory(
    @Body('category') _category: Partial<CreateOrUpdateCategoryDto>,
    @Req() request: CRequest,
    @Res() response: CResponse,
  ) {
    await this.createOrUpdateCategory(request, response, 200, 'update');
  }

  @Delete(':category_uid')
  async deleteCategory(@Param() params: any, @Res() response: CResponse) {
    const parsedParams = _getParsedParams(params);

    await this.categoryService.deleteCategory(parsedParams.categoryId);

    return response.status(204).send();
  }
}
