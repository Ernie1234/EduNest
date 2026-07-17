import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MessagingModule } from '../messaging/messaging.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    MessagingModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ChatGateway],
})
export class RealtimeModule {}
