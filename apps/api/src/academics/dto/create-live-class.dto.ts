import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLiveClassDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: "Must fall within the course offering's semester date range" })
  @IsDateString()
  scheduledStart!: string;

  @ApiProperty({ description: "Must fall within the course offering's semester date range" })
  @IsDateString()
  scheduledEnd!: string;
}
