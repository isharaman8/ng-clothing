// third party imports
import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// inner imports
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { ValidateCategoryMiddleware } from 'src/middlewares/validate-category.middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const allowedRoutes = [
      { path: 'category', method: RequestMethod.POST },
      { path: 'category/:category_uid', method: RequestMethod.PATCH },
      { path: 'category/:category_uid', method: RequestMethod.DELETE },
    ];

    consumer
      .apply(AuthMiddleware)
      .forRoutes(...allowedRoutes)
      .apply(ValidateCategoryMiddleware)
      .forRoutes(...allowedRoutes);
  }
}
