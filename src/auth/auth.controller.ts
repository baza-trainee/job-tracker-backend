import { Controller, Post, UseGuards, Req, Body, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IUser, LogoutResponse } from '../types';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
import { AuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Post('register')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created', type: IUser })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'User signed in', type: IUser })
  @ApiResponse({ status: 401, description: 'Invalid login or password' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('logout')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token for authorization',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User signed out', type: LogoutResponse })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request) {
    return this.authService.logout(req);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiResponse({ status: 200, description: 'Google authentication initialized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async googleAuth(@Req() req) {
    return { msg: 'Google authentication initialized' };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiResponse({ status: 200, description: 'Google login successful', type: IUser })
  @ApiResponse({ status: 401, description: 'Unauthorized or failed Google login' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async googleAuthRedirect(@Req() req: Request, @Res() res: any) {
    try {
      const result = await this.authService.googleLogin(req);
      if (result === 'No user from Google') {
        console.error('Google auth error: No user from Google');
        return res.redirect(`${this.configService.get<string>('CLIENT_URL')}/auth/error`);
      }
      const { access_token, refresh_token } = result;
      const clientUrl = this.configService.get<string>('CLIENT_URL');
      const redirectUrl = `${clientUrl}/auth/callback?access_token=${access_token}&refresh_token=${refresh_token}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google auth error:', error);
      return res.redirect(`${this.configService.get<string>('CLIENT_URL')}/auth/error`);
    }
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiResponse({ status: 200, description: 'GitHub authentication initialized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async githubAuth(@Req() req) {
    return { msg: 'GitHub authentication initialized' };
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @ApiResponse({ status: 200, description: 'GitHub login successful', type: IUser })
  @ApiResponse({ status: 401, description: 'Unauthorized or failed GitHub login' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async githubAuthRedirect(@Req() req, @Res() res: any) {
    try {
      const result = await this.authService.githubLogin(req);

      if (result === 'No user from GitHub') {
        console.error('GitHub auth error: No user from GitHub');
        return res.redirect(`${this.configService.get<string>('CLIENT_URL')}/login?error=no_user`);
      }

      const { access_token, refresh_token } = result;

      const clientUrl = this.configService.get<string>('CLIENT_URL');
      const redirectUrl = `${clientUrl}/auth/callback?access_token=${access_token}&refresh_token=${refresh_token}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('GitHub auth error:', error);
      return res.redirect(`${this.configService.get<string>('CLIENT_URL')}/login?error=auth_failed`);
    }
  }

  @Post('refresh')
  @ApiBody({ schema: { type: 'object', properties: { refresh_token: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Tokens refreshed', type: IUser })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshTokens(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }
}
