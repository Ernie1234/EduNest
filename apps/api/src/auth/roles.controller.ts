import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('roles')
export class RolesController {
  @Get('landlord')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD, UserRole.SUPER_ADMIN)
  landlordOrSuper() {
    return { ok: true, scope: 'landlord_or_super_admin' };
  }

  @Get('super-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  superAdminOnly() {
    return { ok: true, scope: 'super_admin' };
  }
}
