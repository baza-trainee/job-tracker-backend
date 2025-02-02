import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsNotEmpty, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.link && !o.technologies && !o.description)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  name?: string;

  @IsOptional()
  @ValidateIf((o) => !o.name && !o.technologies && !o.description)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsUrl({}, {
    message: 'Project link must be a valid URL',
  })
  link?: string;
}
