import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Project } from './entities/project.entity';
import { UUIDValidationPipe } from '../common/pipes/uuid-validation.pipe';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  @ApiOperation({
    summary: 'Create a new project',
    description: 'Creates a new project for the authenticated user'
  })
  @ApiResponse({
    status: 201,
    description: 'Project successfully created',
    type: Project
  })
  create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all projects',
    description: 'Returns all projects for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all projects',
    type: [Project]
  })
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a project by id',
    description: 'Returns a specific project if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the project',
    type: Project
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    type: 'string',
    format: 'uuid'
  })
  findOne(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a project',
    description: 'Updates a project if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Project successfully updated',
    type: Project
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    type: 'string',
    format: 'uuid'
  })
  update(
    @Param('id', UUIDValidationPipe) id: string,
    @Request() req,
    @Body() updateProjectDto: UpdateProjectDto
  ) {
    return this.projectsService.update(id, req.user.id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a project',
    description: 'Deletes a project if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Project successfully deleted'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    type: 'string',
    format: 'uuid'
  })
  remove(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.id);
  }
}
