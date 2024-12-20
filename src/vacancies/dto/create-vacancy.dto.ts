import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { WorkType } from '../entities/vacancy.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVacancyDto {
  @ApiProperty({ 
    description: 'Vacancy title/position',
    example: 'Senior TypeScript Developer'
  })
  @IsString()
  @IsNotEmpty()
  vacancy: string;

  @ApiProperty({ 
    description: 'Link to the vacancy posting',
    example: 'https://example.com/job-posting'
  })
  @IsString()
  @IsUrl({}, { message: 'Invalid URL format for vacancy link' })
  @IsNotEmpty()
  link: string;

  @ApiProperty({ 
    description: 'Communication details (email, phone, contact person)',
    required: false,
    example: 'Contact John Doe at john@company.com'
  })
  @IsString()
  @IsOptional()
  communication?: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty({ description: 'Location of the job' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ 
    description: 'Type of work',
    enum: WorkType,
    example: 'remote',
    enumName: 'WorkType'
  })
  @IsEnum(WorkType)
  @IsNotEmpty()
  work_type: WorkType;

  @ApiProperty({ description: 'Additional notes (optional)', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
