import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Get API health status' })
  @ApiResponse({
    status: 200,
    description: 'API is healthy and running',
    schema: {
      properties: {
        ok: { type: 'boolean', example: true }
      }
    }
  })
  health() {
    return { ok: true };
  }
}
