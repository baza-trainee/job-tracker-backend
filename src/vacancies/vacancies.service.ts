import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { UpdateVacancyStatusDto } from './dto/update-vacancy-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacancy } from './entities/vacancy.entity';
import { User } from '../user/entities/user.entity';
import { VacancyStatusService } from '../vacancy-status/vacancy-status.service';
import { StatusName } from '../vacancy-status/entities/vacancy-status.entity';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly vacancyStatusService: VacancyStatusService,
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

      // Create default "saved" status
      await this.vacancyStatusService.createInitialStatus(savedVacancy);

      return this.sanitizeVacancy(savedVacancy);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid request');
    }
  }

  async findAll(userId: string) {
    try {
      const vacancies = await this.vacancyRepository.find({
        where: { user: { id: userId } },
        relations: ['statuses'],
        select: {
          id: true,
          vacancy: true,
          link: true,
          communication: true,
          company: true,
          location: true,
          work_type: true,
          note: true,
          isArchived: true,
          createdAt: true,
          updatedAt: true
        },
        order: {
          statuses: {
            date: 'DESC'
          }
        }
      });
      return vacancies;
    } catch (error) {
      throw new BadRequestException('Invalid request');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const vacancy = await this.vacancyRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['statuses'],
        select: {
          id: true,
          vacancy: true,
          link: true,
          communication: true,
          company: true,
          location: true,
          work_type: true,
          note: true,
          isArchived: true,
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
      throw new BadRequestException('Invalid request');
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
      throw new BadRequestException('Invalid request');
    }
  }

  async archive(id: string, userId: string) {
    try {
      const vacancy = await this.vacancyRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['user']
      });

      if (!vacancy) {
        throw new NotFoundException('Vacancy not found');
      }

      vacancy.isArchived = !vacancy.isArchived;
      const updatedVacancy = await this.vacancyRepository.save(vacancy);
      return this.sanitizeVacancy(updatedVacancy);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid request');
    }
  }

  async addStatus(id: string, userId: string, updateStatusDto: UpdateVacancyStatusDto) {
    try {
      const vacancy = await this.vacancyRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['statuses'],
      });

      if (!vacancy) {
        throw new NotFoundException('Vacancy not found');
      }

      // Validate status data based on status name
      if (updateStatusDto.name === StatusName.REJECT) {
        if (!updateStatusDto.rejectReason) {
          throw new BadRequestException('Reject reason is required for reject status');
        }
      } else {
        // If status is not REJECT, make sure rejectReason is not provided
        if (updateStatusDto.rejectReason) {
          throw new BadRequestException('Reject reason can only be provided for reject status');
        }
      }

      // Validate resume for RESUME status
      if (updateStatusDto.name === StatusName.RESUME) {
        if (!updateStatusDto.resumeId) {
          throw new BadRequestException('Resume ID is required for resume status');
        }
      } else {
        // If status is not RESUME, make sure resumeId is not provided
        if (updateStatusDto.resumeId) {
          throw new BadRequestException('Resume ID can only be provided for resume status');
        }
      }

      // Create new status
      await this.vacancyStatusService.createStatus(vacancy, updateStatusDto);

      // Fetch updated vacancy with all statuses
      const updatedVacancy = await this.vacancyRepository.findOne({
        where: { id },
        relations: ['statuses'],
      });

      return updatedVacancy;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid request');
    }
  }

  async updateStatus(vacancyId: string, statusId: string, userId: string, updateStatusDto: UpdateVacancyStatusDto) {
    try {
      const vacancy = await this.vacancyRepository.findOne({
        where: { id: vacancyId, user: { id: userId } },
        relations: ['statuses'],
      });

      if (!vacancy) {
        throw new NotFoundException('Vacancy not found');
      }

      // Find the specific status
      const status = vacancy.statuses.find(s => s.id === statusId);
      if (!status) {
        throw new NotFoundException('Status not found');
      }

      // Validate status data based on status name
      if (updateStatusDto.name === StatusName.REJECT) {
        if (!updateStatusDto.rejectReason) {
          throw new BadRequestException('Reject reason is required for reject status');
        }
      } else {
        // If status is not REJECT, make sure rejectReason is not provided
        if (updateStatusDto.rejectReason) {
          throw new BadRequestException('Reject reason can only be provided for reject status');
        }
      }

      // Validate resume for RESUME status
      if (updateStatusDto.name === StatusName.RESUME) {
        if (!updateStatusDto.resumeId) {
          throw new BadRequestException('Resume ID is required for resume status');
        }
      } else {
        // If status is not RESUME, make sure resumeId is not provided
        if (updateStatusDto.resumeId) {
          throw new BadRequestException('Resume ID can only be provided for resume status');
        }
      }

      // Update the status
      await this.vacancyStatusService.updateStatus(status.id, updateStatusDto);

      // Fetch updated vacancy with all statuses
      const updatedVacancy = await this.vacancyRepository.findOne({
        where: { id: vacancyId },
        relations: ['statuses'],
      });

      if (!updatedVacancy) {
        throw new NotFoundException('Vacancy not found after update');
      }

      return this.sanitizeVacancy(updatedVacancy);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update status');
    }
  }

  async deleteStatus(id: string, statusId: string, userId: string): Promise<{ message: string }> {
    try {
      const vacancy = await this.vacancyRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['statuses'],
      });

      if (!vacancy) {
        throw new NotFoundException('Vacancy not found');
      }

      // Find the status to delete
      const statusToDelete = vacancy.statuses.find(s => s.id === statusId);
      if (!statusToDelete) {
        throw new NotFoundException('Status not found');
      }

      // Prevent deletion of the initial "saved" status
      if (statusToDelete.name === StatusName.SAVED && vacancy.statuses.length === 1) {
        throw new BadRequestException('Cannot delete the initial saved status');
      }

      // Delete the status
      await this.vacancyStatusService.deleteStatus(statusId);

      return { message: 'Status successfully removed' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid request');
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
      throw new BadRequestException('Invalid request');
    }
  }
}