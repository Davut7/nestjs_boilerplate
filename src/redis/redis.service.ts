import { Inject, Injectable } from '@nestjs/common';
import { RedisRepository } from './redis.repository';

const tenMinutesInSeconds = 60 * 10;

@Injectable()
export class RedisService {
  constructor(
    @Inject(RedisRepository) private readonly redisRepository: RedisRepository,
  ) {}

  async setTokenWithExpiry(key: string, token: string): Promise<void> {
    await this.redisRepository.setWithExpiry(
      'accessToken',
      key,
      token,
      tenMinutesInSeconds,
    );
  }

  async getRedisToken(token: string) {
    return await this.redisRepository.get('accessToken', token);
  }
}
