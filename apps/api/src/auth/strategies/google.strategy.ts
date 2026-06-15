import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { id, displayName, emails, photos } = profile;

    // Fix: Type 'string | undefined' to 'string'
    // We must ensure email exists, otherwise we can't authenticate the user.
    const email = emails?.[0]?.value;
    if (!email) {
      return done(new Error('No email found in Google profile'), undefined);
    }

    const imageUrl = photos?.[0]?.value
      ? photos[0].value.replace(/=s\d+-c$/, '=s400-c')
      : undefined;

    done(null, {
      googleId: id,
      email,
      name: displayName || undefined,
      image: imageUrl,
    });
  }
}
