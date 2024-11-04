import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '../types';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOne(email);

    const isPasswordsMatch = await argon2.verify(user.password, password);

    if (user && isPasswordsMatch) {
      return user;
    }

    throw new HttpException(
      'Невірний логін або пароль. Спробуйте ще',
      HttpStatus.BAD_REQUEST,
    );
  }

  async login(user: IUser) {
    const { id, email, username } = user;
    return {
      id,
      email,
      username,
      access_token: this.generateAccessToken({ id, email }),
      refresh_token: this.generateRefreshToken({ id, email }),
    };
  }

  async refreshToken(user: JwtPayload) {
    const access_token = this.generateAccessToken(user);
    return { access_token };
  }

  generateAccessToken(user: JwtPayload) {
    return this.jwtService.sign(user, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '3d', // Set access token expiry time
    });
  }

  generateRefreshToken(user: JwtPayload) {
    return this.jwtService.sign(user, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '30d', // Set refresh token expiry time
    });
  }
}
