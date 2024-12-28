import { PartialType } from '@nestjs/swagger';
import { CreateCoverLetterDto } from './create-cover-letter.dto';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateCoverLetterDto extends PartialType(CreateCoverLetterDto) {
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
