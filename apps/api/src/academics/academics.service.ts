import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
