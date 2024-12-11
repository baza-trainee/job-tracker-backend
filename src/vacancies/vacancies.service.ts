import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacancy } from './entities/vacancy.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  private sanitizeVacancy(vacancy: Vacancy) {
    const { user, ...vacancyWithoutUser } = vacancy;
    return vacancyWithoutUser;
  }

  async create(userId: string, createVacancyDto: CreateVacancyDto) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const vacancy = this.vacancyRepository.create({
        ...createVacancyDto,
        user
      });
      
      const savedVacancy = await this.vacancyRepository.save(vacancy);
      return this.sanitizeVacancy(savedVacancy);
    } catch (error) {
      throw new Error('Failed to create vacancy');
    }
  }

  async findAll(userId: string) {
    try {
      const vacancies = await this.vacancyRepository.find({
        where: { user: { id: userId } },
        select: {
          id: true,
          vacancy: true,
          link: true,
          communication: true,
          company: true,
          location: true,
          work_type: true,
          note: true,
          isArchive: true,
          createdAt: true,
          updatedAt: true
        }
      });
      return vacancies;
    } catch (error) {
      throw new Error('Failed to fetch vacancies');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const vacancy = await this.vacancyRepository.findOne({
        where: { id, user: { id: userId } },
        select: {
          id: true,
          vacancy: true,
          link: true,
          communication: true,
          company: true,
          location: true,
          work_type: true,
          note: true,
          isArchive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!vacancy) {
        throw new NotFoundException('Vacancy not found');
      }

      return vacancy;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to fetch vacancy');
    }
  }

  async update(id: string, userId: string, updateVacancyDto: UpdateVacancyDto) {
    try {
      const vacancy = await this.vacancyRepository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!vacancy) {
        throw new NotFoundException('Vacancy not found');
      }

      if (vacancy.user.id !== userId) {
        throw new ForbiddenException('You can only update your own vacancies');
      }

      Object.assign(vacancy, updateVacancyDto);
      const updatedVacancy = await this.vacancyRepository.save(vacancy);
      return this.sanitizeVacancy(updatedVacancy);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error('Failed to update vacancy');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const vacancy = await this.vacancyRepository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!vacancy) {
        throw new NotFoundException('Vacancy not found');
      }

      if (vacancy.user.id !== userId) {
        throw new ForbiddenException('You can only delete your own vacancies');
      }

      await this.vacancyRepository.remove(vacancy);
      return { message: 'Vacancy successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error('Failed to delete vacancy');
    }
  }
}
