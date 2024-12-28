import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import { IsDateString, IsNotEmpty, IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.text && !o.date && !o.time)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  name?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.name && !o.date && !o.time)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  text?: string;

  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => !o.name && !o.text && !o.time)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in format HH:mm',
  })
  @ValidateIf((o) => !o.name && !o.text && !o.date)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  time?: string;
}
