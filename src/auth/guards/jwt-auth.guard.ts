import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(context)) as boolean;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid token');
    }
  }
}
