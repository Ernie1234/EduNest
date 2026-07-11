import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '@workspace/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';

@ApiTags('Complaints')
@ApiBearerAuth('access_token')
@Controller('complaints')
@UseGuards(JwtAuthGuard)
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @ApiOperation({ summary: 'Raise a new complaint' })
  @ApiResponse({ status: 201, description: 'Complaint created' })
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateComplaintDto) {
    return this.complaintsService.create(user.sub, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: "List the current user's complaints" })
  @ApiResponse({ status: 200, description: 'Complaints returned' })
  listMine(@CurrentUser() user: AccessTokenPayload) {
    return this.complaintsService.listForUser(user.sub);
  }
}
