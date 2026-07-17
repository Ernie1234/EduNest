import { ApiPropertyOptional } from '@nestjs/swagger';
import { CalendarEventType, UserRole } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCalendarEventDto {
  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ enum: CalendarEventType })
  @IsOptional()
  @IsEnum(CalendarEventType)
  type?: CalendarEventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({ enum: UserRole, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  audience?: UserRole[];
}
