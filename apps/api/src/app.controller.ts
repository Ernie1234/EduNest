import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Get a health request' })
  @ApiResponse({ status: 200, description: 'The health status of the API.' })
  health() {
    return { ok: true };
  }
}
