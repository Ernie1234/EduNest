import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '@workspace/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';

@ApiTags('Media')
@ApiBearerAuth('access_token')
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('mine')
  @ApiOperation({ summary: "List the current user's uploaded media" })
  @ApiResponse({ status: 200, description: 'Media returned' })
  listMine(@CurrentUser() user: AccessTokenPayload) {
    return this.mediaService.listForUser(user.sub);
  }
}
