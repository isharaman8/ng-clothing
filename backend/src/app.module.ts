// third party imports
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

// inner imports
import { config } from './config/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const mongodbConfig = configService.get('mongodb');

        return {
          uri: mongodbConfig.uri,
          dbName: mongodbConfig.dbName,
          user: mongodbConfig.username,
          pass: mongodbConfig.password,
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
