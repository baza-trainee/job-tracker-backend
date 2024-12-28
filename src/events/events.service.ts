import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) { }

  private sanitizeEvent(event: Event) {
    const { user, ...eventWithoutUser } = event;
    return eventWithoutUser;
  }

  async create(createEventDto: CreateEventDto, userId: string) {
    try {
      const event = this.eventRepository.create({
        ...createEventDto,
        user: { id: userId },
      });

      const savedEvent = await this.eventRepository.save(event);
      return this.sanitizeEvent(savedEvent);
    } catch (error) {
      throw new BadRequestException('Failed to create event');
    }
  }

  async findAll(userId: string) {
    try {
      const events = await this.eventRepository.find({
        where: { user: { id: userId } },
        order: { date: 'ASC', time: 'ASC' },
        select: {
          id: true,
          name: true,
          text: true,
          date: true,
          time: true,
          createdAt: true,
        },
      });
      return events;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch events');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      if (!id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        throw new BadRequestException('Invalid event ID format');
      }

      const event = await this.eventRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['user'],
        select: {
          id: true,
          name: true,
          text: true,
          date: true,
          time: true,
          createdAt: true,
        },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.user.id !== userId) {
        throw new ForbiddenException('You can only access your own events');
      }

      return this.sanitizeEvent(event);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch the event');
    }
  }

  async update(id: string, userId: string, updateEventDto: UpdateEventDto) {
    try {
      if (Object.keys(updateEventDto).length === 0) {
        throw new BadRequestException('At least one field must be provided for update');
      }

      const event = await this.eventRepository.findOne({
        where: { id, user: { id: userId } },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      Object.assign(event, updateEventDto);
      const savedEvent = await this.eventRepository.save(event);
      return {
        result: this.sanitizeEvent(savedEvent),
        message: 'Event successfully updated'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error?.code === '23505') {
        throw new BadRequestException('An event with this name already exists');
      }
      throw new InternalServerErrorException('Failed to update event');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const event = await this.eventRepository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.user.id !== userId) {
        throw new ForbiddenException('You can only delete your own events');
      }

      await this.eventRepository.remove(event);
      return { message: 'Event successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete the event');
    }
  }
}
