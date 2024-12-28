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
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Note } from './entities/note.entity';
import { UUIDValidationPipe } from '../common/pipes/uuid-validation.pipe';

@ApiTags('Notes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new note',
    description: 'Creates a new note for the authenticated user'
  })
  @ApiResponse({
    status: 201,
    description: 'Note successfully created',
    type: Note
  })
  create(@Request() req, @Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(createNoteDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all notes',
    description: 'Returns all notes for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all notes',
    type: [Note]
  })
  findAll(@Request() req) {
    return this.notesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a note by id',
    description: 'Returns a specific note if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the note',
    type: Note
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Note ID',
    type: 'string',
    format: 'uuid'
  })
  findOne(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.notesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a note',
    description: 'Updates a note if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Note successfully updated',
    type: Note
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Note ID',
    type: 'string',
    format: 'uuid'
  })
  update(
    @Param('id', UUIDValidationPipe) id: string,
    @Request() req,
    @Body() updateNoteDto: UpdateNoteDto
  ) {
    return this.notesService.update(id, req.user.id, updateNoteDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a note',
    description: 'Deletes a note if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Note successfully deleted'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Note ID',
    type: 'string',
    format: 'uuid'
  })
  remove(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.notesService.remove(id, req.user.id);
  }
}
