// third party imports
import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { parseBoolean } from 'src/utils';
import { QueryParams } from 'src/interfaces';
import { Category } from 'src/schemas/category.schema';
import { CreateOrUpdateCategoryDto } from 'src/dto/category.dto';
import {
  _getUidAggregationFilter,
  _getSlugAggregationFilter,
  _getActiveAggregationFilter,
} from 'src/helpers/aggregationFilters';

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<Category>) {}

  async getAllCategories(query: QueryParams) {
    const aggregationQuery = [
      ..._getActiveAggregationFilter(query),
      ..._getSlugAggregationFilter(query),
      ..._getUidAggregationFilter(query),
    ];

    let categories = [];

    if (_.isEmpty(aggregationQuery)) {
      return categories;
    }

    try {
      const baseQuery = [{ $match: { $and: aggregationQuery } }];

      console.log('CATEGORY AGGREGATION QUERY', JSON.stringify(baseQuery));

      categories = await this.categoryModel.aggregate(baseQuery);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return categories;
  }

  async deleteCategory(categoryUid: string) {
    try {
      await this.categoryModel.updateOne({ uid: categoryUid }, { active: false });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return true;
  }

  async createOrUpdateCategories(category: any, oldCategory: any, user: any) {
    const payload = this.getCreateOrUpdateCategoryPayload(category, oldCategory, user);

    try {
      await this.categoryModel.updateOne({ uid: payload.uid }, payload, {
        upsert: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return payload;
  }

  getCreateOrUpdateCategoryPayload(
    product: any = {},
    oldCategory: any = {},
    user: any = {},
  ): CreateOrUpdateCategoryDto {
    const payload = {
      uid: _.defaultTo(oldCategory.uid, nanoid()),
      name: _.defaultTo(product.name, oldCategory.name),
      slug: _.defaultTo(product.slug, oldCategory.slug),
      user_id: _.defaultTo(oldCategory.user_id, user.uid),
      active: parseBoolean(product.active, oldCategory.active),
      description: _.defaultTo(product.description, oldCategory.description),
    };

    return payload;
  }

  getParsedCategoryPayload(body: any = {}, user: any = {}) {
    const { active, name, uid, description } = body;

    const payload: any = {
      uid: _.defaultTo(uid, null),
      name: _.defaultTo(name, null),
      active: parseBoolean(active, true),
      user_id: _.defaultTo(user.uid, null),
      description: _.defaultTo(description, null),
    };

    return payload;
  }

  getParsedCategoryResponsePayload(payload: any) {
    payload = _.omit(payload, ['_id', '__v', '$setOnInsert']);

    return payload;
  }
}
