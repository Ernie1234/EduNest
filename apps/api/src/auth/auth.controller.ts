import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import type { AccessTokenPayload, GoogleProfileInput } from '@workspace/types';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth2 login flow' })
  @ApiResponse({ status: 302, description: 'Redirects to Google for authentication' })
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {
    /* redirects to Google */
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Initiate Google OAuth2 callback' })
  @ApiResponse({ status: 302, description: 'Redirects to Google for authentication' })
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const profile = req.user as GoogleProfileInput | undefined;
    if (!profile?.email) {
      throw new UnauthorizedException('Missing Google profile');
    }
    const user = await this.auth.loginWithGoogle(profile);
    const token = this.auth.signAccessToken(user);
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: maxAgeMs,
      path: '/',
    });
    const frontend = this.config.getOrThrow<string>('FRONTEND_URL');
    res.redirect(`${frontend}/auth/callback`);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'Returns the current user information' })
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() tokenUser: AccessTokenPayload) {
    const user = await this.users.findById(tokenUser.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.toPublicUser(user);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout the current user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  logout(@Res({ passthrough: true }) res: Response) {
    const secure = process.env.NODE_ENV === 'production';
    res.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure,
    });
    return { ok: true };
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
  }
}
