import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateResumeDto {
  @ApiProperty({ description: 'Resume name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Resume link/URL' })
  @IsNotEmpty()
  @IsString()
  link: string;
}
