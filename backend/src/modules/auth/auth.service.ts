// third party imports
import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

// inner imports
import { CreateOrUpdateUserDto } from 'src/dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async getAuthToken(user: CreateOrUpdateUserDto): Promise<string> {
    const payload = {
      roles: user.roles,
      uid: user.uid,
      username: user.username,
      email: user.email,
      active: user.active,
    };
    const token = await this.jwtService.signAsync(payload);

    return token;
  }
}
