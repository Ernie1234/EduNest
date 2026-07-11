import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '@workspace/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AcademicsService } from './academics.service';

@ApiTags('Academics')
@ApiBearerAuth('access_token')
@Controller('academics')
@UseGuards(JwtAuthGuard)
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  @Get('courses')
  @ApiOperation({ summary: 'List all course offerings for the current academic session' })
  @ApiResponse({ status: 200, description: 'Course offerings returned' })
  listCourses() {
    return this.academicsService.listCourseOfferings();
  }

  @Get('my-enrollments')
  @ApiOperation({ summary: "List the current user's course enrollments" })
  @ApiResponse({ status: 200, description: 'Enrollments returned' })
  myEnrollments(@CurrentUser() user: AccessTokenPayload) {
    return this.academicsService.listEnrollmentsForStudent(user.sub);
  }
}
