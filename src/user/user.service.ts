import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
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
  }

  async getProfile(req: any) {
    const user = await this.userRepository.findOne({ where: { email: req.user?.email } });
    if (!user) {
      throw new HttpException(
        'No account found with this email address',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.selectFields(user);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException(
        'No account found with this email address',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.userRepository.update(id, updateUserDto);
    return { message: 'User successfully updated' };
  }

  async changePassword(
    req: any,
    changePasswordDto: ChangePasswordDto
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email: req.user?.email } });

    if (!user) {
      throw new HttpException(
        'No account found with this email address',
        HttpStatus.NOT_FOUND,
      );
    }

    const isPasswordsMatch = await argon2.verify(user.password, changePasswordDto.previous_password);

    if (!isPasswordsMatch) {
      throw new UnauthorizedException('Invalid previous password. Please try again.');
    }

    const newHashedPassword = await argon2.hash(changePasswordDto.new_password);

    await this.userRepository.update(user.id, { password: newHashedPassword });

    return { message: 'Password successfully changed' };
  }

  private selectFields(user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    };
  }
}
