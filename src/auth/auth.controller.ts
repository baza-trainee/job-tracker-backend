import { Controller, Post, UseGuards, Request, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { IUser } from 'src/types';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 201, description: 'user signed in', type: IUser })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiHeader({
    name: 'Authorization',
    description: 'Refresh token in Bearer format',
    required: true,
    example: 'Bearer your-refresh-token-here',
  })
  @ApiResponse({ status: 200, description: 'user signed in', type: IUser })
  async refreshToken(@Req() req) {
    const user = req.user;
    return this.authService.refreshToken(user);
  }
}
