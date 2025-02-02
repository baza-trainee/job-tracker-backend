import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional } from 'class-validator';

export class UpdateSocialMediaDto {
  @ApiProperty({ 
    description: 'Link to the social media profile'
  })
  @IsString()
  @IsUrl({}, { message: 'Invalid URL format' })
  link: string;
}
