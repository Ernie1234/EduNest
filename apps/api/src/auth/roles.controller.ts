import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Roles')
@ApiBearerAuth('access_token')
@Controller('roles')
export class RolesController {
  @Get('teacher')
  @Get('teacher')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Test endpoint for Teacher or Super Admin role' })
  @ApiResponse({ status: 200, description: 'Access granted for teacher or super admin' })
  @ApiResponse({ status: 401, description: 'Unauthorized - missing or invalid authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  teacherOrSuper() {
    return { ok: true, scope: 'teacher_or_super_admin' };
  }

  @Get('super-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Test endpoint for Super Admin role only' })
  @ApiResponse({ status: 200, description: 'Access granted for super admin' })
  @ApiResponse({ status: 401, description: 'Unauthorized - missing or invalid authentication token' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  superAdminOnly() {
    return { ok: true, scope: 'super_admin' };
  }
}