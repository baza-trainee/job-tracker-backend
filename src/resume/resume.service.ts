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

  create(createResumeDto: CreateResumeDto, userId: string) {
    const resume = this.resumeRepository.create({
      ...createResumeDto,
      userId,
    });
    return this.resumeRepository.save(resume);
  }

  findAll(userId: string) {
    return this.resumeRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const resume = await this.resumeRepository.findOne({
      where: { id, userId },
    });
    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }
    return resume;
  }

  async update(id: string, updateResumeDto: UpdateResumeDto, userId: string) {
    const resume = await this.findOne(id, userId);
    Object.assign(resume, updateResumeDto);
    return this.resumeRepository.save(resume);
  }

  async remove(id: string, userId: string) {
    const resume = await this.findOne(id, userId);
    return this.resumeRepository.remove(resume);
  }
}
