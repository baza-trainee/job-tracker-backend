import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
      passReqToCallback: true, // This allows us to access the request object
    });
  }

  async validate(request: any, payload: any) {
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Get full user data including invalidatedTokens
    const user = await this.userRepository.findOne({
      where: { email: payload.email }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if token is invalidated
    if (user.invalidatedTokens?.includes(token)) {
      throw new UnauthorizedException('Token has been invalidated');
    }

    // Verify token's JTI
    if (!payload.jti) {
      throw new UnauthorizedException('Invalid token format');
    }

    return user;
  }

  private extractTokenFromHeader(request: any): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}