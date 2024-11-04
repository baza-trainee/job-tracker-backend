import { Controller, Post, Body, Patch } from '@nestjs/common';
import { PasswordService } from './password.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { IUser, NotFoundResponse } from 'src/types';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@ApiTags('Password')
@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  //password recovery send email
  @Post('forgot')
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  async forgotPassword(@Body('email') email: string) {
    return this.passwordService.sendMail(email);
  }

  //reset password
  @Post('reset')
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 201, description: 'reset password', type: IUser })
  @ApiResponse({
    status: 404,
    description: 'not found',
    type: NotFoundResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.passwordService.resetPassword(resetPasswordDto);
  }

  //change password
  @Patch('change')
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 201, description: 'change password', type: IUser })
  @ApiResponse({
    status: 404,
    description: 'not found',
    type: NotFoundResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.passwordService.changePassword(changePasswordDto);
  }
}
