import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoringSchemaDto } from './dto/create-scoring-schema.dto';
import { UpdateScoringSchemaDto } from './dto/update-scoring-schema.dto';
import { ScoringSchemaComponentDto } from './dto/scoring-schema-component.dto';

const WEIGHT_TOLERANCE = 0.01;

@Injectable()
export class ScoringService {
  constructor(private readonly prisma: PrismaService) {}

  private assertWeightsSumTo100(components: ScoringSchemaComponentDto[]) {
    const total = components.reduce((sum, c) => sum + c.weightPercent, 0);
    if (Math.abs(total - 100) > WEIGHT_TOLERANCE) {
      throw new BadRequestException(
        `Scoring schema component weights must sum to 100, got ${total}`,
      );
    }
  }

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

  async create(callerId: string, dto: CreateScoringSchemaDto) {
    this.assertWeightsSumTo100(dto.components);
    const schoolId = await this.resolveCallerSchoolId(callerId);

    return this.prisma.scoringSchema.create({
      data: {
        schoolId,
        name: dto.name,
        components: { create: dto.components },
      },
      include: { components: true },
    });
  }

  async listForCaller(callerId: string, activeOnly?: boolean) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    return this.prisma.scoringSchema.findMany({
      where: { schoolId, ...(activeOnly ? { isActive: true } : {}) },
      include: { components: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getForCaller(callerId: string, id: string) {
    const schoolId = await this.resolveCallerSchoolId(callerId);
    const schema = await this.prisma.scoringSchema.findFirst({
      where: { id, schoolId },
      include: { components: true },
    });
    if (!schema) {
      throw new NotFoundException('Scoring schema not found');
    }
    return schema;
  }

  async update(callerId: string, id: string, dto: UpdateScoringSchemaDto) {
    await this.getForCaller(callerId, id);
    if (dto.components) {
      this.assertWeightsSumTo100(dto.components);
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.components) {
        await tx.scoringSchemaComponent.deleteMany({ where: { scoringSchemaId: id } });
      }
      return tx.scoringSchema.update({
        where: { id },
        data: {
          name: dto.name,
          isActive: dto.isActive,
          ...(dto.components ? { components: { create: dto.components } } : {}),
        },
        include: { components: true },
      });
    });
  }
}
