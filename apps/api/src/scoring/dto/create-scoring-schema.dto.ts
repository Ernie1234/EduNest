import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ScoringSchemaComponentDto } from './scoring-schema-component.dto';

export class CreateScoringSchemaDto {
  @ApiProperty({ example: '40% Test / 60% Exam', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ type: [ScoringSchemaComponentDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScoringSchemaComponentDto)
  components!: ScoringSchemaComponentDto[];
}
