import { Injectable } from '@nestjs/common';
import { CreateVacancyStatusDto } from './dto/create-vacancy-status.dto';
import { UpdateVacancyStatusDto } from './dto/update-vacancy-status.dto';

@Injectable()
export class VacancyStatusService {
  create(createVacancyStatusDto: CreateVacancyStatusDto) {
    return 'This action adds a new vacancyStatus';
  }

  findAll() {
    return `This action returns all vacancyStatus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vacancyStatus`;
  }

  update(id: number, updateVacancyStatusDto: UpdateVacancyStatusDto) {
    return `This action updates a #${id} vacancyStatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} vacancyStatus`;
  }
}
