import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { AccessTokenPayload } from '@workspace/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';
import { UsersService } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('Users')
@ApiBearerAuth('access_token')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: "List users in the caller's school" })
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  @ApiResponse({ status: 200, description: 'Users returned' })
  list(@CurrentUser() user: AccessTokenPayload, @Query('role') role?: UserRole) {
    return this.usersService.listForCaller(user.sub, role);
  }

  @Patch(':id/role')
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Assign a role to a user (tiered: only SUPER_ADMIN can grant admin-tier roles)' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permission to grant this role' })
  @ApiResponse({ status: 404, description: 'User not found' })
  assignRole(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.assignRole(user.sub, id, dto.role);
  }
}
