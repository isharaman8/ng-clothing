// third party imports
import { Response } from 'express';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';

@Controller('product')
export class ProductController {
  @Get()
  hello(@Res() response: Response) {
    return response.status(200).send({ user: 'hello' });
  }
}
