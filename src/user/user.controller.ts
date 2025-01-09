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
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { IUser } from '../types';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('User')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: IUser })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getProfile(@Req() req) {
    return this.userService.getProfile({ ...req.user });
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Password successfully changed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Server error' })
  changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(req.user, changePasswordDto);
  }

  @ApiOperation({ summary: 'Delete user and all related data' })
  @ApiResponse({
    status: 200,
    description: 'User and all related data successfully deleted',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - User ID is required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
