// third party imports
import * as _ from 'lodash';
import slugify from 'slugify';
import { Model } from 'mongoose';
import { NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

// inner imports
import { _notEmpty, parseArray } from 'src/utils';
import { CreateOrUpdateCategoryDto } from 'src/dto';
import { CRequest, CResponse } from 'src/interfaces';
import { Category } from 'src/schemas/category.schema';
import { ALLOWED_USER_ROLES } from 'src/constants/constants';
import { _getParsedParams, _getParsedQuery } from 'src/helpers/parser';
import { CategoryService } from 'src/modules/category/category.service';

@Injectable()
export class ValidateCategoryMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private categoryService: CategoryService,
  ) {}

  validateUserRole(user: any) {
    let validUserRole = false;

    const roles = parseArray(user.roles, []);

    for (const role of roles) {
      if (_.includes(ALLOWED_USER_ROLES.category, role)) {
        validUserRole = true;
      }
    }

    if (!validUserRole) {
      throw new UnauthorizedException('not authorized for creating/updating/deleting category');
    }
  }

  validatePatchRequest(method: string, oldCategory: CreateOrUpdateCategoryDto) {
    if (method.toUpperCase() === 'PATCH' && !oldCategory) {
      throw new NotFoundException('category not found');
    }
  }

  validateDeleteRequest(method: string, oldCategory?: CreateOrUpdateCategoryDto) {
    if (method.toUpperCase() === 'DELETE') {
      if (!oldCategory) {
        throw new NotFoundException('category not found');
      }
    }
  }

  validatePostRequest(method: string, category: CreateOrUpdateCategoryDto) {
    if (method.toUpperCase() === 'POST') {
      if (!category.user_id) {
        throw new UnauthorizedException('user_id required to create category');
      }
    }
  }

  async validateAndParseCategorySlug(category: CreateOrUpdateCategoryDto) {
    if (category.name) {
      const slug = slugify(category.name).toLowerCase();

      let tempCategory: any;

      try {
        const reqdSlugQuery = _getParsedQuery({ slug });
        reqdSlugQuery['active'] = null;

        tempCategory = await this.categoryService.getAllCategories(reqdSlugQuery);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }

      if (!_.isEmpty(tempCategory) && tempCategory.uid !== category.uid) {
        throw new BadRequestException('slug already exists');
      }

      return slug;
    }

    return category.slug;
  }

  async use(req: CRequest, res: CResponse, next: NextFunction) {
    const {
      user = {},
      body: { category = {} },
    } = req;

    const params = _getParsedParams(req.params);
    const parsedCategory = this.categoryService.getParsedCategoryPayload(category, user);
    const findQuery = _getParsedQuery({ uid: params.categoryId });

    findQuery['active'] = null;

    this.validateUserRole(user);

    let oldCategory: any;

    const tempOldCategory = await this.categoryService.getAllCategories(findQuery);

    oldCategory = _.last(tempOldCategory);

    this.validatePostRequest(req.method, parsedCategory);
    this.validatePatchRequest(req.method, oldCategory);
    this.validateDeleteRequest(req.method, oldCategory);

    parsedCategory.slug = await this.validateAndParseCategorySlug(parsedCategory);

    if (!oldCategory || req.method.toUpperCase() === 'POST') {
      oldCategory = new this.categoryModel();
    }

    // attach to response
    res.locals.oldCategory = oldCategory;
    res.locals.category = parsedCategory;

    next();
  }
}
