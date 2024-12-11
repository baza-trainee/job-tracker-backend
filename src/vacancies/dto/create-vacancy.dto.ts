import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WorkType } from '../entities/vacancy.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVacancyDto {
  @ApiProperty({ description: 'Vacancy title/position' })
  @IsString()
  @IsNotEmpty()
  vacancy: string;

  @ApiProperty({ description: 'Link to the vacancy' })
  @IsString()
  @IsNotEmpty()
  link: string;

  @ApiProperty({ description: 'Communication details (optional)', required: false })
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
