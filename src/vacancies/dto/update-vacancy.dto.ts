import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';
import { CreateVacancyDto } from './create-vacancy.dto';

export class UpdateVacancyDto extends PartialType(CreateVacancyDto) {
  @ApiProperty({ description: 'Vacancy name', required: false })
  @IsOptional()
  @ValidateIf((o) => !o.companyName && !o.description && !o.link)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Company name', required: false })
  @IsOptional()
  @ValidateIf((o) => !o.name && !o.description && !o.link)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsString()
  companyName?: string;

  @ApiProperty({ description: 'Vacancy description', required: false })
  @IsOptional()
  @ValidateIf((o) => !o.name && !o.companyName && !o.link)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Vacancy link', required: false })
  @IsOptional()
  @ValidateIf((o) => !o.name && !o.companyName && !o.description)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsUrl({}, { message: 'Invalid URL format for vacancy link' })
  link?: string;
}
