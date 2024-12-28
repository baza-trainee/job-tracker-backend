import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resume } from './entities/resume.entity';

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
  ) { }

  private sanitizeResume(resume: Resume) {
    const { user, ...resumeWithoutUser } = resume;
    return resumeWithoutUser;
  }

  private isValidLink = (link: string): boolean => {
    try {
      const url = new URL(link);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  };

  async create(createResumeDto: CreateResumeDto, userId: string): Promise<Resume> {
    try {
      if (!this.isValidLink(createResumeDto.link)) {
        throw new BadRequestException('Invalid link format');
      }

      const resume = this.resumeRepository.create({
        ...createResumeDto,
        user: { id: userId },
      });

      const savedResume = await this.resumeRepository.save(resume);
      return this.sanitizeResume(savedResume);
    } catch (error) {
      if (error?.code === '23505') {
        throw new BadRequestException('A resume with this name already exists');
      }
      throw new BadRequestException('Failed to create resume');
    }
  }

  async findAll(userId: string): Promise<Resume[]> {
    try {
      const resumes = await this.resumeRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        select: {
          id: true,
          name: true,
          link: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return resumes;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch resumes');
    }
  }

  async findOne(id: string, userId: string): Promise<Resume> {
    try {
      if (!id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        throw new BadRequestException('Invalid resume ID format');
      }

      const resume = await this.resumeRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['user'],
        select: {
          id: true,
          name: true,
          link: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!resume) {
        throw new NotFoundException('Resume not found');
      }

      if (resume.user.id !== userId) {
        throw new ForbiddenException('You can only access your own resumes');
      }

      return this.sanitizeResume(resume);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch resume');
    }
  }

  async update(id: string, userId: string, updateResumeDto: UpdateResumeDto) {
    try {
      const resume = await this.resumeRepository.findOne({
        where: { id },
        relations: { user: true },
      });

      if (!resume) {
        throw new NotFoundException('Resume not found');
      }

      if (resume.user.id !== userId) {
        throw new ForbiddenException('You can only update your own resumes');
      }

      if (updateResumeDto.link && !this.isValidLink(updateResumeDto.link)) {
        throw new BadRequestException('Invalid link format');
      }

      // Check if the update DTO is empty (no fields provided)
      if (Object.keys(updateResumeDto).length === 0) {
        throw new BadRequestException('At least one field must be provided for update');
      }

      // Check if all provided fields are empty strings
      const hasNonEmptyField = Object.values(updateResumeDto).some(
        value => value !== undefined && value !== '',
      );

      if (!hasNonEmptyField) {
        throw new BadRequestException('At least one field must have a non-empty value');
      }

      Object.assign(resume, updateResumeDto);
      const savedResume = await this.resumeRepository.save(resume);
      const { user, ...resumeWithoutUser } = savedResume;
      return resumeWithoutUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update resume');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const resume = await this.resumeRepository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!resume) {
        throw new NotFoundException('Resume not found');
      }

      if (resume.user.id !== userId) {
        throw new ForbiddenException('You can only delete your own resumes');
      }

      await this.resumeRepository.remove(resume);
      return { message: 'Resume successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete resume');
    }
  }
}
