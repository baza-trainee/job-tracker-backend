import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCoverLetterDto {
  @ApiProperty({ description: 'Cover letter name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Cover letter text content' })
  @IsNotEmpty()
  @IsString()
  text: string;
}
