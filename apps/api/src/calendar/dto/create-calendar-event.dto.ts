import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CalendarEventType, UserRole } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCalendarEventDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ enum: CalendarEventType })
  @IsEnum(CalendarEventType)
  type!: CalendarEventType;

  @ApiProperty()
  @IsDateString()
  startAt!: string;

  @ApiProperty()
  @IsDateString()
  endAt!: string;

  @ApiPropertyOptional({
    enum: UserRole,
    isArray: true,
    description: 'Roles this event is visible to once published; empty/omitted = school-wide',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  audience?: UserRole[];

  @ApiPropertyOptional({ description: 'Course offering this event belongs to, if any' })
  @IsOptional()
  @IsString()
  courseOfferingId?: string;
}
