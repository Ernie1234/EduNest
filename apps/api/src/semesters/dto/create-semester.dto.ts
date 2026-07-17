import { ApiProperty } from '@nestjs/swagger';
import { Semester } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSemesterDto {
  @ApiProperty({ example: '2025/2026', maxLength: 40 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name!: string;

  @ApiProperty({ enum: Semester })
  @IsEnum(Semester)
  semester!: Semester;

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-01-31' })
  @IsDateString()
  endDate!: string;
}
