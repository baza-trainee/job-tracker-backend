import {
  Controller,
  Body,
  UsePipes,
  ValidationPipe,
  Patch,
  Param,
  Get,
  UseGuards,
  Req,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IUser } from '../types';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer access_token for authorization',
    required: true,
    example: 'Bearer your_access_token_here',
  })
  @ApiResponse({ status: 200, description: 'User profile', type: IUser })
  @ApiResponse({ status: 401, description: 'Unauthorized request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @UseGuards(AuthGuard)
  getProfile(@Req() req) {
    return this.userService.getProfile(req.user);
  }

  @Post('change-password')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer access_token for authorization',
    required: true,
    example: 'Bearer your_access_token_here',
  })
  @ApiResponse({ status: 200, description: 'Password successfully changed' })
  @ApiResponse({ status: 401, description: 'Unauthorized request' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @UseGuards(AuthGuard)
  changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(req.user, changePasswordDto);
  }
}

