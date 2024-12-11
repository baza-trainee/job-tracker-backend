import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VacancyStatusService } from './vacancy-status.service';
import { CreateVacancyStatusDto } from './dto/create-vacancy-status.dto';
import { UpdateVacancyStatusDto } from './dto/update-vacancy-status.dto';

@Controller('vacancy-status')
export class VacancyStatusController {
  constructor(private readonly vacancyStatusService: VacancyStatusService) {}

  @Post()
  create(@Body() createVacancyStatusDto: CreateVacancyStatusDto) {
    return this.vacancyStatusService.create(createVacancyStatusDto);
  }

  @Get()
  findAll() {
    return this.vacancyStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vacancyStatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVacancyStatusDto: UpdateVacancyStatusDto) {
    return this.vacancyStatusService.update(+id, updateVacancyStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vacancyStatusService.remove(+id);
  }
}
