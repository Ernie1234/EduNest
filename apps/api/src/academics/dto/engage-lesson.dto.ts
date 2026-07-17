import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class EngageLessonDto {
  @ApiProperty({ example: 90, minimum: 0, description: 'Seconds spent on the lesson since the last report' })
  @IsInt()
  @Min(0)
  secondsSpent!: number;

  @ApiPropertyOptional({ description: 'Mark the lesson as completed' })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
