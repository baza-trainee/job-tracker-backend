import { PartialType } from '@nestjs/swagger';
import { CreateNoteDto } from './create-note.dto';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.text)
  @IsNotEmpty({ message: 'At least one field (name or text) must be provided' })
  name?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.name)
  @IsNotEmpty({ message: 'At least one field (name or text) must be provided' })
  text?: string;
}
