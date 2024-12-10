import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { Vacancy } from './entities/vacancy.entity';

@ApiTags('Vacancies')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) { }

  @Post()
  @ApiBody({ type: CreateVacancyDto })
  @ApiResponse({ status: 201, description: 'Vacancy created successfully', type: Vacancy })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Request() req, @Body() createVacancyDto: CreateVacancyDto) {
    return this.vacanciesService.create(createVacancyDto, req.user.id);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of all vacancies', type: [Vacancy] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.vacanciesService.findAll(req?.user?.id);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Vacancy ID' })
  @ApiResponse({ status: 200, description: 'Vacancy found', type: Vacancy })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vacancy not found' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.vacanciesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'Vacancy ID' })
  @ApiBody({ type: UpdateVacancyDto })
  @ApiResponse({ status: 200, description: 'Vacancy updated successfully', type: Vacancy })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vacancy not found' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateVacancyDto: UpdateVacancyDto,
  ) {
    return this.vacanciesService.update(id, updateVacancyDto, req.user.id);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Vacancy ID' })
  @ApiResponse({ status: 200, description: 'Vacancy deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vacancy not found' })
  remove(@Request() req, @Param('id') id: string) {
    return this.vacanciesService.remove(id, req.user.id);
  }
}
