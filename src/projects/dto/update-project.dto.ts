import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({ description: 'Project name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'GitHub repository link', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'GitHub link must be a valid URL' })
  githubLink?: string;

  @ApiProperty({ description: 'Live project URL', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'Live project link must be a valid URL' })
  liveProjectLink?: string;
}
