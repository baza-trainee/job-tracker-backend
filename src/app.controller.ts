import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IUser } from './types';
import { LoginUserDto } from './user/dto/login-user.dto';

@ApiTags('Auth')
@Controller()
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  constructor(private authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 201, description: 'user signed in', type: IUser })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiResponse({ status: 201, description: 'get user profile', type: IUser })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  getProfile(@Request() req) {
    return req.user;
  }
}
