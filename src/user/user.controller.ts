import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Patch,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IUser } from '../types';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('register')
  @UsePipes(new ValidationPipe())
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'user created', type: IUser })
  @ApiResponse({
    status: 500,
    description: 'internal server error',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
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
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(+id, updateUserDto);
  }
}
