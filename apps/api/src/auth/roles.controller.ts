import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('roles')
export class RolesController {
  @Get('teacher')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.SUPER_ADMIN)
  teacherOrSuper() {
    return { ok: true, scope: 'teacher_or_super_admin' };
  }

  @Get('super-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  superAdminOnly() {
    return { ok: true, scope: 'super_admin' };
  }
}
