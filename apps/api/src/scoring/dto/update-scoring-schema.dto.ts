import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ScoringSchemaComponentDto } from './scoring-schema-component.dto';

export class UpdateScoringSchemaDto {
  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ type: [ScoringSchemaComponentDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScoringSchemaComponentDto)
  components?: ScoringSchemaComponentDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
