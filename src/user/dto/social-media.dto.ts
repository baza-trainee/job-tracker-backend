import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, MaxLength } from 'class-validator';

export class SocialMediaDto {
  @ApiProperty({
    description: 'Name of the social media platform',
    maxLength: 30
  })
  @IsString()
  @MaxLength(30, { message: 'Name must not be longer than 30 characters' })
  name: string;

  @ApiProperty({ description: 'Link to the social media profile' })
  @IsString()
  @IsUrl({}, { message: 'Invalid URL format' })
  link: string;
}
