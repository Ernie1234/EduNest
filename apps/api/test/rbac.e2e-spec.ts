import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Exercises the ticket 012 RBAC matrix against real seeded users (see
 * apps/api/prisma/seed.ts). Tokens are minted in-process via the app's own
 * JwtService instead of going through Google OAuth. Requires a migrated and
 * seeded local database — run with `pnpm test:e2e` (not part of the CI `test`
 * script, which only matches `*.spec.ts` under src/).
 */
describe('RBAC matrix (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let adminToken: string;
  let teacherToken: string; // ECO201 instructor
  let otherTeacherToken: string; // ACC202 instructor, NOT ECO201
  let studentToken: string;
  let superAdminToken: string;

  let ecoOfferingId: string;
  let scratchUserId: string;
  const createdCalendarEventIds: string[] = [];
  const createdAnnouncementIds: string[] = [];
  const createdScoringSchemaIds: string[] = [];

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

    const [admin, teacher, otherTeacher, student, superAdmin] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { email: 'registrar@edunest.com' } }),
      prisma.user.findUniqueOrThrow({ where: { email: 'ngozi.okeke@edunest.com' } }),
      prisma.user.findUniqueOrThrow({ where: { email: 'adeyemi.okonkwo@edunest.com' } }),
      prisma.user.findUniqueOrThrow({ where: { email: 'nancy.graham@edunest.com' } }),
      prisma.user.findUniqueOrThrow({ where: { email: 'founder@edunest.com' } }),
    ]);

    const sign = (u: { id: string; email: string; role: UserRole }) =>
      jwt.sign({ sub: u.id, email: u.email, role: u.role });

    adminToken = sign(admin);
    teacherToken = sign(teacher);
    otherTeacherToken = sign(otherTeacher);
    studentToken = sign(student);
    superAdminToken = sign(superAdmin);

    const ecoOffering = await prisma.courseOffering.findFirstOrThrow({
      where: { course: { code: 'ECO201' } },
    });
    ecoOfferingId = ecoOffering.id;

    const scratchUser = await prisma.user.create({
      data: {
        email: `rbac-test-${Date.now()}@edunest.com`,
        googleId: `rbac-test-google-${Date.now()}`,
        role: UserRole.STUDENT,
        schoolId: admin.schoolId,
      },
    });
    scratchUserId = scratchUser.id;
  });

  afterAll(async () => {
    await prisma.calendarEvent.deleteMany({ where: { id: { in: createdCalendarEventIds } } });
    await prisma.announcement.deleteMany({ where: { id: { in: createdAnnouncementIds } } });
    await prisma.scoringSchemaComponent.deleteMany({
      where: { scoringSchemaId: { in: createdScoringSchemaIds } },
    });
    await prisma.courseOffering.updateMany({
      where: { scoringSchemaId: { in: createdScoringSchemaIds } },
      data: { scoringSchemaId: null },
    });
    await prisma.scoringSchema.deleteMany({ where: { id: { in: createdScoringSchemaIds } } });
    await prisma.user.delete({ where: { id: scratchUserId } });
    await app.close();
  });

  describe('School', () => {
    it('any authenticated user can view the school profile', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/school')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    it('rejects a school profile update from a STUDENT', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/school')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ contactPhone: '+2340000000' })
        .expect(403);
    });

    it('allows a school profile update from ADMIN', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/school')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ contactPhone: '+2340000000' })
        .expect(200);
    });
  });

  describe('Semesters', () => {
    it('rejects an end date before the start date', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/semesters')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Bad Semester',
          semester: 'FIRST',
          startDate: '2030-02-01',
          endDate: '2030-01-01',
        })
        .expect(400);
    });

    it('resolves (or reports no) currently active semester without erroring', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/semesters/active')
        .set('Authorization', `Bearer ${studentToken}`);
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Calendar', () => {
    it('rejects event creation from a STUDENT', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/calendar/events')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Should fail',
          type: 'MEETING',
          startAt: '2026-01-01T00:00:00Z',
          endAt: '2026-01-01T01:00:00Z',
        })
        .expect(403);
    });

    it('lets an ADMIN create+publish an event, and a matching STUDENT sees it', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/calendar/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'RBAC test event',
          type: 'MEETING',
          startAt: '2026-01-01T00:00:00Z',
          endAt: '2026-01-01T01:00:00Z',
          audience: ['STUDENT'],
        })
        .expect(201);
      createdCalendarEventIds.push(created.body.id);
      expect(created.body.publishState).toBe('DRAFT');

      await request(app.getHttpServer())
        .patch(`/api/v1/calendar/events/${created.body.id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const list = await request(app.getHttpServer())
        .get('/api/v1/calendar/events')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(list.body.some((e: { id: string }) => e.id === created.body.id)).toBe(true);
    });
  });

  describe('Scoring schemas', () => {
    it('rejects a schema whose weights do not sum to 100', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/scoring-schemas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: `Bad schema ${Date.now()}`, components: [{ name: 'Test', weightPercent: 40 }] })
        .expect(400);
    });

    it('creates a valid schema and lets the ECO201 instructor select it', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/scoring-schemas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `40 Test 60 Exam ${Date.now()}`,
          components: [
            { name: 'Test', weightPercent: 40 },
            { name: 'Exam', weightPercent: 60 },
          ],
        })
        .expect(201);
      createdScoringSchemaIds.push(created.body.id);

      await request(app.getHttpServer())
        .patch(`/api/v1/academics/course-offerings/${ecoOfferingId}/scoring-schema`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ scoringSchemaId: created.body.id })
        .expect(200);
    });
  });

  describe('Academics scheduling validation', () => {
    it('rejects an assessment due date outside the semester range', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/academics/course-offerings/${ecoOfferingId}/assessments`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Out of range CAT',
          type: 'CAT',
          maxScore: 100,
          weightPercent: 10,
          dueAt: '2099-01-01T00:00:00Z',
        })
        .expect(400);
    });

    it('rejects assessment creation from a STUDENT (blocked by role guard)', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/academics/course-offerings/${ecoOfferingId}/assessments`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Should fail', type: 'CAT', maxScore: 100, weightPercent: 10 })
        .expect(403);
    });

    it('rejects assessment creation from a TEACHER who is not this course\'s instructor', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/academics/course-offerings/${ecoOfferingId}/assessments`)
        .set('Authorization', `Bearer ${otherTeacherToken}`)
        .send({ title: 'Should fail', type: 'CAT', maxScore: 100, weightPercent: 10 })
        .expect(403);
    });
  });

  describe('Announcements', () => {
    it('rejects announcement creation from a STUDENT', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/announcements')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Should fail', body: 'nope' })
        .expect(403);
    });

    it('allows an ADMIN to create an announcement', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'RBAC test announcement', body: 'body', visibility: 'INTERNAL' })
        .expect(201);
      createdAnnouncementIds.push(created.body.id);
    });
  });

  describe('News', () => {
    it('rejects news creation from a STUDENT', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/news')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Should fail', body: 'nope' })
        .expect(403);
    });
  });

  describe('User role assignment', () => {
    it('rejects an ADMIN granting an admin-tier role', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/users/${scratchUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'PRINCIPAL' })
        .expect(403);
    });

    it('allows an ADMIN to grant a lower-tier role', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/users/${scratchUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'TEACHER' })
        .expect(200);
    });

    it('allows SUPER_ADMIN to grant an admin-tier role', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/users/${scratchUserId}/role`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ role: 'PRINCIPAL' })
        .expect(200);
    });
  });
});
