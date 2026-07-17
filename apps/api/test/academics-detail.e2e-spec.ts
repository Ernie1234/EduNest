import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Covers tickets 030/031's backend additions: the course-offering detail
 * endpoint, grade-augmented assessments, and the calendar courseOfferingId
 * filter. Tokens are minted in-process via JwtService (never printed/logged).
 * Requires a migrated and seeded local database — run with `pnpm test:e2e`.
 */
describe('Course detail & timetable backend (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let studentToken: string;

  let ecoOfferingId: string;
  let accOfferingId: string;

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

    ecoOfferingId = (
      await prisma.courseOffering.findFirstOrThrow({ where: { course: { code: 'ECO201' } } })
    ).id;
    accOfferingId = (
      await prisma.courseOffering.findFirstOrThrow({ where: { course: { code: 'ACC202' } } })
    ).id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /academics/course-offerings/:id', () => {
    it('returns course, instructors, modules/lessons with progress, and lesson/completed totals', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/academics/course-offerings/${ecoOfferingId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.course.code).toBe('ECO201');
      expect(res.body.totalLessons).toBe(36);
      expect(res.body.completedLessons).toBe(22);
      expect(res.body.instructors.some((i: { name: string }) => i.name === 'Prof. Ngozi Okeke')).toBe(
        true,
      );
      expect(Array.isArray(res.body.modules)).toBe(true);
      expect(res.body.modules[0].lessons[0]).toHaveProperty('completed');
      // Seeded live class for ECO201 is LIVE.
      expect(res.body.nextLiveClass?.status).toBe('LIVE');
    });

    it('404s for an unknown course offering id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/academics/course-offerings/does-not-exist')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });

  describe('GET /academics/course-offerings/:id/assessments', () => {
    it("includes the caller's own grade per assessment", async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/academics/course-offerings/${accOfferingId}/assessments`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      for (const assessment of res.body) {
        expect(assessment).toHaveProperty('myGrade');
      }
      const cat1 = res.body.find((a: { title: string }) => a.title === 'CAT 1');
      expect(cat1.myGrade).toBe(80);
    });
  });

  describe('GET /calendar/events?courseOfferingId=', () => {
    it('filters events down to the given course offering', async () => {
      const [filtered, unfiltered] = await Promise.all([
        request(app.getHttpServer())
          .get('/api/v1/calendar/events')
          .query({ courseOfferingId: ecoOfferingId })
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200),
        request(app.getHttpServer())
          .get('/api/v1/calendar/events')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200),
      ]);

      expect(filtered.body.length).toBeGreaterThan(0);
      expect(
        filtered.body.every(
          (event: { courseOfferingId: string | null }) => event.courseOfferingId === ecoOfferingId,
        ),
      ).toBe(true);
      expect(unfiltered.body.length).toBeGreaterThanOrEqual(filtered.body.length);
    });
  });
});
