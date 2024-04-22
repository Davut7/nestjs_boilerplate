import { SetMetadata } from '@nestjs/common';

export const UserLevel = (level: number) => SetMetadata('level', level);
