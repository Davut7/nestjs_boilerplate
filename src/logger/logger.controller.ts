import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { FindLogsFilter } from './dto/logs.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LogsEntity } from './entity/log.entity';

@ApiTags('logs')
@Controller('/root/logs')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'Logs returned successfully',
    type: LogsEntity,
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ status: 401, description: 'User unauthorized' })
  getLogs(@Query() query: FindLogsFilter) {
    return this.loggerService.findAllLogs(query);
  }
}
