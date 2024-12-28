import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Event } from './entities/event.entity';
import { UUIDValidationPipe } from '../common/pipes/uuid-validation.pipe';

@ApiTags('Events')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new event',
    description: 'Creates a new event for the authenticated user'
  })
  @ApiResponse({
    status: 201,
    description: 'Event successfully created',
    type: Event
  })
  create(@Request() req, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all events',
    description: 'Returns all events for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all events',
    type: [Event]
  })
  findAll(@Request() req) {
    return this.eventsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an event by id',
    description: 'Returns a specific event if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the event',
    type: Event
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
    type: 'string',
    format: 'uuid'
  })
  findOne(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.eventsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an event',
    description: 'Updates an event if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Event successfully updated',
    type: Event
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
    type: 'string',
    format: 'uuid'
  })
  update(
    @Param('id', UUIDValidationPipe) id: string,
    @Request() req,
    @Body() updateEventDto: UpdateEventDto
  ) {
    return this.eventsService.update(id, req.user.id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an event',
    description: 'Deletes an event if it belongs to the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Event successfully deleted'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format'
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
    type: 'string',
    format: 'uuid'
  })
  remove(@Param('id', UUIDValidationPipe) id: string, @Request() req) {
    return this.eventsService.remove(id, req.user.id);
  }
}
