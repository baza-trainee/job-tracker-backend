import { Injectable, NotFoundException } from '@nestjs/common';
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
    private eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, user: User): Promise<Event> {
    const event = this.eventRepository.create({
      ...createEventDto,
      user,
    });
    await this.eventRepository.save(event);
    const { user: _, ...result } = event;
    return result;
  }

  async findAll(user: User): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { user: { id: user.id } },
      order: { date: 'ASC', time: 'ASC' },
      select: {
        id: true,
        name: true,
        text: true,
        date: true,
        time: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string, user: User): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id, user: { id: user.id } },
      select: {
        id: true,
        name: true,
        text: true,
        date: true,
        time: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    user: User,
  ): Promise<Event> {
    const event = await this.findOne(id, user);
    Object.assign(event, updateEventDto);
    await this.eventRepository.save(event);
    const { user: _, ...result } = event;
    return result;
  }

  async remove(id: string, user: User): Promise<void> {
    const event = await this.findOne(id, user);
    await this.eventRepository.remove(event);
  }
}
