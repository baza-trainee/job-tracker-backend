import { HttpException, HttpStatus, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  private readonly selectFields = {
    user: [
      'user.id',
      'user.email',
      'user.username',
      'user.phone',
      'user.telegram',
      'user.github',
      'user.linkedin',
      'user.behance',
      'user.createdAt',
    ],
    vacancy: [
      'vacancies.id',
      'vacancies.vacancy',
      'vacancies.link',
      'vacancies.communication',
      'vacancies.company',
      'vacancies.location',
      'vacancies.work_type',
      'vacancies.note',
      'vacancies.isArchived',
      'vacancies.createdAt',
      'vacancies.updatedAt',
    ],
    status: [
      'statuses.id',
      'statuses.name',
      'statuses.date',
      'statuses.rejectReason',
      'statuses.resumeId',
    ],
    resume: [
      'resumes.id',
      'resumes.name',
      'resumes.link',
      'resumes.createdAt',
      'resumes.updatedAt',
    ],
    coverLetter: [
      'coverLetters.id',
      'coverLetters.name',
      'coverLetters.text',
      'coverLetters.createdAt',
      'coverLetters.updatedAt',
    ],
    project: [
      'projects.id',
      'projects.name',
      'projects.githubLink',
      'projects.liveProjectLink',
      'projects.createdAt',
      'projects.updatedAt',
    ],
    note: [
      'notes.id',
      'notes.name',
      'notes.text',
      'notes.createdAt',
      'notes.updatedAt',
    ],
    event: [
      'events.id',
      'events.name',
      'events.text',
      'events.date',
      'events.time',
      'events.createdAt',
      'events.updatedAt',
    ],
  };

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
      const userProfile = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.vacancies', 'vacancies')
        .leftJoinAndSelect('vacancies.statuses', 'statuses')
        .leftJoinAndSelect('user.resumes', 'resumes')
        .leftJoinAndSelect('user.coverLetters', 'coverLetters')
        .leftJoinAndSelect('user.projects', 'projects')
        .leftJoinAndSelect('user.notes', 'notes')
        .leftJoinAndSelect('user.events', 'events')
        .where('user.email = :email', { email: user.email })
        .orderBy({
          'vacancies.createdAt': 'DESC',
          'statuses.date': 'DESC',
          'resumes.createdAt': 'DESC',
          'coverLetters.createdAt': 'DESC',
          'projects.createdAt': 'DESC',
          'notes.createdAt': 'DESC',
          'events.date': 'ASC',
        })
        .select([
          ...this.selectFields.user,
          ...this.selectFields.vacancy,
          ...this.selectFields.status,
          ...this.selectFields.resume,
          ...this.selectFields.coverLetter,
          ...this.selectFields.project,
          ...this.selectFields.note,
          ...this.selectFields.event,
        ])
        .getOne();

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
    user: any,
    changePasswordDto: ChangePasswordDto
  ): Promise<any> {
    if (!user?.email) {
      throw new UnauthorizedException('User authentication required');
    }

    if (!changePasswordDto.previous_password || !changePasswordDto.new_password) {
      throw new BadRequestException('Previous password and new password are required');
    }

    try {
      const foundedUser = await this.userRepository.findOne({
        where: { email: user?.email }
      });

      if (!foundedUser) {
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

  async deleteUser(userId: string): Promise<any> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: [
          'vacancies',
          'resumes',
          'coverLetters',
          'projects',
          'notes',
          'events',
          'predictions'
        ]
      });

      if (!user) {
        throw new HttpException(
          'No account found with this ID',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.userRepository.remove(user);

      return {
        message: 'User and all related data successfully deleted',
        status: HttpStatus.OK
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}