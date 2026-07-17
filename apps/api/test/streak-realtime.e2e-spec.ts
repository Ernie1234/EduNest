import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { STREAK_FREEZE_MONTHLY_ALLOWANCE } from '../src/streak/streak.constants';

/**
 * Covers the streak/lesson-engagement/dashboard/live-class/messaging additions
 * built alongside the Dashboard, Live Class, and Streak pages. Tokens are
 * minted in-process via JwtService (never printed/logged). Requires a
 * migrated and seeded local database — run with `pnpm test:e2e`.
 */
describe('Streak, dashboard, live classes & messaging (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let studentToken: string;
  let registrarToken: string;

  let ecoOfferingId: string;
  let sampleLessonId: string;
  let liveClassId: string;
  let chatRoomId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    const jwt = app.get(JwtService);

    const student = await prisma.user.findUniqueOrThrow({
      where: { email: 'nancy.graham@edunest.com' },
    });
    studentToken = jwt.sign({ sub: student.id, email: student.email, role: student.role });

    const registrar = await prisma.user.findUniqueOrThrow({
      where: { email: 'registrar@edunest.com' },
    });
    registrarToken = jwt.sign({ sub: registrar.id, email: registrar.email, role: registrar.role });

    const ecoOffering = await prisma.courseOffering.findFirstOrThrow({
      where: { course: { code: 'ECO201' } },
    });
    ecoOfferingId = ecoOffering.id;

    const lesson = await prisma.lesson.findFirstOrThrow({
      where: { courseModule: { courseOfferingId: ecoOfferingId } },
    });
    sampleLessonId = lesson.id;

    const liveClass = await prisma.liveClass.findUniqueOrThrow({
      where: { id: 'seed-live-class-eco201' },
      include: { chatRoom: true },
    });
    liveClassId = liveClass.id;
    if (!liveClass.chatRoom) throw new Error('Seeded ECO201 live class has no chat room');
    chatRoomId = liveClass.chatRoom.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /academics/lessons/:id/engage', () => {
    it('records progress and rolls it into today\'s study activity', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/academics/lessons/${sampleLessonId}/engage`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ secondsSpent: 120, completed: true })
        .expect(201);

      expect(res.body.completed).toBe(true);
      expect(res.body.timeSpentSeconds).toBeGreaterThanOrEqual(120);
    });

    it('404s for an unknown lesson', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/academics/lessons/does-not-exist/engage')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ secondsSpent: 60 })
        .expect(404);
    });
  });

  describe('GET /streak', () => {
    it('computes current/longest streak from seeded StudyActivity + freeze', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/streak')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.currentStreak).toBeGreaterThanOrEqual(14);
      expect(res.body.longestStreak).toBeGreaterThanOrEqual(14);
      expect(res.body.totalStudyDays).toBeGreaterThanOrEqual(13);
      // STREAK_FREEZE_MONTHLY_ALLOWANCE minus the one freeze already spent on the seeded gap day.
      expect(res.body.freezesLeftThisMonth).toBe(STREAK_FREEZE_MONTHLY_ALLOWANCE - 1);
      expect(res.body.thisWeek).toHaveLength(7);
      const milestoneDays = res.body.milestones.map((m: { days: number }) => m.days);
      expect(milestoneDays).toEqual([3, 7, 30]);
      expect(res.body.milestones[0].achieved).toBe(true);
      expect(res.body.milestones[2].achieved).toBe(false);
    });
  });

  describe('POST /streak/use-freeze', () => {
    it('rejects freezing a day that already counts', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/streak/use-freeze')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({})
        .expect(400);

      expect(res.body.message).toMatch(/already counts/i);
    });
  });

  describe('GET /academics/dashboard-summary', () => {
    it('returns aggregate stats for the caller', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/academics/dashboard-summary')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.totalCourses).toBe(7);
      expect(res.body.attendanceRatePercent).toBe(92);
      expect(res.body.pendingAssignments).toBeGreaterThan(0);
    });
  });

  describe('GET /academics/live-classes', () => {
    it("lists the caller's live classes with course context", async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/academics/live-classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const eco = res.body.find((lc: { id: string }) => lc.id === liveClassId);
      expect(eco).toBeDefined();
      expect(eco.courseCode).toBe('ECO201');
    });
  });

  describe('GET /academics/live-classes/:id', () => {
    it('returns full detail with chat room, participants, and AI jobs', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/academics/live-classes/${liveClassId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.chatRoomId).toBe(chatRoomId);
      expect(res.body.participants.some((p: { name: string }) => p.name === 'Nancy Graham')).toBe(
        true,
      );
      expect(res.body.aiJobs).toHaveLength(2);
    });
  });

  describe('Messaging', () => {
    it('lists chat room messages in the ChatRoomMessage shape', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/messaging/rooms/${chatRoomId}/messages`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('senderId');
      expect(res.body[0]).toHaveProperty('senderName');
      expect(res.body[0]).toHaveProperty('createdAt');
    });

    it('lets a participant send a message via REST', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/messaging/rooms/${chatRoomId}/messages`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ content: 'e2e test message' })
        .expect(201);

      expect(res.body.content).toBe('e2e test message');
      expect(res.body.senderId).toBeDefined();
    });

    it('rejects sending from a non-participant', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/messaging/rooms/${chatRoomId}/messages`)
        .set('Authorization', `Bearer ${registrarToken}`)
        .send({ content: 'should not be allowed' })
        .expect(403);
    });
  });
});
