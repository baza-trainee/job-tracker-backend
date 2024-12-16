import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
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
  @ApiOperation({
    summary: 'Create a new vacancy',
    description: 'Creates a new vacancy for the authenticated user. Automatically adds an initial "saved" status.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Vacancy successfully created',
    type: Vacancy
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data provided'
  })
  create(@Request() req, @Body() createVacancyDto: CreateVacancyDto) {
    return this.vacanciesService.create(req.user.id, createVacancyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all vacancies for the current user',
    description: 'Returns all vacancies belonging to the authenticated user, ordered by creation date'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all vacancies with their statuses',
    type: [Vacancy]
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
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
    status: HttpStatus.OK,
    description: 'Returns the vacancy with its statuses',
    type: Vacancy
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vacancy not found or does not belong to the user'
  })
  @ApiParam({
    name: 'id',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.vacanciesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a vacancy',
    description: 'Updates a specific vacancy if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vacancy successfully updated',
    type: Vacancy
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - vacancy belongs to another user'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vacancy not found'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data provided'
  })
  @ApiParam({
    name: 'id',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateVacancyDto: UpdateVacancyDto,
  ) {
    return this.vacanciesService.update(id, req.user.id, updateVacancyDto);
  }

  @Post('archive/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archive or unarchive a vacancy',
    description: 'Changes isArchive field of a specific vacancy if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vacancy archived statussuccessfully changed',
    type: Vacancy
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - vacancy belongs to another user'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vacancy not found'
  })
  @ApiParam({
    name: 'id',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  archive(@Param('id') id: string, @Request() req) {
    return this.vacanciesService.archive(id, req.user.id);
  }

  @Post('status/:vacancyId')
  @ApiOperation({
    summary: 'Add new vacancy status',
    description: `
    Adds a new status to the vacancy. The following validation rules apply:

    1. REJECT status:
       - rejectReason is required
       - resumeId must not be provided

    2. RESUME status:
       - resumeId is required (UUID of an existing resume)
       - rejectReason must not be provided

    3. Other statuses (HR, TEST, TECH, OFFER):
       - Neither rejectReason nor resumeId should be provided
    `
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: Vacancy,
    description: 'Status successfully added'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status data provided. Common cases:\n- Missing rejectReason for REJECT status\n- Missing resumeId for RESUME status\n- Providing rejectReason or resumeId with wrong status type'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vacancy not found or resumeId references non-existent resume'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  @ApiParam({
    name: 'vacancyId',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  addStatus(
    @Param('vacancyId') id: string,
    @Request() req,
    @Body() updateStatusDto: UpdateVacancyStatusDto,
  ) {
    return this.vacanciesService.addStatus(id, req.user.id, updateStatusDto);
  }

  @Patch('status/:vacancyId')
  @ApiOperation({
    summary: 'Update existing vacancy status',
    description: `
    Updates an existing vacancy status. The following validation rules apply:

    1. REJECT status:
       - rejectReason is required
       - resumeId must not be provided

    2. RESUME status:
       - resumeId is required (UUID of an existing resume)
       - rejectReason must not be provided

    3. Other statuses (HR, TEST, TECH, OFFER):
       - Neither rejectReason nor resumeId should be provided

    Note: statusId is required in the request body to identify which status to update
    `
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Vacancy,
    description: 'Status successfully updated'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status data provided. Common cases:\n- Missing statusId\n- Missing rejectReason for REJECT status\n- Missing resumeId for RESUME status\n- Providing rejectReason or resumeId with wrong status type'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vacancy, status, or referenced resume not found'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  @ApiParam({
    name: 'vacancyId',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  updateStatus(
    @Param('vacancyId') id: string,
    @Request() req,
    @Body() updateStatusDto: UpdateVacancyStatusDto,
  ) {
    return this.vacanciesService.updateStatus(id, req.user.id, updateStatusDto);
  }

  @Delete('status/:vacancyId/:statusId')
  @ApiOperation({
    summary: 'Delete vacancy status',
    description: 'Deletes a specific status from a vacancy. The initial "saved" status cannot be deleted.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status successfully removed'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete the initial saved status'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vacancy or status not found'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  @ApiParam({
    name: 'vacancyId',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  @ApiParam({
    name: 'statusId',
    description: 'Status ID to delete',
    type: 'string',
    format: 'uuid'
  })
  deleteStatus(
    @Param('vacancyId') id: string,
    @Param('statusId') statusId: string,
    @Request() req,
  ) {
    return this.vacanciesService.deleteStatus(id, statusId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a vacancy',
    description: 'Deletes a vacancy and all its associated statuses'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vacancy successfully deleted'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vacancy not found'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - valid JWT token required'
  })
  @ApiParam({
    name: 'id',
    description: 'Vacancy ID',
    type: 'string',
    format: 'uuid'
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.vacanciesService.remove(id, req.user.id);
  }
}