import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Vacancy } from './entities/vacancy.entity';
import { UpdateVacancyStatusDto } from './dto/update-vacancy-status.dto';

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
  findOne(@Param('id') id: string, @Request() req) {
    return this.vacanciesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vacancy' })
  @ApiResponse({ status: 200, description: 'Vacancy successfully updated', type: Vacancy })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only update own vacancies' })
  @ApiResponse({ status: 404, description: 'Vacancy not found' })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateVacancyDto: UpdateVacancyDto,
  ) {
    return this.vacanciesService.update(id, req.user.id, updateVacancyDto);
  }

  @Post('status/:id')
  @ApiOperation({ summary: 'Add new vacancy status' })
  @ApiResponse({ status: 201, type: Vacancy, description: 'Status successfully added' })
  @ApiResponse({ status: 400, description: 'Invalid status data provided' })
  @ApiResponse({ status: 404, description: 'Vacancy not found' })
  @ApiParam({ name: 'id', description: 'Vacancy ID' })
  addStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() updateStatusDto: UpdateVacancyStatusDto,
  ) {
    return this.vacanciesService.addStatus(id, req.user.id, updateStatusDto);
  }

  @Patch('status/:id')
  @ApiOperation({ summary: 'Update existing vacancy status' })
  @ApiResponse({ status: 200, type: Vacancy, description: 'Status successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid status data or statusId not provided' })
  @ApiResponse({ status: 404, description: 'Vacancy or status not found' })
  @ApiParam({ name: 'id', description: 'Vacancy ID' })
  updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() updateStatusDto: UpdateVacancyStatusDto,
  ) {
    return this.vacanciesService.updateStatus(id, req.user.id, updateStatusDto);
  }

  @Delete('status/:id/:statusId')
  @ApiOperation({ summary: 'Delete vacancy status' })
  @ApiResponse({ status: 200, description: 'Status successfully removed' })
  @ApiResponse({ status: 400, description: 'Cannot delete the initial saved status' })
  @ApiResponse({ status: 404, description: 'Vacancy or status not found' })
  @ApiParam({ name: 'id', description: 'Vacancy ID' })
  @ApiParam({ name: 'statusId', description: 'Status ID to delete' })
  deleteStatus(
    @Param('id') id: string,
    @Param('statusId') statusId: string,
    @Request() req,
  ) {
    return this.vacanciesService.deleteStatus(id, statusId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vacancy' })
  @ApiResponse({ status: 200, description: 'Vacancy successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only delete own vacancies' })
  @ApiResponse({ status: 404, description: 'Vacancy not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.vacanciesService.remove(id, req.user.id);
  }
}
