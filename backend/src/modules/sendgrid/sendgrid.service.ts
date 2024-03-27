// third party imports
import * as sgMail from '@sendgrid/mail';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// inner imports
import { parseObject } from 'src/utils';

@Injectable()
export class SendgridService {
  private sendgridConfigObj: any = {};

  constructor(private configService: ConfigService) {
    this.sendgridConfigObj = parseObject(this.configService.get('sendgrid'), {});

    sgMail.setApiKey(this.sendgridConfigObj.apiKey);
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const msg = {
      to,
      from: this.sendgridConfigObj.sender,
      subject,
      text,
    };

    console.log('MAIL PAYLOAD', JSON.stringify(msg));

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.log(`[SENDGRID ERROR]: ${error}`);
    }
  }
}
