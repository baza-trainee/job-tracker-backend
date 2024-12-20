import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateResumeDto {
  @ApiProperty({ 
    description: 'Resume name/title',
    example: 'Senior Developer Resume 2024'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Resume link/URL',
    example: 'https://example.com/my-resume.pdf'
  })
  @IsNotEmpty()
  @IsUrl({}, { message: 'Invalid URL format for resume link' })
  link: string;
}
