// third party imports
import { NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Injectable, InternalServerErrorException, NestMiddleware, UnauthorizedException } from '@nestjs/common';

// inner imports
import { parseArray } from 'src/utils';
import { CRequest, CResponse } from 'src/interfaces';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(request: CRequest, _response: CResponse, next: NextFunction) {
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('no token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      request['user'] = payload;
    } catch (error) {
      if (error.message === 'invalid signature') {
        throw new UnauthorizedException('jwt error: invalid jwt token');
      }

      throw new InternalServerErrorException(error.message);
    }

    return next();
  }

  private extractTokenFromHeader(request: CRequest): string | undefined {
    const [type, token] = parseArray(request.headers.authorization?.split(' '), []);

    return type === 'Bearer' ? token : undefined;
  }
}
