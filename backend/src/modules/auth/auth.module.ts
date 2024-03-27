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
import { SendgridService } from '../sendgrid/sendgrid.service';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { Upload, UploadSchema } from 'src/schemas/upload.schema';
import { UserAddressService } from '../user/user-address.service';
import { ValidateUserMiddleware } from 'src/middlewares/validate-user.middleware';
import { UserAddress, UserAddressSchema } from 'src/schemas/user-address.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Upload.name, schema: UploadSchema },
      { name: UserAddress.name, schema: UserAddressSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [UserService, AuthService, S3Service, SharedService, UserAddressService, SendgridService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const jwtRoutes = [
      { path: 'auth/profile', method: RequestMethod.GET },
      { path: 'auth/profile/update', method: RequestMethod.PATCH },
      { path: 'auth/send-verification-email', method: RequestMethod.POST },
    ];

    consumer
      .apply(AuthMiddleware)
      .forRoutes(...jwtRoutes)
      .apply(ValidateUserMiddleware)
      .forRoutes(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/signup', method: RequestMethod.POST },
        { path: 'auth/profile/update', method: RequestMethod.PATCH },
      );
  }
}
