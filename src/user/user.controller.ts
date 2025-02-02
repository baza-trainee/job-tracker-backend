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
import { SocialMediaDto } from './dto/social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';

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

  @Patch('update')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UsePipes(new ValidationPipe())
  updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(req.user.id, updateUserDto);
  }

  @Post('socials')
  @ApiOperation({ summary: 'Add a new social media link' })
  @ApiBody({ type: SocialMediaDto })
  @ApiResponse({ status: 201, description: 'Social media link added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe())
  addSocialMedia(@Req() req, @Body() socialMediaDto: SocialMediaDto) {
    return this.userService.addSocialMedia(req.user.id, socialMediaDto);
  }

  @Patch('socials/:id')
  @ApiOperation({ summary: 'Update a social media link by ID' })
  @ApiBody({ type: UpdateSocialMediaDto })
  @ApiResponse({ status: 200, description: 'Social media link updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Social media link not found' })
  @UsePipes(new ValidationPipe())
  updateSocialMedia(
    @Req() req,
    @Param('id') id: string,
    @Body() updateSocialMediaDto: UpdateSocialMediaDto
  ) {
    return this.userService.updateSocialMedia(req.user.id, id, updateSocialMediaDto);
  }

  @Delete('socials/:id')
  @ApiOperation({ summary: 'Delete a social media link by ID' })
  @ApiResponse({ status: 200, description: 'Social media link deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Social media link not found' })
  deleteSocialMedia(@Req() req, @Param('id') id: string) {
    return this.userService.deleteSocialMedia(req.user.id, id);
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
