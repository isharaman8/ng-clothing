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

  async sendEmail(dynamicTemplateData: any, dynamicTemplateUid: string, toEmails: Array<string>): Promise<void> {
    const payload: any = {
      from: { email: this.sendgridConfigObj.sender },
      personalizations: [
        {
          to: toEmails,
          dynamic_template_data: dynamicTemplateData,
        },
      ],
      template_id: dynamicTemplateUid,
    };
    console.log('MAIL PAYLOAD', JSON.stringify(payload));

    try {
      await sgMail.send(payload);
    } catch (error) {
      console.log(`[SENDGRID ERROR]: ${error}`);
    }
  }
}
