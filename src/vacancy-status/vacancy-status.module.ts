import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancyStatusService } from './vacancy-status.service';
import { VacancyStatus } from './entities/vacancy-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VacancyStatus])],
  providers: [VacancyStatusService],
  exports: [VacancyStatusService],
})
export class VacancyStatusModule {}
