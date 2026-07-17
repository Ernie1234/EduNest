import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, description: 'Role to assign to the user' })
  @IsEnum(UserRole)
  role!: UserRole;
}
