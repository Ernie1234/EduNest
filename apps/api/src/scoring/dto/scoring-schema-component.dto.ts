import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';

export class ScoringSchemaComponentDto {
  @ApiProperty({ example: 'Test', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 40, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weightPercent!: number;
}
