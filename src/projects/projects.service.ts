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

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    try {
      const project = this.projectRepository.create({
        ...createProjectDto,
        user: { id: userId },
      });
      await this.projectRepository.save(project);
      const { user: _, ...result } = project;
      return result;
    } catch (error) {
      if (error?.code === '23505') { // Unique constraint violation
        throw new BadRequestException('A project with this name already exists');
      }
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async findAll(userId: string): Promise<Project[]> {
    try {
      return await this.projectRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        select: {
          id: true,
          name: true,
          githubLink: true,
          liveProjectLink: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch projects');
    }
  }

  async findOne(id: string, userId: string): Promise<Project> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id, user: { id: userId } },
        select: {
          id: true,
          name: true,
          githubLink: true,
          liveProjectLink: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch project');
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    try {
      const project = await this.findOne(id, userId);
      Object.assign(project, updateProjectDto);
      await this.projectRepository.save(project);
      const { user: _, ...result } = project;
      return result;
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
        where: { id, user: { id: userId } },
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
