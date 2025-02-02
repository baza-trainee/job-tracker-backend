import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsNotEmpty, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.githubLink && !o.liveProjectLink && !o.technologies && !o.description)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  name?: string;

  @IsOptional()
  @ValidateIf((o) => !o.name && !o.liveProjectLink && !o.technologies && !o.description)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsUrl({}, {
    message: 'GitHub link must be a valid URL',
  })
  githubLink?: string;

  @IsOptional()
  @ValidateIf((o) => !o.name && !o.githubLink && !o.technologies && !o.description)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsUrl({}, {
    message: 'Live project link must be a valid URL',
  })
  liveProjectLink?: string;
}
