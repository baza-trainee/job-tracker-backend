import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
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
    private readonly noteRepository: Repository<Note>,
  ) { }

  private sanitizeNote(note: Note) {
    const { user, ...noteWithoutUser } = note;
    return noteWithoutUser;
  }

  async create(createNoteDto: CreateNoteDto, user: User) {
    try {
      const note = this.noteRepository.create({
        ...createNoteDto,
        user,
      });

      const savedNote = await this.noteRepository.save(note);
      return this.sanitizeNote(savedNote);
    } catch (error) {
      throw new BadRequestException('Failed to create note');
    }
  }

  async findAll(userId: string) {
    try {
      const notes = await this.noteRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        select: {
          id: true,
          name: true,
          text: true,
          createdAt: true,
        },
      });
      return notes;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch notes');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      if (!id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        throw new BadRequestException('Invalid note ID format');
      }

      const note = await this.noteRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['user'],
        select: {
          id: true,
          name: true,
          text: true,
          createdAt: true,
        },
      });

      if (!note) {
        throw new NotFoundException('Note not found');
      }

      if (note.user.id !== userId) {
        throw new ForbiddenException('You can only access your own notes');
      }

      return this.sanitizeNote(note);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch the note');
    }
  }

  async update(id: string, userId: string, updateNoteDto: UpdateNoteDto) {
    try {
      if (Object.keys(updateNoteDto).length === 0) {
        throw new BadRequestException('At least one field must be provided for update');
      }

      const note = await this.noteRepository.findOne({
        where: { id, user: { id: userId } },
      });

      if (!note) {
        throw new NotFoundException('Note not found');
      }

      Object.assign(note, updateNoteDto);
      const savedNote = await this.noteRepository.save(note);
      return {
        result: this.sanitizeNote(savedNote),
        message: 'Note successfully updated'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error?.code === '23505') {
        throw new BadRequestException('A note with this name already exists');
      }
      throw new InternalServerErrorException('Failed to update note');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const note = await this.noteRepository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!note) {
        throw new NotFoundException('Note not found');
      }

      if (note.user.id !== userId) {
        throw new ForbiddenException('You can only delete your own notes');
      }

      await this.noteRepository.remove(note);
      return { message: 'Note successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete the note');
    }
  }
}
