import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCallerSchoolId(callerId: string): Promise<string> {
    const caller = await this.prisma.user.findUniqueOrThrow({
      where: { id: callerId },
      select: { schoolId: true },
    });
    if (!caller.schoolId) {
      throw new NotFoundException('No school is associated with this account');
    }
    return caller.schoolId;
  }

  async getForCaller(callerId: string) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    return this.prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
  }

  async updateForCaller(callerId: string, dto: UpdateSchoolDto) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    return this.prisma.school.update({ where: { id: schoolId }, data: dto });
  }
}
