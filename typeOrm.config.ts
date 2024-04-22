import { DataSource } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { ConfigService } from '@nestjs/config';
dotenvConfig({ path: `.development.env` });

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow('DB_HOST'),
  port: configService.getOrThrow('DB_PORT'),
  username: configService.getOrThrow('DB_USER'),
  password: configService.getOrThrow('DB_PASSWORD'),
  database: configService.getOrThrow('DB_NAME'),
  entities: ['src/**/*.entity.ts'],
  migrations: ['migrations/**'],
});
