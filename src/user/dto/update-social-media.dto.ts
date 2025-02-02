import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional } from 'class-validator';

export class UpdateSocialMediaDto {
  @ApiProperty({ 
    description: 'Name of the social media platform'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    description: 'Link to the social media profile'
  })
  @IsString()
  @IsUrl({}, { message: 'Invalid URL format' })
  link: string;
}
