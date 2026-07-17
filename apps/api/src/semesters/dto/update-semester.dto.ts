import { ApiPropertyOptional } from '@nestjs/swagger';
import { Semester } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSemesterDto {
  @ApiPropertyOptional({ maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  name?: string;

  @ApiPropertyOptional({ enum: Semester })
  @IsOptional()
  @IsEnum(Semester)
  semester?: Semester;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
