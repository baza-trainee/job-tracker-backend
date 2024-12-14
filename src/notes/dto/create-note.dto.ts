import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ description: 'Note name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Note text content', required: false })
  @IsString()
  @IsOptional()
  text?: string;
}
