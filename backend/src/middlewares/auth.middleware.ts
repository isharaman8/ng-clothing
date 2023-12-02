// third party imports
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Injectable, InternalServerErrorException, NestMiddleware, UnauthorizedException } from '@nestjs/common';

// inner imports
import { parseArray } from 'src/utils/general';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(request: Request, _response: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('no token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      request['user'] = payload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return next();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = parseArray(request.headers.authorization?.split(' '), []);

    return type === 'Bearer' ? token : undefined;
  }
}
