import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
  ) {}

  async create(userId: string, createCoverLetterDto: CreateCoverLetterDto) {
    try {
      const coverLetter = this.coverLetterRepository.create({
        ...createCoverLetterDto,
        userId,
      });

      return await this.coverLetterRepository.save(coverLetter);
    } catch (error) {
      if (error?.code === '23505') { // Unique constraint violation
        throw new BadRequestException('A cover letter with this name already exists');
      }
      throw new InternalServerErrorException('Failed to create cover letter');
    }
  }

  async findAll(userId: string) {
    try {
      return await this.coverLetterRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch cover letters');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const coverLetter = await this.coverLetterRepository.findOne({
        where: { id, userId },
      });

      if (!coverLetter) {
        throw new NotFoundException('Cover letter not found');
      }

      return coverLetter;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch cover letter');
    }
  }

  async update(id: string, userId: string, updateCoverLetterDto: UpdateCoverLetterDto) {
    try {
      const coverLetter = await this.coverLetterRepository.findOne({
        where: { id, userId },
      });

      if (!coverLetter) {
        throw new NotFoundException('Cover letter not found');
      }

      Object.assign(coverLetter, updateCoverLetterDto);
      
      return await this.coverLetterRepository.save(coverLetter);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error?.code === '23505') { // Unique constraint violation
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
