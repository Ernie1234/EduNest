import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { CreateLiveClassDto } from './dto/create-live-class.dto';
import { SelectScoringSchemaDto } from './dto/select-scoring-schema.dto';

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

  listEnrollmentsForStudent(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: { courseOffering: { include: { course: true } } },
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
}
