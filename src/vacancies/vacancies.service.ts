import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { Vacancy } from './entities/vacancy.entity';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private vacanciesRepository: Repository<Vacancy>,
  ) { }

  async create(createVacancyDto: CreateVacancyDto, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    try {
      const vacancy = this.vacanciesRepository.create({
        ...createVacancyDto,
        userId,
      });
      const savedVacancy = await this.vacanciesRepository.save(vacancy);
      return {
        message: 'Vacancy successfully created',
        vacancy: savedVacancy,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create vacancy',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(userId?: string) {
    try {
      if (userId) {
        return await this.vacanciesRepository.find({
          where: { userId },
          order: { createdAt: 'DESC' },
        });
      }
      return await this.vacanciesRepository.find({
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new HttpException(
        'Failed to fetch vacancies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, userId?: string) {
    if (!id) {
      throw new HttpException(
        'Vacancy ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const query = this.vacanciesRepository.createQueryBuilder('vacancy')
        .where('vacancy.id = :id', { id });

      if (userId) {
        query.andWhere('vacancy.userId = :userId', { userId });
      }

      const vacancy = await query.getOne();

      if (!vacancy) {
        throw new NotFoundException(`Vacancy with ID ${id} not found`);
      }

      if (userId && vacancy.userId !== userId) {
        throw new UnauthorizedException('You do not have permission to access this vacancy');
      }

      return vacancy;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch vacancy',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateVacancyDto: UpdateVacancyDto, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    try {
      const vacancy = await this.findOne(id, userId);

      if (!vacancy) {
        throw new NotFoundException(`Vacancy with ID ${id} not found`);
      }

      if (vacancy.userId !== userId) {
        throw new UnauthorizedException('You do not have permission to update this vacancy');
      }

      Object.assign(vacancy, updateVacancyDto);
      const updatedVacancy = await this.vacanciesRepository.save(vacancy);

      return {
        message: 'Vacancy successfully updated',
        vacancy: updatedVacancy,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update vacancy',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    try {
      const vacancy = await this.findOne(id, userId);

      if (!vacancy) {
        throw new NotFoundException(`Vacancy with ID ${id} not found`);
      }

      if (vacancy.userId !== userId) {
        throw new UnauthorizedException('You do not have permission to delete this vacancy');
      }

      await this.vacanciesRepository.remove(vacancy);
      return {
        message: 'Vacancy successfully deleted',
        status: HttpStatus.OK
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete vacancy',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
