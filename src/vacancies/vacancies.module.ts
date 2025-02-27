import { Module } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { VacanciesController } from './vacancies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vacancy } from './entities/vacancy.entity';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { VacancyStatusModule } from '../vacancy-status/vacancy-status.module';
import { VacancyStatus } from '../vacancy-status/entities/vacancy-status.entity';
import { Resume } from '../resume/entities/resume.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vacancy, User, VacancyStatus, Resume]),
    AuthModule,
    VacancyStatusModule,
  ],
  controllers: [VacanciesController],
  providers: [VacanciesService],
  exports: [VacanciesService],
})
export class VacanciesModule {}
