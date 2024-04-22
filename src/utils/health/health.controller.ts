import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  TypeOrmHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('server-health')
@Controller('health')
export class HealthController implements OnModuleInit {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  onModuleInit() {
    this.runHealthChecks();
  }

  private async runHealthChecks() {
    try {
      await this.checkHTTP();
      await this.checkTypeOrm();
      await this.checkDisk();
      await this.checkMemory();
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  @ApiResponse({ description: 'Check if server is okay' })
  @ApiBearerAuth()
  @Get('/http')
  @HealthCheck()
  async checkHTTP() {
    return this.health.check([
      () => this.http.pingCheck('google', 'https://google.com'),
    ]);
  }

  @ApiResponse({ description: 'Check if database is okay' })
  @ApiBearerAuth()
  @Get('/database')
  @HealthCheck()
  async checkTypeOrm() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }

  @Get('/disk')
  @HealthCheck()
  async checkDisk() {
    let path: string;
    // Determine the correct path based on the operating system
    if (process.platform === 'darwin') {
      // macOS
      path = '/';
    } else if (process.platform === 'linux') {
      // Ubuntu or other Linux distributions
      path = '/';
    } else {
      throw new Error('Unsupported operating system');
    }

    return this.health.check([
      () =>
        this.disk.checkStorage('storage', {
          path,
          thresholdPercent: 90,
        }),
    ]);
  }

  @ApiResponse({ description: 'Check if memory is okay' })
  @ApiBearerAuth()
  @Get('/memory')
  @HealthCheck()
  async checkMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}
