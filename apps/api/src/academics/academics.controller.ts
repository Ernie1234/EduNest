import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { AccessTokenPayload } from '@workspace/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';
import { AcademicsService } from './academics.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { CreateLiveClassDto } from './dto/create-live-class.dto';
import { SelectScoringSchemaDto } from './dto/select-scoring-schema.dto';

const INSTRUCTOR_OR_ADMIN_ROLES = [UserRole.TEACHER, ...ADMIN_TIER_ROLES];

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

  @Post('course-offerings/:id/assessments')
  @UseGuards(RolesGuard)
  @Roles(...INSTRUCTOR_OR_ADMIN_ROLES)
  @ApiOperation({
    summary:
      'Create a test/exam/CAT for a course offering. Due date must fall within the semester date range.',
  })
  @ApiResponse({ status: 201, description: 'Assessment created' })
  @ApiResponse({ status: 400, description: 'Due date is outside the semester range' })
  @ApiResponse({ status: 403, description: 'Not an assigned instructor or admin' })
  createAssessment(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: CreateAssessmentDto,
  ) {
    return this.academicsService.createAssessment(user.sub, user.role as UserRole, id, dto);
  }

  @Get('course-offerings/:id/assessments')
  @ApiOperation({
    summary:
      "List assessments for a course offering, including the caller's own grade per assessment (null if ungraded)",
  })
  @ApiResponse({ status: 200, description: 'Assessments returned' })
  listAssessments(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string) {
    return this.academicsService.listAssessments(id, user.sub);
  }

  @Get('course-offerings/:id')
  @ApiOperation({
    summary:
      "Get full course offering detail: course, department, session, instructors, modules/lessons with the caller's own lesson progress, and enrollment status",
  })
  @ApiResponse({ status: 200, description: 'Course offering detail returned' })
  @ApiResponse({ status: 404, description: 'Course offering not found' })
  getCourseOfferingDetail(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string) {
    return this.academicsService.getCourseOfferingDetail(id, user.sub);
  }

  @Post('course-offerings/:id/live-classes')
  @UseGuards(RolesGuard)
  @Roles(...INSTRUCTOR_OR_ADMIN_ROLES)
  @ApiOperation({
    summary:
      'Schedule a live class for a course offering. Start/end must fall within the semester date range.',
  })
  @ApiResponse({ status: 201, description: 'Live class scheduled' })
  @ApiResponse({ status: 400, description: 'Schedule is outside the semester range' })
  @ApiResponse({ status: 403, description: 'Not an assigned instructor or admin' })
  createLiveClass(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: CreateLiveClassDto,
  ) {
    return this.academicsService.createLiveClass(user.sub, user.role as UserRole, id, dto);
  }

  @Patch('course-offerings/:id/scoring-schema')
  @UseGuards(RolesGuard)
  @Roles(...INSTRUCTOR_OR_ADMIN_ROLES)
  @ApiOperation({ summary: 'Select an active scoring schema for course grading setup' })
  @ApiResponse({ status: 200, description: 'Scoring schema selected' })
  @ApiResponse({ status: 400, description: 'Scoring schema must exist and be active' })
  @ApiResponse({ status: 403, description: 'Not an assigned instructor or admin' })
  selectScoringSchema(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: SelectScoringSchemaDto,
  ) {
    return this.academicsService.selectScoringSchema(user.sub, user.role as UserRole, id, dto);
  }
}
