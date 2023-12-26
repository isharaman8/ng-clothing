// third party imports
import { MongooseModule } from '@nestjs/mongoose';
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';

// inner imports
import { S3Service } from '../s3/s3.service';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { SharedService } from '../shared/shared.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { Upload, UploadSchema } from 'src/schemas/upload.schema';
import { ValidateUserMiddleware } from 'src/middlewares/validate-user.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Upload.name, schema: UploadSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [UserService, AuthService, S3Service, SharedService],
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
