// third party imports
import { MongooseModule } from '@nestjs/mongoose';
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';

// inner imports
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from 'src/schemas/user.schema';
import { ValidateUserMiddleware } from 'src/middlewares/validate-user.middleware';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [AuthController],
  providers: [UserService, AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'auth/profile', method: RequestMethod.GET })
      .apply(ValidateUserMiddleware)
      .forRoutes(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/signup', method: RequestMethod.POST },
      );
  }
}
