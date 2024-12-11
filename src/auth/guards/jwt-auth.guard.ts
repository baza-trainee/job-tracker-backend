import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super();
    console.log('JwtAuthGuard initialized:', !!this.userRepository);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Call parent's canActivate to verify the token
      const canActivate = await super.canActivate(context);

      if (!canActivate) {
        console.error('super.canActivate returned false');
        return false;
      }

      // Check if token is invalidated
      const user = await this.userRepository.findOne({
        where: { email: request.user.email }
      });

      console.log(user)

      if (user?.invalidatedTokens?.includes(token)) {
        throw new UnauthorizedException('Token has been invalidated');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
