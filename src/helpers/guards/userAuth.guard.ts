import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    // private tokenService: TokenService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new UnauthorizedException('User unauthorized');
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('User unauthorized');
      }

      // const userToken = this.tokenService.validateAccessToken(token);
      // if (!userToken.isVerified)
      //   throw new ForbiddenException('Please verify your account');
      const tokenInBlackList = await this.redisService.getRedisToken(token);
      if (tokenInBlackList) throw new UnauthorizedException('Token is invalid');
      // req.currentUser = userToken;
      return true;
    } catch (e) {
      throw new UnauthorizedException('User unauthorized');
    }
  }
}
