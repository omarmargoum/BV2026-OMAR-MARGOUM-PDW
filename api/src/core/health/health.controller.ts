import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  HealthService,
} from './health.service.js';


@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
  ) {}
  @ApiOperation({
    summary: 'Vérifier que l\'API est disponible et fonctionne correctement',
  })  
  @Get('live')
  getLiveStatus(): {
    status: string;
  } {
    return this.healthService.getLiveStatus();
  }
  
}