import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Project link',
    example: 'https://github.com/username/repository'
  })
  @IsNotEmpty()
  @IsUrl({}, {
    message: 'Project link must be a valid URL',
  })
  link: string;

  @ApiProperty({ description: 'Project technologies' })
  @IsNotEmpty()
  @IsString()
  technologies: string;

  @ApiProperty({ description: 'Project description' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
