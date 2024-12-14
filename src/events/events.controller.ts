import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Event } from './entities/event.entity';

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
    status: HttpStatus.CREATED, 
    description: 'Event successfully created',
    type: Event 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized - valid JWT token required' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data provided' 
  })
  create(@Request() req, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all events for the current user',
    description: 'Returns all events belonging to the authenticated user, ordered by creation date'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns all events',
    type: [Event] 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized - valid JWT token required' 
  })
  findAll(@Request() req) {
    return this.eventsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a specific event',
    description: 'Returns a specific event by ID if it belongs to the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the event',
    type: Event 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Event not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized - valid JWT token required' 
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.eventsService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update an event',
    description: 'Updates an event if it belongs to the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Event successfully updated',
    type: Event 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Event not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data provided' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized - valid JWT token required' 
  })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete an event',
    description: 'Deletes an event if it belongs to the authenticated user'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Event successfully deleted' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Event not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized - valid JWT token required' 
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.eventsService.remove(id, req.user.id);
  }
}
