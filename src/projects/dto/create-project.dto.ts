import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'GitHub repository link' })
  @IsNotEmpty()
  @IsUrl()
  githubLink: string;

  @ApiProperty({ description: 'Live project URL' })
  @IsNotEmpty()
  @IsUrl()
  liveProjectLink: string;
}
