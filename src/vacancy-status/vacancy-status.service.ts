import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VacancyStatus, StatusName } from './entities/vacancy-status.entity';
import { Vacancy } from '../vacancies/entities/vacancy.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class VacancyStatusService {
  constructor(
    @InjectRepository(VacancyStatus)
    private readonly vacancyStatusRepository: Repository<VacancyStatus>,
  ) {}

  async createInitialStatus(vacancy: Vacancy) {
    const status = this.vacancyStatusRepository.create({
      name: StatusName.SAVED,
      vacancy,
    });

    return this.vacancyStatusRepository.save(status);
  }

  async createStatus(vacancy: Vacancy, statusData: Partial<VacancyStatus>) {
    try {
      const status = this.vacancyStatusRepository.create({
        ...statusData,
        vacancy,
      });

      return await this.vacancyStatusRepository.save(status);
    } catch (error) {
      throw new Error('Failed to create vacancy status');
    }
  }

  async updateStatus(statusId: string, updateStatusDto: any) {
    try {
      const status = await this.vacancyStatusRepository.findOne({
        where: { id: statusId }
      });

      if (!status) {
        throw new NotFoundException('Status not found');
      }

      Object.assign(status, {
        name: updateStatusDto.name,
        ...(updateStatusDto.rejectReason && { rejectReason: updateStatusDto.rejectReason }),
        ...(updateStatusDto.resume && { resume: updateStatusDto.resume })
      });

      return await this.vacancyStatusRepository.save(status);
    } catch (error) {
      if (error instanceof NotFoundException) {
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
