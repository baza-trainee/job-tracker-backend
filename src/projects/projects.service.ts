import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(userId: string, createProjectDto: CreateProjectDto) {
    try {
      const project = this.projectRepository.create({
        ...createProjectDto,
        userId,
      });

      return await this.projectRepository.save(project);
    } catch (error) {
      if (error?.code === '23505') { // Unique constraint violation
        throw new BadRequestException('A project with this name already exists');
      }
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async findAll(userId: string) {
    try {
      return await this.projectRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch projects');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id, userId },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch project');
    }
  }

  async update(id: string, userId: string, updateProjectDto: UpdateProjectDto) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id, userId },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      Object.assign(project, updateProjectDto);
      
      return await this.projectRepository.save(project);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error?.code === '23505') { // Unique constraint violation
        throw new BadRequestException('A project with this name already exists');
      }
      throw new InternalServerErrorException('Failed to update project');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id, userId },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      await this.projectRepository.remove(project);
      return { message: 'Project successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete project');
    }
  }
}
