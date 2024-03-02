// third party imports
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

// inner imports
import { CreateOrUpdateUserDto } from 'src/dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async getAuthToken(user: CreateOrUpdateUserDto): Promise<string> {
    const payload = {
      uid: user.uid,
      roles: user.roles,
      email: user.email,
      active: user.active,
      username: user.username,
    };
    const token = await this.jwtService.signAsync(payload);

    return token;
  }
}
