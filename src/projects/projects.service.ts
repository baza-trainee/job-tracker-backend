import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  HttpException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) { }

  async create(createProjectDto: CreateProjectDto, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    try {
      const project = this.projectRepository.create({
        ...createProjectDto,
        userId,
      });

      const savedProject = await this.projectRepository.save(project);

      return {
        message: 'Project created successfully',
        project: savedProject
      };
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new BadRequestException('A project with this name already exists');
      }
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async findAll(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    try {
      const projects = await this.projectRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      return {
        message: 'Projects retrieved successfully',
        projects,
        count: projects.length
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch projects');
    }
  }

  async findOne(id: string, userId: string) {
    if (!id) {
      throw new BadRequestException('Project ID is required');
    }

    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    try {
      const project = await this.projectRepository.findOne({
        where: { id, userId },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      return {
        message: 'Project retrieved successfully',
        project
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch project');
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    if (!id) {
      throw new BadRequestException('Project ID is required');
    }

    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    if (Object.keys(updateProjectDto).length === 0) {
      throw new BadRequestException('No update data provided');
    }

    try {
      const project = await this.findOne(id, userId);

      if (project.project.userId !== userId) {
        throw new UnauthorizedException('You can only update your own projects');
      }

      // Check if name is being updated and if it's already taken
      if (updateProjectDto.name) {
        const existingProject = await this.projectRepository.findOne({
          where: {
            name: updateProjectDto.name,
            userId,
            id: Not(id) // Exclude current project
          }
        });

        if (existingProject) {
          throw new BadRequestException('A project with this name already exists');
        }
      }

      // Validate URLs if they are being updated
      if (updateProjectDto.githubLink && !isValidUrl(updateProjectDto.githubLink)) {
        throw new BadRequestException('Invalid GitHub URL');
      }

      if (updateProjectDto.liveProjectLink && !isValidUrl(updateProjectDto.liveProjectLink)) {
        throw new BadRequestException('Invalid live project URL');
      }

      const updatedProject = await this.projectRepository.save({
        ...project.project,
        ...updateProjectDto,
      });

      return {
        message: 'Project updated successfully',
        project: updatedProject
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update project');
    }
  }

  async remove(id: string, userId: string) {
    if (!id) {
      throw new BadRequestException('Project ID is required');
    }

    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    try {
      const project = await this.findOne(id, userId);

      if (project.project.userId !== userId) {
        throw new UnauthorizedException('You can only delete your own projects');
      }

      await this.projectRepository.remove(project.project);

      return {
        message: 'Project deleted successfully',
        id
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete project');
    }
  }
}

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
