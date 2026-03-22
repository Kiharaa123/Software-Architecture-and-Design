import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('User not authenticated');
    }
    return user;
  }
}
