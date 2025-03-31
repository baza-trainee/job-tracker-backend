import { Controller, Post, UseGuards, Req, Body, Get, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthResponse, LogoutResponse, MessageResponse, RefreshTokenResponse } from '../types';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Post('register')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created', type: AuthResponse })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'User signed in', type: AuthResponse })
  @ApiResponse({ status: 401, description: 'Invalid login or password' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async login(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
    return this.authService.login(loginUserDto, req);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'User signed out', type: LogoutResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(JwtAuthGuard)
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
  @ApiResponse({ status: 200, description: 'Google login successful', type: AuthResponse })
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
  @ApiResponse({ status: 200, description: 'GitHub login successful', type: AuthResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized or failed GitHub login' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async githubAuthRedirect(@Req() req: Request, @Res() res: any) {
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
  @ApiResponse({ status: 201, description: 'Tokens refreshed', type: RefreshTokenResponse })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshTokens(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('forgot-password')
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Email with link was sent. Check your email', type: MessageResponse })
  @ApiResponse({ status: 401, description: 'Invalid email' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password updated', type: MessageResponse })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto)
  }
}
