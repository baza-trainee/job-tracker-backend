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
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IUser } from '../types';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer access token for authorization',
    required: true,
    example: 'Bearer your_access_token_here',
  })
  @ApiResponse({ status: 200, description: 'Get user profile', type: IUser })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(AuthGuard)
  getProfile(@Req() req) {
    return this.userService.getProfile(req.user);
  }


  @Patch(':id')
  @UsePipes(new ValidationPipe())
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 201,
    description: 'user successfully updated',
    type: IUser,
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }
}
