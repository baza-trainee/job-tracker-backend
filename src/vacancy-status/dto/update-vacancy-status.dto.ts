import { PartialType } from '@nestjs/swagger';
import { CreateVacancyStatusDto } from './create-vacancy-status.dto';

export class UpdateVacancyStatusDto extends PartialType(CreateVacancyStatusDto) {}
