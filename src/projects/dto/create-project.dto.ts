import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'GitHub repository link',
    example: 'https://github.com/username/repository'
  })
  @IsNotEmpty()
  @IsUrl({}, {
    message: 'GitHub link must be a valid URL',
  })
  githubLink: string;

  @ApiProperty({
    description: 'Live project URL',
    example: 'https://my-project.com'
  })
  @IsNotEmpty()
  @IsUrl({}, {
    message: 'Live project link must be a valid URL',
  })
  liveProjectLink: string;
}
