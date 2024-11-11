import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

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
        'Немає акаунту з цією адресою',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async getProfile(req: any) {
    const user = await this.userRepository.findOne({ where: { email: req.user?.email } });
    if (!user) {
      throw new HttpException(
        'Немає акаунту з цією адресою',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.selectFields(user);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user)
      throw new HttpException(
        'Немає акаунту з цією адресою',
        HttpStatus.NOT_FOUND,
      );
    await this.userRepository.update(id, updateUserDto);
    return { message: 'user successfully updated' };
  }

  async updatePassword(
    email: string,
    updateUserDto: UpdateUserDto,
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user)
      throw new HttpException(
        'Немає акаунту з цією адресою',
        HttpStatus.NOT_FOUND,
      );
    return this.userRepository.update(email, updateUserDto);
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
