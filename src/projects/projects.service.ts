import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
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
  ) { }

  private sanitizeProject(project: Project) {
    const { user, ...projectWithoutUser } = project;
    return projectWithoutUser;
  }

  private isValidGitHubLink = (githubLink: string): boolean => {
    const githubLinkRegex = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+(\/[A-Za-z0-9_.-]+)?(\/)?$/;
    return githubLinkRegex.test(githubLink);
  };

  private isValidLink = (link: string): boolean => {
    try {
      const url = new URL(link);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  };

  async create(createProjectDto: CreateProjectDto, userId: string) {
    try {

      if (!this.isValidGitHubLink(createProjectDto.githubLink)) {
        throw new BadRequestException('Invalid GitHub link format');
      }

      if (!this.isValidLink(createProjectDto.liveProjectLink)) {
        throw new BadRequestException('Invalid live project link format');
      }

      const project = this.projectRepository.create({
        ...createProjectDto,
        user: { id: userId },
      });

      const savedProject = await this.projectRepository.save(project);
      return this.sanitizeProject(savedProject);
    } catch (error) {
      if (error?.code === '23505') {
        throw new BadRequestException('A project with this name already exists');
      }
      throw new BadRequestException('Failed to create project');
    }
  }

  async findAll(userId: string) {
    try {
      const projects = await this.projectRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        select: {
          id: true,
          name: true,
          githubLink: true,
          liveProjectLink: true,
          createdAt: true,
        },
      });
      return projects;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch projects');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      if (!id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        throw new BadRequestException('Invalid project ID format');
      }

      const project = await this.projectRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['user'],
        select: {
          id: true,
          name: true,
          githubLink: true,
          liveProjectLink: true,
          createdAt: true,
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.user.id !== userId) {
        throw new ForbiddenException('You can only access your own projects');
      }

      return this.sanitizeProject(project);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch the project');
    }
  }

  async update(id: string, userId: string, updateProjectDto: UpdateProjectDto) {
    try {
      if (Object.keys(updateProjectDto).length === 0) {
        throw new BadRequestException('At least one field must be provided for update');
      }

      const project = await this.projectRepository.findOne({
        where: { id, user: { id: userId } },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (Object.keys(updateProjectDto).length === 0) {
        throw new BadRequestException('At least one field must be provided for update');
      }

      const hasNonEmptyField = Object.values(updateProjectDto).some(
        value => value !== undefined && value !== '',
      );

      if (!hasNonEmptyField) {
        throw new BadRequestException('At least one field must have a non-empty value');
      }

      if (updateProjectDto.githubLink && !this.isValidGitHubLink(updateProjectDto.githubLink)) {
        throw new BadRequestException('Invalid GitHub link format');
      }

      if (updateProjectDto.liveProjectLink && !this.isValidLink(updateProjectDto.liveProjectLink)) {
        throw new BadRequestException('Invalid live project link format');
      }

      Object.assign(project, updateProjectDto);
      const savedProject = await this.projectRepository.save(project);

      return {
        result: this.sanitizeProject(savedProject),
        message: 'Project successfully updated'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error?.code === '23505') {
        throw new BadRequestException('A project with this name already exists');
      }
      throw new InternalServerErrorException('Failed to update project');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id },
        relations: ['user']
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.user.id !== userId) {
        throw new ForbiddenException('You can only delete your own projects');
      }

      await this.projectRepository.remove(project);
      return { message: 'Project successfully deleted' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete the project');
    }
  }
}
