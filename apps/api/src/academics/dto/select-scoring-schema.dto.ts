import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SelectScoringSchemaDto {
  @ApiProperty({ description: 'Must reference an active scoring schema' })
  @IsString()
  @IsNotEmpty()
  scoringSchemaId!: string;
}
