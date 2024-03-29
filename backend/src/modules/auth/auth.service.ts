// third party imports
import * as _ from 'lodash';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

// inner imports
import { parseObject } from 'src/utils';
import { ConfigService } from '@nestjs/config';
import { CreateOrUpdateUserDto } from 'src/dto';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { SENDGRID_TEMPLATE_UIDS } from 'src/constants/constants';

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
      name: user.name,
      roles: user.roles,
      email: user.email,
      active: user.active,
      username: user.username,
      is_verified: user.is_verified,
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

    const toEmails = [user.email];
    const reqdDynamicTemplateUid = SENDGRID_TEMPLATE_UIDS.verify_email;
    const verificationUrl = `${apiConfig.apiUrl}/auth/verify?token=${auth_token}`;
    const payload = {
      full_name: user.name,
      verify_link: verificationUrl,
    };

    this.sendgridService.sendEmail(payload, reqdDynamicTemplateUid, toEmails);
  }
}
