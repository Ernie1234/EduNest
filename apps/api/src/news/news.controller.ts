import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '@workspace/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ADMIN_TIER_ROLES } from '../common/constants/roles.constants';
import { NewsService } from './news.service';
import { CreateNewsPostDto } from './dto/create-news-post.dto';
import { UpdateNewsPostDto } from './dto/update-news-post.dto';

@ApiTags('News')
@ApiBearerAuth('access_token')
@Controller('news')
@UseGuards(JwtAuthGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Create a school news post (starts as DRAFT)' })
  @ApiResponse({ status: 201, description: 'News post created' })
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateNewsPostDto) {
    return this.newsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: "List news posts for the caller's school. Non-admin callers only see published posts.",
  })
  @ApiResponse({ status: 200, description: 'News posts returned' })
  list(@CurrentUser() user: AccessTokenPayload) {
    return this.newsService.listForCaller(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a news post by id' })
  @ApiResponse({ status: 200, description: 'News post returned' })
  @ApiResponse({ status: 404, description: 'News post not found' })
  get(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string) {
    return this.newsService.getForCaller(user.sub, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Update a news post' })
  @ApiResponse({ status: 200, description: 'News post updated' })
  @ApiResponse({ status: 404, description: 'News post not found' })
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateNewsPostDto,
  ) {
    return this.newsService.update(user.sub, id, dto);
  }

  @Patch(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Publish a news post' })
  @ApiResponse({ status: 200, description: 'News post published' })
  @ApiResponse({ status: 404, description: 'News post not found' })
  publish(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string) {
    return this.newsService.publish(user.sub, id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_TIER_ROLES)
  @ApiOperation({ summary: 'Delete a news post' })
  @ApiResponse({ status: 200, description: 'News post deleted' })
  @ApiResponse({ status: 404, description: 'News post not found' })
  remove(@CurrentUser() user: AccessTokenPayload, @Param('id') id: string) {
    return this.newsService.remove(user.sub, id);
  }
}
