// inner imports
import { CResponse } from './interfaces';
import { AppService } from './app.service';

// third party imports
import { Controller, Get, Res } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/ping')
  getServicePing(@Res() response: CResponse) {
    return response.status(200).send();
  }
}
