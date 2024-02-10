// third party imports
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';

// innter imports
import * as _ from 'lodash';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const tempException = JSON.parse(JSON.stringify(exception));

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = _.defaultTo(tempException?.response?.message, 'Internal Server Error');

    if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      message = _.defaultTo(tempException?.response?.message, 'Bad Request');
    } else if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
      message = _.defaultTo(tempException?.response?.message, 'Unauthorized');
    } else if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = _.defaultTo(tempException?.response?.message, 'Unauthorized');
    }

    console.log('[EXCEPTION]', exception);

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
