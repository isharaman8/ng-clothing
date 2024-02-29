// third party imports
import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// inner imports
import { UserService } from './user.service';
import { S3Service } from '../s3/s3.service';
import { UserController } from './user.controller';
import { SharedService } from '../shared/shared.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UserAddressService } from './user-address.service';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { Upload, UploadSchema } from 'src/schemas/upload.schema';
import { UserAddress, UserAddressSchema } from 'src/schemas/user-address.schema';
import { ValidateUserMiddleware } from 'src/middlewares/validate-user.middleware';
import { ValidateUserAddressMiddleware } from 'src/middlewares/validate-user-address.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Upload.name, schema: UploadSchema },
      { name: UserAddress.name, schema: UserAddressSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, S3Service, SharedService, UserAddressService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const allowdRoutes = [
      { path: 'user', method: RequestMethod.POST },
      { path: 'user/:user_id', method: RequestMethod.PATCH },
    ];

    const allowedAddressRoutes = [
      { path: 'user/address', method: RequestMethod.POST },
      { path: 'user/address/:user_address_uid', method: RequestMethod.PATCH },
      { path: 'user/address/:user_address_uid', method: RequestMethod.DELETE },
    ];

    consumer
      .apply(AuthMiddleware)
      .forRoutes(...allowdRoutes, ...allowedAddressRoutes)
      .apply(ValidateUserMiddleware)
      .forRoutes(...allowdRoutes)
      .apply(ValidateUserAddressMiddleware)
      .forRoutes(...allowedAddressRoutes);
  }
}
