// third party imports
import * as _ from 'lodash';
import { JwtService } from '@nestjs/jwt';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// inner imports
import { parseObject } from 'src/utils';
import { ConfigService } from '@nestjs/config';
import { CreateOrUpdateUserDto } from 'src/dto';
import { SendgridService } from '../sendgrid/sendgrid.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private sendgridService: SendgridService,
  ) {}

  async getAuthToken(user: CreateOrUpdateUserDto): Promise<string> {
    const payload = {
      uid: user.uid,
      roles: user.roles,
      email: user.email,
      active: user.active,
      username: user.username,
    };
    const token = await this.jwtService.signAsync(payload);

    return token;
  }

  async getPayloadFromToken(token: string): Promise<any> {
    const user = await this.jwtService.verifyAsync(token);

    return user;
  }

  async sendVerificationEmail(responsePayload: any) {
    const { user = {}, auth_token = null } = responsePayload;
    const apiConfig = parseObject(this.configService.get('api'), {});

    if (_.isEmpty(user.email) || _.isEmpty(auth_token) || _.isEmpty(apiConfig.apiUrl)) return;

    const to = user.email;
    const subject = 'Please verify you email';
    const verificationUrl = `${apiConfig.apiUrl}/auth/verify?token=${auth_token}`;
    const text = `Please click on the link to verify your email. Verification link: ${verificationUrl}`;

    this.sendgridService.sendEmail(to, subject, text);
  }
}
