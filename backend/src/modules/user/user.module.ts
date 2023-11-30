// third party imports
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// inner imports
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from 'src/schemas/user.schema';
import { ValidateUserMiddleware } from 'src/middlewares/validate-user.middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidateUserMiddleware)
      .forRoutes({ path: 'user', method: RequestMethod.POST }, { path: 'user/:user_id', method: RequestMethod.PATCH });
  }
}
