import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new HttpException(
        'Користувач з цією адресою вже існує',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userRepository.save({
      email: createUserDto.email,
      password: await argon2.hash(createUserDto.password),
      username: createUserDto.username,
    });

    const token = this.jwtService.sign({ email: createUserDto.email });

    return { user, token };
  }

  async findOne(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException(
        'Немає акаунту з цією адресою',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user)
      throw new HttpException(
        'Немає акаунту з цією адресою',
        HttpStatus.NOT_FOUND,
      );
    await this.userRepository.update(id, updateUserDto);
    return { message: 'user successfully updated', status: 200 };
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
}
