import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { AccessTokenPayload, GoogleProfileInput } from '@workspace/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async loginWithGoogle(profile: GoogleProfileInput): Promise<User> {
    if (!profile.email) {
      throw new UnauthorizedException('Google account has no email');
    }
    return this.users.upsertFromGoogle(profile);
  }

  signAccessToken(user: User): string {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwt.sign(payload);
  }
}
