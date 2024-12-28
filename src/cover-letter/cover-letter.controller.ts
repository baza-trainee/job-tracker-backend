import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CoverLetterService } from './cover-letter.service';
import { CreateCoverLetterDto } from './dto/create-cover-letter.dto';
import { UpdateCoverLetterDto } from './dto/update-cover-letter.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoverLetter } from './entities/cover-letter.entity';
import { UUIDValidationPipe } from '../common/pipes/uuid-validation.pipe';

@ApiTags('Cover Letters')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('cover-letter')
export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) { }

  @Post()
  @ApiOperation({
    summary: 'Create a new cover letter',
    description: 'Creates a new cover letter for the authenticated user'
  })
  @ApiResponse({
    status: 201,
    description: 'Cover letter successfully created',
    type: CoverLetter
  })
  create(@Request() req, @Body() createCoverLetterDto: CreateCoverLetterDto) {
    return this.coverLetterService.create(req.user.id, createCoverLetterDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all cover letters',
    description: 'Returns all cover letters for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all cover letters',
    type: [CoverLetter]
  })
  findAll(@Request() req) {
    return this.coverLetterService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a cover letter by id',
    description: 'Returns a specific cover letter if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the cover letter',
    type: CoverLetter
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Cover Letter ID',
    type: 'string',
    format: 'uuid'
  })
  findOne(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.coverLetterService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a cover letter',
    description: 'Updates a cover letter if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Cover letter successfully updated',
    type: CoverLetter
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Cover Letter ID',
    type: 'string',
    format: 'uuid'
  })
  update(
    @Param('id', UUIDValidationPipe) id: string,
    @Request() req,
    @Body() updateCoverLetterDto: UpdateCoverLetterDto
  ) {
    return this.coverLetterService.update(id, req.user.id, updateCoverLetterDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a cover letter',
    description: 'Deletes a cover letter if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Cover letter successfully deleted'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Cover Letter ID',
    type: 'string',
    format: 'uuid'
  })
  remove(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.coverLetterService.remove(id, req.user.id);
  }
}