// third party imports
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';

// innter imports
import * as _ from 'lodash';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      message = _.defaultTo(exception.message, 'Bad Request');
    } else if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
      message = _.defaultTo(exception.message, 'Unauthorized');
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
