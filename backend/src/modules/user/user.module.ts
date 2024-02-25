// third party imports
import { MongooseModule } from '@nestjs/mongoose';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// inner imports
import { UserService } from './user.service';
import { S3Service } from '../s3/s3.service';
import { UserController } from './user.controller';
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
  controllers: [UserController],
  providers: [UserService, S3Service, SharedService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const allowdRoutes = [
      { path: 'user', method: RequestMethod.POST },
      { path: 'user/:user_id', method: RequestMethod.PATCH },
    ];

    consumer
      .apply(AuthMiddleware)
      .forRoutes(...allowdRoutes)
      .apply(ValidateUserMiddleware)
      .forRoutes({ path: 'user', method: RequestMethod.POST }, { path: 'user/:user_id', method: RequestMethod.PATCH });
  }
}
