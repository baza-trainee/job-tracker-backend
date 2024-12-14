import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resume } from './entities/resume.entity';

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
  ) {}

  async create(createResumeDto: CreateResumeDto, userId: string): Promise<Resume> {
    const resume = this.resumeRepository.create({
      ...createResumeDto,
      user: { id: userId },
    });
    await this.resumeRepository.save(resume);
    const { user: _, ...result } = resume;
    return result;
  }

  async findAll(userId: string): Promise<Resume[]> {
    return await this.resumeRepository.find({
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
  }

  async findOne(id: string, userId: string): Promise<Resume> {
    const resume = await this.resumeRepository.findOne({
      where: { id, user: { id: userId } },
      select: {
        id: true,
        name: true,
        link: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }
    return resume;
  }

  async update(
    id: string,
    updateResumeDto: UpdateResumeDto,
    userId: string,
  ): Promise<Resume> {
    const resume = await this.findOne(id, userId);
    Object.assign(resume, updateResumeDto);
    await this.resumeRepository.save(resume);
    const { user: _, ...result } = resume;
    return result;
  }

  async remove(id: string, userId: string) {
    const resume = await this.findOne(id, userId);
    return this.resumeRepository.remove(resume);
  }
}
