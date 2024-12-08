import { Injectable, UnauthorizedException, ConflictException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
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
    if (!createUserDto.email || !createUserDto.password) {
      throw new BadRequestException('Email and password are required');
    }

    try {
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
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginUserDto: LoginUserDto) {
    if (!loginUserDto.email || !loginUserDto.password) {
      throw new BadRequestException('Email and password are required');
    }

    try {
      const user = await this.userService.findOne(loginUserDto.email);

      if (!user) {
        throw new UnauthorizedException('Invalid login credentials');
      }

      const isPasswordsMatch = await argon2.verify(
        user.password,
        loginUserDto.password
      );

      if (!isPasswordsMatch) {
        throw new UnauthorizedException('Invalid login credentials');
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to login',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logout(req: any) {
    if (!req?.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      req.user = null;
      req.refresh_token = null;
      req.access_token = null;

      return {
        message: 'User successfully logged out',
        status: HttpStatus.OK
      };
    } catch (error) {
      throw new HttpException(
        'Failed to logout',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    if (!forgotPasswordDto.email) {
      throw new BadRequestException('Email is required');
    }

    try {
      const user = await this.userService.findOne(forgotPasswordDto.email);

      if (!user) {
        throw new UnauthorizedException('User with this email does not exist');
      }

      const token = this.jwtService.sign(
        { email: user.email },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '10m',
        }
      );

      const resetPasswordUrl = this.configService.get<string>('CLIENT_URL') + `/reset-password?verify=${token}`;

      await this.mailingService.sendMail({
        email: user.email,
        name: user.username,
        subject: 'Password reset',
        template: 'forgot-password',
        link: resetPasswordUrl,
      });

      return {
        message: 'Password reset instructions have been sent to your email',
        status: HttpStatus.OK
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to process password reset request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    if (!resetPasswordDto.token || !resetPasswordDto.password) {
      throw new BadRequestException('Token and new password are required');
    }

    try {
      const decodedToken = this.jwtService.verify(resetPasswordDto.token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      const user = await this.userService.findOne(decodedToken.email);

      if (!user) {
        throw new UnauthorizedException('Invalid or expired reset token');
      }

      const hashedPassword = await argon2.hash(resetPasswordDto.password);
      await this.userRepository.update(user.id, { password: hashedPassword });

      return {
        message: 'Password has been successfully reset',
        status: HttpStatus.OK
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to reset password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to refresh tokens',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateTokens(user: User) {
    try {
      const payload = { email: user.email, sub: user.id };

      return {
        access_token: this.jwtService.sign(payload, {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '1d',
        }),
        refresh_token: this.jwtService.sign(payload, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        }),
      };
    } catch (error) {
      throw new HttpException(
        'Failed to generate tokens',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
