import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UseStreakFreezeDto {
  @ApiPropertyOptional({ description: 'Day to cover with a freeze; defaults to yesterday' })
  @IsOptional()
  @IsDateString()
  forDate?: string;
}
