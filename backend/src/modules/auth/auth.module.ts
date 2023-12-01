// third party imports
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';

// inner imports
import { AuthService } from './auth.service';
import { parseObject } from '../../utils/general';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from 'src/schemas/user.schema';
import { ValidateUserMiddleware } from 'src/middlewares/validate-user.middleware';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const jwtConfig = configService.get('jwt');

        return {
          global: jwtConfig.global,
          secret: jwtConfig.secret,
          signOptions: parseObject(jwtConfig.signOptions, {}),
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [UserService, AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidateUserMiddleware)
      .forRoutes(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/signup', method: RequestMethod.POST },
      );
  }
}
