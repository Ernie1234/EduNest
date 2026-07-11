import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { QueueModule } from './queue/queue.module';
import { AcademicsModule } from './academics/academics.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { JobsModule } from './jobs/jobs.module';
import { MessagingModule } from './messaging/messaging.module';
import { AiModule } from './ai/ai.module';
import { MediaModule } from './media/media.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development'],
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    QueueModule,
    AcademicsModule,
    AdmissionsModule,
    JobsModule,
    MessagingModule,
    AiModule,
    MediaModule,
    ComplaintsModule,
    CalendarModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
