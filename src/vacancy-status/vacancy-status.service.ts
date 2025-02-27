import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VacancyStatus, StatusName } from './entities/vacancy-status.entity';
import { Vacancy } from '../vacancies/entities/vacancy.entity';
import { NotFoundException } from '@nestjs/common';
import { UpdateVacancyStatusDto } from '../vacancies/dto/update-vacancy-status.dto';

@Injectable()
export class VacancyStatusService {
  constructor(
    @InjectRepository(VacancyStatus)
    private readonly vacancyStatusRepository: Repository<VacancyStatus>,
  ) { }

  async createInitialStatus(vacancy: Vacancy) {
    const status = this.vacancyStatusRepository.create({
      name: StatusName.SAVED,
      vacancy,
    });

    return this.vacancyStatusRepository.save(status);
  }

  async createStatus(vacancy: Vacancy, statusData: UpdateVacancyStatusDto) {
    try {
      if (statusData.name === StatusName.RESUME && !statusData.resumeId) {
        throw new BadRequestException('Resume ID is required for resume status');
      }

      const status = this.vacancyStatusRepository.create({
        ...statusData,
        date: statusData.date ? new Date(statusData.date) : new Date(),
        vacancy,
      });

      return await this.vacancyStatusRepository.save(status);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Failed to create vacancy status');
    }
  }

  async updateStatus(statusId: string, updateStatusDto: UpdateVacancyStatusDto) {
    try {
      const status = await this.vacancyStatusRepository.findOne({
        where: { id: statusId }
      });

      if (!status) {
        throw new NotFoundException('Status not found');
      }

      if (updateStatusDto.name === StatusName.RESUME && !updateStatusDto.resumeId) {
        throw new BadRequestException('Resume ID is required for resume status');
      }

      Object.assign(status, {
        name: updateStatusDto.name,
        ...(updateStatusDto.rejectReason && { rejectReason: updateStatusDto.rejectReason }),
        ...(updateStatusDto.resumeId && { resumeId: updateStatusDto.resumeId }),
        ...(updateStatusDto.date && { date: new Date(updateStatusDto.date) }),
        // Clear resumeId if status is changing from RESUME to something else
        ...(status.name === StatusName.RESUME && updateStatusDto.name !== StatusName.RESUME && { resumeId: null }),
        // Clear rejectReason if status is changing from REJECT to something else
        ...(status.name === StatusName.REJECT && updateStatusDto.name !== StatusName.REJECT && { rejectReason: null })
      });

      return await this.vacancyStatusRepository.save(status);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to update vacancy status');
    }
  }

  async deleteStatus(statusId: string) {
    try {
      const status = await this.vacancyStatusRepository.findOne({
        where: { id: statusId }
      });

      if (!status) {
        throw new NotFoundException('Status not found');
      }

      await this.vacancyStatusRepository.remove(status);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to delete vacancy status');
    }
  }
}