import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssessmentType } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateAssessmentDto {
  @ApiProperty({ example: 'CAT 1', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @ApiProperty({ enum: AssessmentType })
  @IsEnum(AssessmentType)
  type!: AssessmentType;

  @ApiProperty({ example: 100, minimum: 0 })
  @IsNumber()
  @Min(0)
  maxScore!: number;

  @ApiProperty({ example: 10, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weightPercent!: number;

  @ApiPropertyOptional({ description: 'Must fall within the course offering\'s semester date range' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
