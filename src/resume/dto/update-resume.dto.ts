import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateResumeDto } from './create-resume.dto';
import { IsNotEmpty, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';

export class UpdateResumeDto extends PartialType(CreateResumeDto) {
  @ApiProperty({ description: 'Resume name', required: false })
  @IsOptional()
  @ValidateIf((o) => !o.link)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Resume link', required: false })
  @IsOptional()
  @ValidateIf((o) => !o.name)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsUrl({}, { message: 'Invalid URL format for resume link' })
  link?: string;
}
