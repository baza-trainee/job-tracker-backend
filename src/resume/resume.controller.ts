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
import { ResumeService } from './resume.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Resume } from './entities/resume.entity';
import { UUIDValidationPipe } from '../common/pipes/uuid-validation.pipe';

@ApiTags('Resumes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('resumes')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new resume',
    description: 'Creates a new resume for the authenticated user'
  })
  @ApiResponse({
    status: 201,
    description: 'Resume successfully created',
    type: Resume
  })
  create(@Request() req, @Body() createResumeDto: CreateResumeDto) {
    return this.resumeService.create(createResumeDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all resumes',
    description: 'Returns all resumes for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all resumes',
    type: [Resume]
  })
  findAll(@Request() req) {
    return this.resumeService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a resume by id',
    description: 'Returns a specific resume if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the resume',
    type: Resume
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Resume ID',
    type: 'string',
    format: 'uuid'
  })
  findOne(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.resumeService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a resume',
    description: 'Updates a resume if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Resume successfully updated',
    type: Resume
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Resume ID',
    type: 'string',
    format: 'uuid'
  })
  update(
    @Param('id', UUIDValidationPipe) id: string,
    @Request() req,
    @Body() updateResumeDto: UpdateResumeDto
  ) {
    return this.resumeService.update(id, updateResumeDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a resume',
    description: 'Deletes a resume if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Resume successfully deleted'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Resume ID',
    type: 'string',
    format: 'uuid'
  })
  remove(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.resumeService.remove(id, req.user.id);
  }
}
