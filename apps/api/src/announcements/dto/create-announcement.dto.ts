import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Visibility } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({
    enum: UserRole,
    isArray: true,
    description: 'Roles this announcement is visible to; empty/omitted = school-wide',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  audience?: UserRole[];

  @ApiPropertyOptional({ enum: Visibility, default: Visibility.INTERNAL })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}
