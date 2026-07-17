import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';
import { STREAK_DAILY_MINUTES_THRESHOLD } from '../streak/streak.constants';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { CreateLiveClassDto } from './dto/create-live-class.dto';
import { SelectScoringSchemaDto } from './dto/select-scoring-schema.dto';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { EngageLessonDto } from './dto/engage-lesson.dto';

/** UTC-based truncation so this always agrees with dateKey()-style
 * `toISOString().slice(0, 10)` comparisons regardless of server timezone. */
function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

@Injectable()
export class AcademicsService {
  constructor(private readonly prisma: PrismaService) {}

  listCourseOfferings() {
    return this.prisma.courseOffering.findMany({
      include: {
        course: { include: { department: true } },
        academicSession: true,
        instructors: { include: { user: true } },
      },
    });
  }

  async listEnrollmentsForStudent(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        courseOffering: {
          include: {
            course: { include: { department: true } },
            instructors: { include: { user: true } },
            modules: {
              include: { lessons: { include: { progress: { where: { studentId } } } } },
            },
          },
        },
      },
    });

    return enrollments.map((enrollment) => {
      const lessons = enrollment.courseOffering.modules.flatMap((m) => m.lessons);
      const primaryInstructor =
        enrollment.courseOffering.instructors.find((i) => i.isPrimary) ??
        enrollment.courseOffering.instructors[0];

      return {
        courseOfferingId: enrollment.courseOffering.id,
        status: enrollment.status,
        course: enrollment.courseOffering.course,
        totalLessons: lessons.length,
        completedLessons: lessons.filter((l) => l.progress[0]?.completed).length,
        instructorName: primaryInstructor?.user.name ?? null,
      };
    });
  }

  async getCourseOfferingDetail(courseOfferingId: string, callerId: string) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: {
        course: { include: { department: true } },
        academicSession: true,
        scoringSchema: { include: { components: true } },
        instructors: {
          include: { user: { include: { teacherProfile: { include: { department: true } } } } },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                media: true,
                progress: { where: { studentId: callerId } },
              },
            },
          },
        },
      },
    });
    if (!offering) {
      throw new NotFoundException('Course offering not found');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { courseOfferingId_studentId: { courseOfferingId, studentId: callerId } },
    });

    const nextLiveClass = await this.prisma.liveClass.findFirst({
      where: {
        courseOfferingId,
        OR: [{ status: 'LIVE' }, { status: 'SCHEDULED', scheduledStart: { gte: new Date() } }],
      },
      orderBy: { scheduledStart: 'asc' },
    });

    const modules = offering.modules.map((courseModule) => ({
      id: courseModule.id,
      title: courseModule.title,
      order: courseModule.order,
      lessons: courseModule.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        contentType: lesson.contentType,
        order: lesson.order,
        durationMinutes: lesson.durationMinutes,
        media: lesson.media,
        completed: lesson.progress[0]?.completed ?? false,
      })),
    }));

    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = modules.reduce(
      (sum, m) => sum + m.lessons.filter((l) => l.completed).length,
      0,
    );

    return {
      id: offering.id,
      course: offering.course,
      academicSession: offering.academicSession,
      scoringSchema: offering.scoringSchema,
      instructors: offering.instructors.map((i) => ({
        userId: i.userId,
        name: i.user.name,
        image: i.user.image,
        isPrimary: i.isPrimary,
        title: i.user.teacherProfile?.title ?? null,
        department: i.user.teacherProfile?.department?.name ?? null,
      })),
      modules,
      totalLessons,
      completedLessons,
      enrollmentStatus: enrollment?.status ?? null,
      nextLiveClass,
    };
  }

  private async getCourseOfferingOrThrow(courseOfferingId: string) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: { academicSession: true },
    });
    if (!offering) {
      throw new NotFoundException('Course offering not found');
    }
    return offering;
  }

  /** Only an admin-tier caller or an instructor assigned to this offering may act on it. */
  private async assertInstructorOrAdmin(
    callerId: string,
    callerRole: UserRole,
    courseOfferingId: string,
  ) {
    if (ADMIN_TIER_ROLES.includes(callerRole)) return;

    const isInstructor = await this.prisma.courseInstructor.findUnique({
      where: { courseOfferingId_userId: { courseOfferingId, userId: callerId } },
    });
    if (!isInstructor) {
      throw new ForbiddenException('Only an assigned instructor or admin can do this');
    }
  }

  private assertWithinSemester(session: { startDate: Date; endDate: Date }, ...dates: Date[]) {
    for (const date of dates) {
      if (date < session.startDate || date > session.endDate) {
        throw new BadRequestException(
          `Date ${date.toISOString()} is outside the semester range ${session.startDate.toISOString()} - ${session.endDate.toISOString()}`,
        );
      }
    }
  }

  async createAssessment(
    callerId: string,
    callerRole: UserRole,
    courseOfferingId: string,
    dto: CreateAssessmentDto,
  ) {
    const offering = await this.getCourseOfferingOrThrow(courseOfferingId);
    await this.assertInstructorOrAdmin(callerId, callerRole, courseOfferingId);

    const dueAt = dto.dueAt ? new Date(dto.dueAt) : undefined;
    if (dueAt) {
      this.assertWithinSemester(offering.academicSession, dueAt);
    }

    return this.prisma.assessment.create({
      data: {
        courseOfferingId,
        title: dto.title,
        type: dto.type,
        maxScore: dto.maxScore,
        weightPercent: dto.weightPercent,
        dueAt,
      },
    });
  }

  async listAssessments(courseOfferingId: string, callerId: string) {
    const assessments = await this.prisma.assessment.findMany({
      where: { courseOfferingId },
      orderBy: { dueAt: 'asc' },
      include: { grades: { where: { studentId: callerId } } },
    });

    return assessments.map(({ grades, ...assessment }) => ({
      ...assessment,
      myGrade: grades[0]?.score ?? null,
    }));
  }

  async createLiveClass(
    callerId: string,
    callerRole: UserRole,
    courseOfferingId: string,
    dto: CreateLiveClassDto,
  ) {
    const offering = await this.getCourseOfferingOrThrow(courseOfferingId);
    await this.assertInstructorOrAdmin(callerId, callerRole, courseOfferingId);

    const scheduledStart = new Date(dto.scheduledStart);
    const scheduledEnd = new Date(dto.scheduledEnd);
    this.assertWithinSemester(offering.academicSession, scheduledStart, scheduledEnd);

    return this.prisma.liveClass.create({
      data: {
        courseOfferingId,
        hostId: callerId,
        title: dto.title,
        scheduledStart,
        scheduledEnd,
      },
    });
  }

  async selectScoringSchema(
    callerId: string,
    callerRole: UserRole,
    courseOfferingId: string,
    dto: SelectScoringSchemaDto,
  ) {
    await this.getCourseOfferingOrThrow(courseOfferingId);
    await this.assertInstructorOrAdmin(callerId, callerRole, courseOfferingId);

    const schema = await this.prisma.scoringSchema.findUnique({
      where: { id: dto.scoringSchemaId },
    });
    if (!schema || !schema.isActive) {
      throw new BadRequestException('Scoring schema must exist and be active');
    }

    return this.prisma.courseOffering.update({
      where: { id: courseOfferingId },
      data: { scoringSchemaId: dto.scoringSchemaId },
    });
  }

  async createCourseModule(
    callerId: string,
    callerRole: UserRole,
    courseOfferingId: string,
    dto: CreateCourseModuleDto,
  ) {
    await this.getCourseOfferingOrThrow(courseOfferingId);
    await this.assertInstructorOrAdmin(callerId, callerRole, courseOfferingId);

    return this.prisma.courseModule.create({
      data: { courseOfferingId, title: dto.title, order: dto.order },
    });
  }

  async createLesson(
    callerId: string,
    callerRole: UserRole,
    courseModuleId: string,
    dto: CreateLessonDto,
  ) {
    const courseModule = await this.prisma.courseModule.findUnique({
      where: { id: courseModuleId },
    });
    if (!courseModule) {
      throw new NotFoundException('Course module not found');
    }
    await this.assertInstructorOrAdmin(callerId, callerRole, courseModule.courseOfferingId);

    return this.prisma.lesson.create({
      data: {
        courseModuleId,
        title: dto.title,
        contentType: dto.contentType,
        order: dto.order,
        mediaId: dto.mediaId,
        externalUrl: dto.externalUrl,
        publishAt: dto.publishAt ? new Date(dto.publishAt) : undefined,
        durationMinutes: dto.durationMinutes,
      },
    });
  }

  /** Records a student's engagement with a lesson (time spent / completion) and
   * rolls it into today's StudyActivity, which is what the streak is computed from. */
  async engageLesson(studentId: string, lessonId: string, dto: EngageLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const now = new Date();
    const completedNow = dto.completed === true;

    const progress = await this.prisma.lessonProgress.upsert({
      where: { lessonId_studentId: { lessonId, studentId } },
      create: {
        lessonId,
        studentId,
        timeSpentSeconds: dto.secondsSpent,
        lastAccessedAt: now,
        completed: completedNow,
        completedAt: completedNow ? now : null,
      },
      update: {
        timeSpentSeconds: { increment: dto.secondsSpent },
        lastAccessedAt: now,
        ...(completedNow ? { completed: true, completedAt: now } : {}),
      },
    });

    const activityDate = startOfDay(now);
    const existing = await this.prisma.studyActivity.findUnique({
      where: { studentId_activityDate: { studentId, activityDate } },
    });
    const minutesSpent = (existing?.minutesSpent ?? 0) + Math.round(dto.secondsSpent / 60);
    const lessonsEngaged = (existing?.lessonsEngaged ?? 0) + 1;
    const meetsThreshold =
      (existing?.meetsThreshold ?? false) ||
      minutesSpent >= STREAK_DAILY_MINUTES_THRESHOLD ||
      completedNow;

    await this.prisma.studyActivity.upsert({
      where: { studentId_activityDate: { studentId, activityDate } },
      create: { studentId, activityDate, minutesSpent, lessonsEngaged, meetsThreshold },
      update: { minutesSpent, lessonsEngaged, meetsThreshold },
    });

    return progress;
  }

  async getDashboardSummary(studentId: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [totalCourses, attendanceRecords, completedThisWeek, assessments] = await Promise.all([
      this.prisma.enrollment.count({ where: { studentId } }),
      this.prisma.attendanceRecord.findMany({ where: { studentId }, select: { status: true } }),
      this.prisma.lessonProgress.count({
        where: { studentId, completedAt: { gte: weekAgo } },
      }),
      this.prisma.assessment.findMany({
        where: { courseOffering: { enrollments: { some: { studentId } } } },
        include: { grades: { where: { studentId } } },
      }),
    ]);

    const attendanceRatePercent =
      attendanceRecords.length > 0
        ? Math.round(
            (attendanceRecords.filter((r) => r.status === 'PRESENT').length /
              attendanceRecords.length) *
              100,
          )
        : 0;
    const pendingAssignments = assessments.filter((a) => a.grades.length === 0).length;

    return { totalCourses, pendingAssignments, attendanceRatePercent, completedThisWeek };
  }

  async listLiveClasses(callerId: string) {
    const liveClasses = await this.prisma.liveClass.findMany({
      where: {
        OR: [
          { courseOffering: { enrollments: { some: { studentId: callerId } } } },
          { courseOffering: { instructors: { some: { userId: callerId } } } },
          { hostId: callerId },
        ],
      },
      orderBy: { scheduledStart: 'desc' },
      include: { courseOffering: { include: { course: true } }, host: true },
    });

    return liveClasses.map((lc) => ({
      id: lc.id,
      title: lc.title,
      status: lc.status,
      scheduledStart: lc.scheduledStart,
      scheduledEnd: lc.scheduledEnd,
      courseOfferingId: lc.courseOfferingId,
      courseCode: lc.courseOffering.course.code,
      courseTitle: lc.courseOffering.course.title,
      hostName: lc.host.name,
    }));
  }

  async getLiveClassDetail(liveClassId: string) {
    const liveClass = await this.prisma.liveClass.findUnique({
      where: { id: liveClassId },
      include: {
        courseOffering: { include: { course: { include: { department: true } } } },
        host: { include: { teacherProfile: { include: { department: true } } } },
        chatRoom: true,
        participants: { include: { user: true } },
        aiJobs: true,
      },
    });
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    return {
      id: liveClass.id,
      title: liveClass.title,
      status: liveClass.status,
      scheduledStart: liveClass.scheduledStart,
      scheduledEnd: liveClass.scheduledEnd,
      courseOfferingId: liveClass.courseOfferingId,
      course: liveClass.courseOffering.course,
      host: {
        id: liveClass.host.id,
        name: liveClass.host.name,
        image: liveClass.host.image,
        department: liveClass.host.teacherProfile?.department?.name ?? null,
      },
      chatRoomId: liveClass.chatRoom?.id ?? null,
      participants: liveClass.participants.map((p) => ({
        userId: p.userId,
        name: p.user.name ?? '',
        image: p.user.image ?? undefined,
      })),
      aiJobs: liveClass.aiJobs.map((j) => ({
        id: j.id,
        type: j.type,
        status: j.status,
        resultText: j.resultText ?? undefined,
      })),
    };
  }
}
