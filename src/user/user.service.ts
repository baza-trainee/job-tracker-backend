import { HttpException, HttpStatus, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findOne(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new HttpException(
          'No account found with this email address',
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProfile(user: any) {
    if (!user?.email) {
      throw new UnauthorizedException('User authentication required');
    }

    try {
      const userProfile = await this.userRepository.findOne({
        where: { email: user.email },
        relations: ['vacancies'],
      });

      if (!userProfile) {
        throw new HttpException(
          'User profile not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return userProfile;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException(
          'No account found with this ID',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.userRepository.update(id, updateUserDto);
      return { 
        message: 'User successfully updated',
        status: HttpStatus.OK
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changePassword(
    req: any,
    changePasswordDto: ChangePasswordDto
  ): Promise<any> {
    if (!req?.user?.email) {
      throw new UnauthorizedException('User authentication required');
    }

    if (!changePasswordDto.previous_password || !changePasswordDto.new_password) {
      throw new BadRequestException('Previous password and new password are required');
    }

    try {
      const user = await this.userRepository.findOne({ 
        where: { email: req.user.email } 
      });

      if (!user) {
        throw new HttpException(
          'No account found with this email address',
          HttpStatus.NOT_FOUND,
        );
      }

      const isPasswordsMatch = await argon2.verify(
        user.password, 
        changePasswordDto.previous_password
      );

      if (!isPasswordsMatch) {
        throw new UnauthorizedException('Invalid previous password. Please try again.');
      }

      const newHashedPassword = await argon2.hash(changePasswordDto.new_password);
      await this.userRepository.update(user.id, { password: newHashedPassword });

      return { 
        message: 'Password successfully changed',
        status: HttpStatus.OK
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to change password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private selectFields(user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      vacancies: user.vacancies,
      createdAt: user.createdAt,
    };
  }
}
