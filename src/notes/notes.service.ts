import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  async create(createNoteDto: CreateNoteDto, user: User): Promise<Note> {
    const note = this.noteRepository.create({
      ...createNoteDto,
      user,
    });
    await this.noteRepository.save(note);
    const { user: _, ...result } = note;
    return result;
  }

  async findAll(user: User): Promise<Note[]> {
    return await this.noteRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        name: true,
        text: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string, user: User): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id, user: { id: user.id } },
      select: {
        id: true,
        name: true,
        text: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    user: User,
  ): Promise<Note> {
    const note = await this.findOne(id, user);
    Object.assign(note, updateNoteDto);
    await this.noteRepository.save(note);
    const { user: _, ...result } = note;
    return result;
  }

  async remove(id: string, user: User): Promise<void> {
    const note = await this.findOne(id, user);
    await this.noteRepository.remove(note);
  }
}
