// third party imports
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

// inner imports
import { parseObject } from './utils';
import { config } from './config/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { S3Module } from './modules/s3/s3.module';
import { UserModule } from './modules/user/user.module';
import { CartModule } from './modules/cart/cart.module';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './modules/shared/shared.module';
import { ProductModule } from './modules/product/product.module';
import { PurchaseModule } from './modules/purchase/purchase.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const { global, secret, signOptions } = parseObject(configService.get('jwt'), {});

        return { global, secret, signOptions: parseObject(signOptions, {}) };
      },
      inject: [ConfigService],
      global: true,
    }),
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const { uri, dbName, username: user, password: pass } = parseObject(configService.get('mongodb'), {});

        return { uri, dbName, user, pass };
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    ProductModule,
    PurchaseModule,
    S3Module,
    SharedModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
