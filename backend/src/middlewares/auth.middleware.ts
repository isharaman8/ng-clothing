// third party imports
import { NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Injectable, InternalServerErrorException, NestMiddleware } from '@nestjs/common';

// inner imports
import { parseArray } from 'src/utils';
import { CRequest, CResponse } from 'src/interfaces';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(request: CRequest, response: CResponse, next: NextFunction) {
    const token = this.extractTokenFromHeader(request);

    let payload: any;

    if (!token) {
      return response.status(401).send({ message: 'no token provided' });
    }

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    request['user'] = payload;

    return next();
  }

  private extractTokenFromHeader(request: CRequest): string | undefined {
    const [type, token] = parseArray(request.headers.authorization?.split(' '), []);

    return type === 'Bearer' ? token : undefined;
  }
}
