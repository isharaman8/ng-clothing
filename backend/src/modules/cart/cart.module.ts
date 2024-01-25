// third party imports
import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

// inner imports
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const allowedRoutes = [];

    consumer.apply(AuthMiddleware).forRoutes(...allowedRoutes);
  }
}
