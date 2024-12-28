import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoverLetter } from './entities/cover-letter.entity';
import { CreateCoverLetterDto } from './dto/create-cover-letter.dto';
import { UpdateCoverLetterDto } from './dto/update-cover-letter.dto';

@Injectable()
export class CoverLetterService {
  constructor(
    @InjectRepository(CoverLetter)
    private readonly coverLetterRepository: Repository<CoverLetter>,
  ) { }

  async create(userId: string, createCoverLetterDto: CreateCoverLetterDto) {
    try {
      const coverLetter = this.coverLetterRepository.create({
        ...createCoverLetterDto,
        userId,
      });

      return await this.coverLetterRepository.save(coverLetter);
    } catch (error) {
      if (error?.code === '23505') {
        throw new BadRequestException('A cover letter with this name already exists');
      }
      throw new BadRequestException('Failed to create cover letter');
    }
  }

  async findAll(userId: string) {
    try {
      const coverLetters = await this.coverLetterRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      return coverLetters;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch cover letters');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      if (!id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        throw new BadRequestException('Invalid cover letter ID format');
      }

      const coverLetter = await this.coverLetterRepository.findOne({
        where: { id, userId },
      });

      if (!coverLetter) {
        throw new NotFoundException('Cover letter not found');
      }

      return coverLetter;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch the cover letter');
    }
  }

  async update(id: string, userId: string, updateCoverLetterDto: UpdateCoverLetterDto) {
    try {
      if (Object.keys(updateCoverLetterDto).length === 0) {
        throw new BadRequestException('At least one field must be provided for update');
      }

      const coverLetter = await this.coverLetterRepository.findOne({
        where: { id, userId },
      });

      if (!coverLetter) {
        throw new NotFoundException('Cover letter not found');
      }

      Object.assign(coverLetter, updateCoverLetterDto);

      return await this.coverLetterRepository.save(coverLetter);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error?.code === '23505') {
        throw new BadRequestException('A cover letter with this name already exists');
      }
      throw new InternalServerErrorException('Failed to update cover letter');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const coverLetter = await this.coverLetterRepository.findOne({
        where: { id, userId },
      });

      if (!coverLetter) {
        throw new NotFoundException('Cover letter not found');
      }

      await this.coverLetterRepository.remove(coverLetter);
      return { message: 'Cover letter successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete cover letter');
    }
  }
}
