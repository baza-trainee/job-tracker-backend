import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailingService } from '../mailing/mailing.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailingService: MailingService
  ) { }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const user = await this.userRepository.save({
      id: uuidv4(),
      email: createUserDto.email,
      password: await argon2.hash(createUserDto.password),
    });

    return this.generateTokens(user);
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userService.findOne(loginUserDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid login or password. Please try again');
    }

    const isPasswordsMatch = await argon2.verify(user.password, loginUserDto.password);

    if (!isPasswordsMatch) {
      throw new UnauthorizedException('Invalid login or password. Please try again');
    }

    return this.generateTokens(user);
  }

  async logout(req: any) {
    req.user = null;
    req.refresh_token = null;
    req.access_token = null;

    return { message: 'User successfully logged out', status: 200 };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.findOne(forgotPasswordDto.email);

    if (!user) {
      throw new UnauthorizedException('User with this email does not exist');
    }

    const token = this.jwtService.sign({ email: user.email }, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '10m',
    });

    const resetPasswordUrl = this.configService.get<string>('CLIENT_URL') + `/reset-password?verify=${token}`;

    await this.mailingService.sendMail({
      email: user.email,
      name: user.username,
      subject: 'Password reset',
      template: 'forgot-password',
      link: resetPasswordUrl,
    });

    return { message: 'Check your email', status: 200, email: user.email, token }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const decoded = this.jwtService.decode(resetPasswordDto.token);

    if (!decoded) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userService.findOne(decoded['email']);

    if (!user) {
      throw new UnauthorizedException('User with this email does not exist');
    }

    const hashedPassword = await argon2.hash(resetPasswordDto.password);

    await this.userService.updateUser(user.id, { password: hashedPassword });

    return { message: 'Password successfully updated', status: 200 }
  }

  async googleLogin(req: any) {
    if (!req.user) {
      return 'No user from Google';
    }

    let user = await this.userRepository.findOne({ where: { email: req.user.email } });

    if (!user) {
      user = await this.userRepository.save({
        id: uuidv4(),
        email: req.user.email,
        username: `${req.user.firstName} ${req.user.lastName}`,
        avatar: req.user.picture,
      });
    }

    return this.generateTokens(user);
  }

  async githubLogin(req: any) {
    if (!req.user) {
      return 'No user from GitHub';
    }

    let user = await this.userRepository.findOne({ where: { email: req.user.email } });

    if (!user) {
      user = await this.userRepository.save({
        id: uuidv4(),
        email: req.user.email,
        username: req.user.username,
      });
    }

    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const access_token = (await this.generateTokens(user)).access_token
      return { access_token }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '1h',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      access_token,
      refresh_token,
      user: this.selectFields(user),
    };
  }

  private selectFields(user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    };
  }

}
