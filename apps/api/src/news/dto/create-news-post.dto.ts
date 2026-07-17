import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNewsPostDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({ description: 'Media id for a cover image' })
  @IsOptional()
  @IsString()
  mediaId?: string;

  @ApiPropertyOptional({ enum: Visibility, default: Visibility.PUBLIC })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}
