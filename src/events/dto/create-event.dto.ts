import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString, Matches } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'Event name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Event text content', required: false })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ description: 'Event date', example: '2024-12-14' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Event time', example: '14:30' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm',
  })
  time: string;
}
