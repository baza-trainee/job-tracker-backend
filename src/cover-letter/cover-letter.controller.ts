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
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoverLetterService } from './cover-letter.service';
import { CreateCoverLetterDto } from './dto/create-cover-letter.dto';
import { UpdateCoverLetterDto } from './dto/update-cover-letter.dto';
import { CoverLetter } from './entities/cover-letter.entity';

@ApiTags('Cover-letter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cover-letter')
export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new cover letter' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The cover letter has been successfully created.',
    type: CoverLetter,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  create(@Body() createCoverLetterDto: CreateCoverLetterDto, @Request() req) {
    return this.coverLetterService.create(req.user.id, createCoverLetterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cover letters for the current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns an array of cover letters.',
    type: [CoverLetter],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  findAll(@Request() req) {
    return this.coverLetterService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific cover letter by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the cover letter.',
    type: CoverLetter,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cover letter not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.coverLetterService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a cover letter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The cover letter has been successfully updated.',
    type: CoverLetter,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cover letter not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  update(
    @Param('id') id: string,
    @Body() updateCoverLetterDto: UpdateCoverLetterDto,
    @Request() req,
  ) {
    return this.coverLetterService.update(id, req.user.id, updateCoverLetterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cover letter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The cover letter has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cover letter not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.coverLetterService.remove(id, req.user.id);
  }
}
