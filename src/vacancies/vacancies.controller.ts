import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Vacancy } from './entities/vacancy.entity';

@ApiTags('Vacancies')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new vacancy' })
  @ApiResponse({ status: 201, description: 'Vacancy successfully created', type: Vacancy })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Request() req, @Body() createVacancyDto: CreateVacancyDto) {
    return this.vacanciesService.create(req.user.id, createVacancyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vacancies for the current user' })
  @ApiResponse({ status: 200, description: 'Return all vacancies', type: [Vacancy] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.vacanciesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vacancy by id' })
  @ApiResponse({ status: 200, description: 'Return the vacancy', type: Vacancy })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vacancy not found' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.vacanciesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vacancy' })
  @ApiResponse({ status: 200, description: 'Vacancy successfully updated', type: Vacancy })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only update own vacancies' })
  @ApiResponse({ status: 404, description: 'Vacancy not found' })
  update(@Request() req, @Param('id') id: string, @Body() updateVacancyDto: UpdateVacancyDto) {
    return this.vacanciesService.update(id, req.user.id, updateVacancyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vacancy' })
  @ApiResponse({ status: 200, description: 'Vacancy successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only delete own vacancies' })
  @ApiResponse({ status: 404, description: 'Vacancy not found' })
  remove(@Request() req, @Param('id') id: string) {
    return this.vacanciesService.remove(id, req.user.id);
  }
}
