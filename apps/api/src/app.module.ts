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
import { SchoolModule } from './school/school.module';
import { SemestersModule } from './semesters/semesters.module';
import { ScoringModule } from './scoring/scoring.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { NewsModule } from './news/news.module';
import { StreakModule } from './streak/streak.module';
import { RealtimeModule } from './realtime/realtime.module';

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
    SchoolModule,
    SemestersModule,
    ScoringModule,
    AnnouncementsModule,
    NewsModule,
    StreakModule,
    RealtimeModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
