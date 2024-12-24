import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Vacancy } from './entities/vacancy.entity';
import { UUIDValidationPipe } from '../common/pipes/uuid-validation.pipe';
import { UpdateVacancyStatusDto } from './dto/update-vacancy-status.dto';
import { RejectReason } from '../vacancy-status/entities/vacancy-status.entity';

@ApiTags('Vacancies')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new vacancy',
    description: 'Creates a new vacancy for the authenticated user'
  })
  @ApiResponse({
    status: 201,
    description: 'Vacancy successfully created',
    type: Vacancy
  })
  create(@Request() req, @Body() createVacancyDto: CreateVacancyDto) {
    return this.vacanciesService.create(req.user.id, createVacancyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all vacancies',
    description: 'Returns all vacancies for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all vacancies',
    type: [Vacancy]
  })
  findAll(@Request() req) {
    return this.vacanciesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a vacancy by id',
    description: 'Returns a specific vacancy if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the vacancy',
    type: Vacancy
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  findOne(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.vacanciesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a vacancy',
    description: 'Updates a vacancy if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Vacancy successfully updated',
    type: Vacancy
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  update(
    @Param('id', UUIDValidationPipe) id: string,
    @Request() req,
    @Body() updateVacancyDto: UpdateVacancyDto
  ) {
    return this.vacanciesService.update(id, req.user.id, updateVacancyDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a vacancy',
    description: 'Deletes a vacancy if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Vacancy successfully deleted'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  remove(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.vacanciesService.remove(id, req.user.id);
  }

  @Patch(':id/archive')
  @ApiOperation({
    summary: 'Archive a vacancy',
    description: 'Archives a vacancy if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Vacancy successfully archived',
    type: Vacancy
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  archive(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.vacanciesService.archive(id, req.user.id);
  }

  @Post(':vacancyId/status')
  @ApiOperation({
    summary: 'Create a new vacancy status',
    description: 'Creates a new status for a vacancy. Status transitions follow specific rules:\n\n' +
      '- SAVED: Initial status when vacancy is saved\n' +
      '- RESUME: Requires resumeId field to be provided\n' +
      '- HR: HR interview stage\n' +
      '- TEST: Technical test stage\n' +
      '- TECH: Technical interview stage\n' +
      '- REJECT: Requires rejectReason field with one of the following values:\n' +
      '  * SOFT_SKILLS: Rejected due to soft skills assessment\n' +
      '  * TECH_SKILLS: Rejected due to technical skills assessment\n' +
      '  * ENGLISH: Rejected due to English language proficiency\n' +
      '  * EXPERIENCE: Rejected due to insufficient experience\n' +
      '  * STOPPED: Application process stopped\n' +
      '  * NO_ANSWER: No response received from candidate\n' +
      '  * OTHER: Other rejection reasons\n' +
      '- OFFER: Final stage when job offer is received\n\n' +
      'Note: rejectReason is only allowed when status is REJECT, and resumeId is only allowed when status is RESUME'
  })
  @ApiResponse({
    status: 201,
    description: 'Status successfully created',
    type: Vacancy
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'vacancyId',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  createStatus(
    @Param('vacancyId', UUIDValidationPipe) vacancyId: string,
    @Request() req,
    @Body() updateStatusDto: UpdateVacancyStatusDto
  ) {
    return this.vacanciesService.addStatus(vacancyId, req.user.id, updateStatusDto);
  }

  @Patch(':vacancyId/status/:statusId')
  @ApiOperation({
    summary: 'Update a vacancy status',
    description: 'Updates a specific status of a vacancy. Status transitions follow specific rules:\n\n' +
      '- SAVED: Initial status when vacancy is saved\n' +
      '- RESUME: Requires resumeId field to be provided\n' +
      '- HR: HR interview stage\n' +
      '- TEST: Technical test stage\n' +
      '- TECH: Technical interview stage\n' +
      '- REJECT: Requires rejectReason field with one of the following values:\n' +
      `  * ${RejectReason.SOFT_SKILLS}: Rejected due to soft skills assessment\n` +
      `  * ${RejectReason.TECH_SKILLS}: Rejected due to technical skills assessment\n` +
      `  * ${RejectReason.ENGLISH}: Rejected due to English language proficiency\n` +
      `  * ${RejectReason.EXPERIENCE}: Rejected due to insufficient experience\n` +
      `  * ${RejectReason.STOPPED}: Application process stopped\n` +
      `  * ${RejectReason.NO_ANSWER}: No response received from candidate\n` +
      `  * ${RejectReason.OTHER}: Other rejection reasons\n` +
      '- OFFER: Final stage when job offer is received\n\n' +
      'Note: rejectReason is only allowed when status is REJECT, and resumeId is only allowed when status is RESUME'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status successfully updated'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data or status validation failed'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vacancy or status not found'
  })
  @ApiParam({
    name: 'vacancyId',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiParam({
    name: 'statusId',
    description: 'Status ID to update',
    type: 'string',
    format: 'uuid'
  })
  updateStatus(
    @Param('vacancyId', UUIDValidationPipe) vacancyId: string,
    @Param('statusId', UUIDValidationPipe) statusId: string,
    @Request() req,
    @Body() updateStatusDto: UpdateVacancyStatusDto
  ) {
    return this.vacanciesService.updateStatus(vacancyId, statusId, req.user.id, updateStatusDto);
  }

  @Delete(':vacancyId/status/:statusId')
  @ApiOperation({
    summary: 'Delete a status from a vacancy',
    description: 'Deletes a status from a vacancy if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Status successfully deleted'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'vacancyId',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiParam({
    name: 'statusId',
    description: 'Status ID',
    type: 'string',
    format: 'uuid'
  })
  deleteStatus(
    @Param('vacancyId', UUIDValidationPipe) vacancyId: string,
    @Param('statusId', UUIDValidationPipe) statusId: string,
    @Request() req
  ) {
    return this.vacanciesService.deleteStatus(vacancyId, statusId, req.user.id);
  }
}